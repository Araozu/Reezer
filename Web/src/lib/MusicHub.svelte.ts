import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import * as SignalR from "@microsoft/signalr";
import { BACKEND_URL } from "~/env";
import { CalculateVariance, CalculateMedian, CalculateStandardDeviation, type SyncResult, type SyncMeasurement } from "./sync-utils";
import type { HeadlessMusicPlayer } from "~/player/HeadlessMusicPlayer.svelte";
import type { ISong } from "~/providers";

// Time synchronization constants
const INITIAL_SYNC_SAMPLES = 20;
const BACKGROUND_SYNC_SAMPLES = 5;
const SYNC_SAMPLE_DELAY_MS = 500;
const PERIODIC_SYNC_INTERVAL_MS = 30000; // 30 seconds
const BEST_SAMPLES_PERCENTAGE = 0.5; // Use best 50% of samples
const MIN_SAMPLE_COUNT = 3;

// Accuracy thresholds
const HIGH_ACCURACY_RTT_THRESHOLD = 30; // ms
const HIGH_ACCURACY_RTT_STDDEV = 5; // ms
const HIGH_ACCURACY_OFFSET_STDDEV = 3; // ms
const MEDIUM_ACCURACY_RTT_THRESHOLD = 100; // ms
const MEDIUM_ACCURACY_RTT_STDDEV = 20; // ms
const MEDIUM_ACCURACY_OFFSET_STDDEV = 10; // ms

export interface SyncResponse {
  serverReceiveTime: number;
  serverSendTime: number;
}

export interface PlayerState {
  currentSongId: string | null;
}

export class MusicHub
{
	private connection: SignalR.HubConnection | null = null;
	public connected = $state(false);
	private musicPlayer: HeadlessMusicPlayer | null = null;
	public clientId: string | null = null;
	private syncIntervalId: number | null = null;
	private currentSyncResult: SyncResult | null = null;

	constructor(private readonly hubUrl = `${BACKEND_URL}/api/hubs/music`)
	{}

	public setPlayer(p: HeadlessMusicPlayer)
	{
		this.musicPlayer = p;
	}

	async connect(): Promise<void>
	{
		if (this.connection?.state === "Connected")
		{
			return;
		}

		this.connection = new HubConnectionBuilder()
			.withUrl(this.hubUrl)
			.withAutomaticReconnect()
			.configureLogging(LogLevel.Error)
			.build();

		await this.connection.start();
		this.clientId = await this.connection.invoke<string>("GeneratePlayerId");
		this.connection.on("PlaySong", this.ReceivePlaySong.bind(this));
		this.connected = true;
	}

	async disconnect(): Promise<void>
	{
		if (this.syncIntervalId !== null)
		{
			clearInterval(this.syncIntervalId);
			this.syncIntervalId = null;
		}
		if (this.connection)
		{
			await this.connection.stop();
			this.connection = null;
		}
	}

	async getPlayerState(): Promise<PlayerState>
	{
		if (!this.connection || this.connection.state !== "Connected")
		{
			await this.connect();
		}

		return await this.connection!.invoke("GetPlayerState");
	}

	async playSong(song: ISong)
	{
		await this.connection!.invoke("PlaySong", this.clientId, song);
	}

	async ReceivePlaySong(clientId: string, song: ISong)
	{
		if (clientId === this.clientId) return;

		this.musicPlayer?.PlaySong(song, true);
	}

