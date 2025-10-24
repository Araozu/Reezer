import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import * as SignalR from "@microsoft/signalr";
import { BACKEND_URL } from "~/env";
import { CalculateVariance, type SyncResult } from "./sync-utils";

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

	constructor(private readonly hubUrl = `${BACKEND_URL}/api/hubs/music`)
	{}

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
		this.connected = true;
	}

	async disconnect(): Promise<void>
	{
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

	/**
	  * Performs NTP-like synchronization with the server
	  * @param samples Number of round-trip measurements to take
	  * @returns Synchronization result with round-trip time and clock offset
	  */
	async synchronize(samples = 10): Promise<SyncResult>
	{
		if (!this.connection || this.connection.state !== "Connected")
		{
			await this.connect();
		}

		const measurements: SyncResult[] = [];

		for (let i = 0; i < samples; i += 1)
		{
			try
			{
				const result = await this.performSingleSync();
				measurements.push(result);

				// Small delay between samples to avoid overwhelming the server
				if (i < samples - 1)
				{
					await new Promise((resolve) => setTimeout(resolve, 250));
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

		// Sort by round-trip time and take the best samples
		measurements.sort((a, b) => a.roundTripTime - b.roundTripTime);
		const bestSamples = measurements.slice(0, Math.max(1, Math.floor(measurements.length * 0.75)));

		// Calculate averages from best samples
		const avgRoundTrip = bestSamples.reduce((sum, m) => sum + m.roundTripTime, 0) / bestSamples.length;
		const avgOffset = bestSamples.reduce((sum, m) => sum + m.clockOffset, 0) / bestSamples.length;

		// Use the most recent measurement for server time
		const latestMeasurement = measurements[measurements.length - 1];

		// Determine accuracy based on round-trip time and consistency
		const rttVariance = CalculateVariance(bestSamples.map((m) => m.roundTripTime));
		const offsetVariance = CalculateVariance(bestSamples.map((m) => m.clockOffset));

		let accuracy: "high" | "medium" | "low" = "low";
		if (avgRoundTrip < 50 && rttVariance < 10 && offsetVariance < 5)
		{
			accuracy = "high";
		}
		else if (avgRoundTrip < 150 && rttVariance < 50)
		{
			accuracy = "medium";
		}

		return {
			roundTripTime: avgRoundTrip,
			clockOffset: avgOffset,
			serverTime: latestMeasurement.serverTime,
			accuracy,
		};
	}

	private async performSingleSync(): Promise<SyncResult>
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
			accuracy: "low", // Will be determined by aggregate
		};
	}

}

