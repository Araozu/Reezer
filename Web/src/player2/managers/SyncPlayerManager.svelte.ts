import * as SignalR from "@microsoft/signalr";
import type { SyncResult } from "~/lib/sync-utils";
import { CalculateVariance } from "~/lib/sync-utils";

type ConnectionStatus = "disconnected" | "connecting" | "clock_sync" | "connected" | "reconnecting";

/** A player manager with Sync Play capabilities */
export class SyncPlayerManager
{
	private connection: SignalR.HubConnection;
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

		this.connection.start()
			.then(async() =>
			{
				this.status = "clock_sync";
				try
				{
					this.syncResult = await this.syncClock();
					this.status = "connected";
				}
				catch (error)
				{
					console.error("Clock sync failed:", error);
					this.status = "disconnected";
				}
			})
			.catch((error) =>
			{
				console.error("Connection failed:", error);
				this.status = "disconnected";
			});
	}

	private async syncClock(): Promise<SyncResult>
	{
		const samples: { rtt: number; offset: number }[] = [];
		const sampleCount = 5;

		for (let i = 0; i < sampleCount; i += 1)
		{
			const t0 = Date.now();
			const serverT2 = await this.connection.invoke<number>("SyncClock", t0);
			const t3 = Date.now();

			const rtt = t3 - t0;
			const offset = (serverT2 - (t0 + t3)) / 2;

			samples.push({ rtt, offset });

			if (i < sampleCount - 1)
			{
				await new Promise((resolve) => setTimeout(resolve, 150));
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
