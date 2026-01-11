import { MusicRoomHubClient, type ChatMessage, type ConnectedUser } from "~/api/MusicRoomHubClient.svelte";
import { type SyncResult, CalculateMAD } from "~/lib/sync-utils";
import type { ISong } from "../types";

type ConnectionStatus = "disconnected" | "connecting" | "clock_sync" | "connected" | "reconnecting";

const RESYNC_INTERVAL_MS = 60_000;

/** A manager for syncing the clock and other room features */
export class SyncManager
{
	private hubClient: MusicRoomHubClient;
	private resyncInterval: ReturnType<typeof setInterval> | null = null;
	public status: ConnectionStatus = $state("disconnected");
	public syncResult: SyncResult | null = $state(null);
	public messages: ChatMessage[] = $state([]);
	public connectedUsers: ConnectedUser[] = $state([]);

	constructor(roomId?: string)
	{
		this.hubClient = new MusicRoomHubClient(roomId);

		// Subscribe to events
		this.hubClient.OnMessageReceived((user, message) =>
		{
			console.log("Received from SignalR:");
			console.log(`${JSON.stringify(user)}: ${message}`);
		});

		this.hubClient.OnChatMessage((message) =>
		{
			console.log("Chat message received:", message);
			this.messages.push(message);
		});

		this.hubClient.OnConnectedUsersChanged((users) =>
		{
			console.log("Connected users changed:", users);
			this.connectedUsers = users;
		});

		// Watch for connection status changes
		$effect(() =>
		{
			const currentStatus = this.hubClient.status;

			if (currentStatus === "connected")
			{
				if (this.status === "connecting" || this.status === "reconnecting")
				{
					this.performClockSync()
						.then(() =>
						{
							this.startResyncInterval();
						})
						.catch((error) =>
						{
							console.error("Clock sync failed:", error);
						});
				}
			}
			else if (currentStatus === "reconnecting")
			{
				this.stopResyncInterval();
				this.status = "reconnecting";
			}
			else if (currentStatus === "disconnected")
			{
				this.stopResyncInterval();
				this.status = "disconnected";
			}
		});
	}

	public async connect(): Promise<void>
	{
		this.status = "connecting";
		try
		{
			await this.hubClient.start();
			await this.performClockSync();
			this.startResyncInterval();
		}
		catch (error)
		{
			console.error("Connection/Sync failed:", error);
			this.status = "disconnected";
			throw error;
		}
	}

	private async performClockSync(): Promise<void>
	{
		this.status = "clock_sync";
		try
		{
			this.syncResult = await this.syncClock();
			console.log("Clock sync result:", JSON.stringify(this.syncResult, null, 4));
			this.status = "connected";
		}
		catch (error)
		{
			console.error("Clock sync failed:", error);
			this.status = "disconnected";
		}
	}

	private startResyncInterval(): void
	{
		this.stopResyncInterval();
		this.resyncInterval = setInterval(async() =>
		{
			if (this.status !== "connected") return;
			try
			{
				this.syncResult = await this.syncClock();
			}
			catch (error)
			{
				console.error("Clock resync failed:", error);
			}
		}, RESYNC_INTERVAL_MS);
	}

	private stopResyncInterval(): void
	{
		if (this.resyncInterval)
		{
			clearInterval(this.resyncInterval);
			this.resyncInterval = null;
		}
	}

	public async destroy(): Promise<void>
	{
		console.log("[SyncPlayerManager] destroy called");
		this.stopResyncInterval();
		await this.hubClient.destroy();
	}

	public async sendChatMessage(message: string): Promise<void>
	{
		await this.hubClient.SendMessage(message);
	}

	public async sendPlaySongList(songs: ISong[]): Promise<void>
	{
		await this.hubClient.PlaySongList(songs);
	}

	public async sendQueue(queue: ISong[], currentIndex: number): Promise<void>
	{
		await this.hubClient.SetQueue(queue, currentIndex);
	}

	public onQueueChanged(handler: (queue: ISong[], currentIndex: number) => void): () => void
	{
		return this.hubClient.OnQueueChanged(handler);
	}

	private async syncClock(): Promise<SyncResult>
	{
		const samples: { rtt: number; offset: number }[] = [];
		const sampleCount = 5;

		for (let i = 0; i < sampleCount; i += 1)
		{
			const t0 = Date.now();
			const serverT2 = await this.hubClient.SyncClock();
			const t3 = Date.now();

			const rtt = t3 - t0;
			// Offset: serverTime - clientTime at midpoint of round trip
			// Positive = server is ahead, negative = client is ahead
			const clientMidpoint = (t0 + t3) / 2;
			const offset = serverT2 - clientMidpoint;

			samples.push({ rtt, offset });

			if (i < sampleCount - 1)
			{
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		}

		const sortedRtts = samples.map((s) => s.rtt).sort((a, b) => a - b);
		const sortedOffsets = samples.map((s) => s.offset).sort((a, b) => a - b);
		const medianRtt = sortedRtts[Math.floor(sortedRtts.length / 2)]!;
		const medianOffset = sortedOffsets[Math.floor(sortedOffsets.length / 2)]!;

		const mad = CalculateMAD(samples.map((s) => s.rtt));
		let accuracy: "high" | "medium" | "low";
		if (mad < 2)
		{
			accuracy = "high";
		}
		else if (mad < 5)
		{
			accuracy = "medium";
		}
		else
		{
			accuracy = "low";
		}

		return {
			roundTripTime: medianRtt,
			clockOffset: medianOffset,
			serverTime: Date.now() + medianOffset,
			accuracy,
		};
	}
}