	/**
	  * Performs NTP-like synchronization with the server using improved algorithms
	  * @param samples Number of round-trip measurements to take (default: 20)
	  * @param startPeriodicSync Whether to start background periodic sync after initial sync
	  * @returns Synchronization result with round-trip time and clock offset
	  */
	async synchronize(samples = INITIAL_SYNC_SAMPLES, startPeriodicSync = true): Promise<SyncResult>
	{
		if (!this.connection || this.connection.state !== "Connected")
		{
			await this.connect();
		}

		const measurements: SyncMeasurement[] = [];

		// Take multiple samples with longer delays for better network variance capture
		for (let i = 0; i < samples; i += 1)
		{
			try
			{
				const result = await this.performSingleSync();
				measurements.push(result);

				// Longer delay between samples to capture network variance
				if (i < samples - 1)
				{
					await new Promise((resolve) => setTimeout(resolve, SYNC_SAMPLE_DELAY_MS));
				}
			}
			catch (error)
			{
				console.warn(`Sync sample ${i + 1} failed:`, error);
			}
		}

		if (measurements.length === 0)
		{
			throw new Error("All synchronization attempts failed");
		}

		// Sort by round-trip time
		measurements.sort((a, b) => a.roundTripTime - b.roundTripTime);
		
		// Use only the best samples for tighter accuracy
		const bestSamples = measurements.slice(0, Math.max(MIN_SAMPLE_COUNT, Math.floor(measurements.length * BEST_SAMPLES_PERCENTAGE)));

		// Use median instead of mean for better outlier rejection
		const medianRoundTrip = CalculateMedian(bestSamples.map((m) => m.roundTripTime));
		const medianOffset = CalculateMedian(bestSamples.map((m) => m.clockOffset));
		
		// Calculate standard deviation for accuracy assessment
		const rttStdDev = CalculateStandardDeviation(bestSamples.map((m) => m.roundTripTime));
		const offsetStdDev = CalculateStandardDeviation(bestSamples.map((m) => m.clockOffset));

		// Use the most recent measurement for server time
		const latestMeasurement = measurements[measurements.length - 1];

		// Determine accuracy based on median RTT and consistency (std dev)
		let accuracy: "high" | "medium" | "low" = "low";
		if (medianRoundTrip < HIGH_ACCURACY_RTT_THRESHOLD && rttStdDev < HIGH_ACCURACY_RTT_STDDEV && offsetStdDev < HIGH_ACCURACY_OFFSET_STDDEV)
		{
			accuracy = "high";
		}
		else if (medianRoundTrip < MEDIUM_ACCURACY_RTT_THRESHOLD && rttStdDev < MEDIUM_ACCURACY_RTT_STDDEV && offsetStdDev < MEDIUM_ACCURACY_OFFSET_STDDEV)
		{
			accuracy = "medium";
		}

		const syncResult: SyncResult = {
			roundTripTime: medianRoundTrip,
			clockOffset: medianOffset,
			serverTime: latestMeasurement.serverTime,
			accuracy,
			syncTimestamp: Date.now(),
		};

		this.currentSyncResult = syncResult;

		// Start periodic background sync for continuous time accuracy
		if (startPeriodicSync && this.syncIntervalId === null)
		{
			this.startPeriodicSync();
		}

		console.log(`[TimeSync] Initial sync complete: RTT=${medianRoundTrip.toFixed(2)}ms, Offset=${medianOffset.toFixed(2)}ms, Accuracy=${accuracy}`);

		return syncResult;
	}

	private async performSingleSync(): Promise<SyncMeasurement>
	{
		if (!this.connection)
		{
			throw new Error("Not connected to hub");
		}

		// T1: Client send timestamp
		const clientSendTime = Date.now();

		// Send sync request and get server timestamps
		const response: SyncResponse = await this.connection.invoke("SyncTime", clientSendTime);

		// T4: Client receive timestamp
		const clientReceiveTime = Date.now();

		const { serverReceiveTime, serverSendTime } = response;

		// NTP calculations:
		// Round-trip time = (T4 - T1) - (T3 - T2)
		const roundTripTime = (clientReceiveTime - clientSendTime) - (serverSendTime - serverReceiveTime);

		// Clock offset = ((T2 - T1) + (T3 - T4)) / 2
		const clockOffset = ((serverReceiveTime - clientSendTime) + (serverSendTime - clientReceiveTime)) / 2;

		// Synchronized server time = client time + offset
		const serverTime = clientReceiveTime + clockOffset;

		return {
			roundTripTime: Math.max(0, roundTripTime), // Ensure non-negative
			clockOffset,
			serverTime,
			clientTime: clientReceiveTime,
		};
	}

	/**
	 * Starts periodic background synchronization to maintain accuracy
	 * Re-syncs every 30 seconds with fewer samples for efficiency
	 */
	private startPeriodicSync(): void
	{
		// Clear any existing interval
		if (this.syncIntervalId !== null)
		{
			clearInterval(this.syncIntervalId);
		}

		// Perform lightweight sync at regular intervals
		this.syncIntervalId = window.setInterval(async () =>
		{
			try
			{
				console.log("[TimeSync] Performing periodic sync...");
				const syncResult = await this.synchronize(BACKGROUND_SYNC_SAMPLES, false);
				this.currentSyncResult = syncResult;
				console.log(`[TimeSync] Background sync complete: RTT=${syncResult.roundTripTime.toFixed(2)}ms, Offset=${syncResult.clockOffset.toFixed(2)}ms`);
			}
			catch (error)
			{
				console.warn("[TimeSync] Periodic sync failed:", error);
			}
		}, PERIODIC_SYNC_INTERVAL_MS);
	}

	/**
	 * Gets the current synchronized server time
	 * @returns Current server time in milliseconds
	 */
	public getCurrentServerTime(): number
	{
		if (this.currentSyncResult)
		{
			return Date.now() + this.currentSyncResult.clockOffset;
		}
		return Date.now();
	}

	/**
	 * Gets the current sync result
	 * @returns Current sync result or null if not synced
	 */
	public getCurrentSyncResult(): SyncResult | null
	{
		return this.currentSyncResult;
	}
}
