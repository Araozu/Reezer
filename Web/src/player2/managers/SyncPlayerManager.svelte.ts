import * as SignalR from "@microsoft/signalr";
import { type SyncResult ,CalculateVariance } from "~/lib/sync-utils";

type ConnectionStatus = "disconnected" | "connecting" | "clock_sync" | "connected" | "reconnecting";

const RESYNC_INTERVAL_MS = 60_000;

/** A player manager with Sync Play capabilities */
export class SyncPlayerManager
{
	private connection: SignalR.HubConnection;
	private resyncInterval: ReturnType<typeof setInterval> | null = null;
	public status: ConnectionStatus = $state("disconnected");
	public syncResult: SyncResult | null = $state(null);

	constructor()
	{
		this.status = "connecting";
		this.connection = new SignalR.HubConnectionBuilder()
			.withUrl(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/hub/MusicRoom`)
			.withAutomaticReconnect()
			.build();

		this.connection.on("MessageReceived", (user, message) =>
		{
			console.log("Received from SignalR:");
			console.log(`${JSON.stringify(user)}: ${message}`);
		});

		this.connection.onreconnected(async() =>
		{
			await this.performClockSync();
			this.startResyncInterval();
		});

		this.connection.onreconnecting(() =>
		{
			this.stopResyncInterval();
			this.status = "reconnecting";
		});

		this.connection.onclose(() =>
		{
			this.stopResyncInterval();
			this.status = "disconnected";
		});

		this.connection.start()
			.then(async() =>
			{
				await this.performClockSync();
				this.startResyncInterval();
			})
			.catch((error) =>
			{
				console.error("Connection failed:", error);
				this.status = "disconnected";
			});
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
				console.log("Clock resync:", JSON.stringify(this.syncResult, null, 4));
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
		this.stopResyncInterval();
		await this.connection.stop();
	}

	private async syncClock(): Promise<SyncResult>
	{
		const samples: { rtt: number; offset: number }[] = [];
		const sampleCount = 5;

		for (let i = 0; i < sampleCount; i += 1)
		{
			const t0 = Date.now();
			const serverT2 = await this.connection.invoke<number>("SyncClock");
			const t3 = Date.now();

			const rtt = t3 - t0;
			// Offset: serverTime - clientTime at midpoint of round trip
			// Positive = server is ahead, negative = client is ahead
			const clientMidpoint = (t0 + t3) / 2;
			const offset = serverT2 - clientMidpoint;

			samples.push({ rtt, offset });

			if (i < sampleCount - 1)
			{
				await new Promise((resolve) => setTimeout(resolve, 250));
			}
		}

		const sortedRtts = samples.map((s) => s.rtt).sort((a, b) => a - b);
		const sortedOffsets = samples.map((s) => s.offset).sort((a, b) => a - b);
		const medianRtt = sortedRtts[Math.floor(sortedRtts.length / 2)]!;
		const medianOffset = sortedOffsets[Math.floor(sortedOffsets.length / 2)]!;

		const variance = CalculateVariance(samples.map((s) => s.rtt));
		const accuracy = variance < 10 ? "high" : variance < 50 ? "medium" : "low";

		return {
			roundTripTime: medianRtt,
			clockOffset: medianOffset,
			serverTime: Date.now() + medianOffset,
			accuracy,
		};
	}
}
