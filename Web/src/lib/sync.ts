import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import * as SignalR from "@microsoft/signalr";
import { BACKEND_URL } from "~/env";

export interface SyncResult {
  roundTripTime: number; // in milliseconds
  clockOffset: number; // in milliseconds (positive = client is ahead)
  serverTime: number; // synchronized server time in milliseconds
  accuracy: "high" | "medium" | "low";
}

export interface SyncResponse {
  serverReceiveTime: number;
  serverSendTime: number;
}

class TimeSynchronizer
{
	private connection: SignalR.HubConnection | null = null;
	private readonly hubUrl: string;

	constructor(hubUrl = `${BACKEND_URL}/api/hubs/music`)
	{
		this.hubUrl = hubUrl;
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
	}

	async disconnect(): Promise<void>
	{
		if (this.connection)
		{
			await this.connection.stop();
			this.connection = null;
		}
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
		const rttVariance = this.calculateVariance(bestSamples.map((m) => m.roundTripTime));
		const offsetVariance = this.calculateVariance(bestSamples.map((m) => m.clockOffset));

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

	private calculateVariance(values: number[]): number
	{
		const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
		const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
		return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;
	}

	/**
   * Gets the current synchronized time
   * @param syncResult Previous sync result to base calculation on
   * @returns Current synchronized server time
   */
	getSynchronizedTime(syncResult?: SyncResult): number
	{
		if (syncResult)
		{
			// Extrapolate from last sync
			const timeSinceSync = Date.now() - (syncResult.serverTime - syncResult.clockOffset);
			return syncResult.serverTime + timeSinceSync;
		}
		// Fallback to local time if no sync result
		return Date.now();
	}

	/**
   * Checks if synchronization is still valid
   * @param lastSyncTime When the last sync was performed
   * @param maxAge Maximum age in milliseconds (default: 5 minutes)
   */
	isSyncValid(lastSyncTime: number, maxAge = 5 * 60 * 1000): boolean
	{
		return Date.now() - lastSyncTime < maxAge;
	}
}

// Export singleton instance
export const timeSynchronizer = new TimeSynchronizer();

// Export types and utilities
export { TimeSynchronizer };
