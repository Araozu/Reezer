export interface SyncResult {
  roundTripTime: number; // in milliseconds
  clockOffset: number; // in milliseconds (positive = client is ahead)
  serverTime: number; // synchronized server time in milliseconds
  accuracy: "high" | "medium" | "low";
  syncTimestamp?: number; // when this sync was performed (client local time)
}

export interface SyncMeasurement {
  roundTripTime: number;
  clockOffset: number;
  serverTime: number;
  clientTime: number;
}

export function CalculateVariance(values: number[]): number
{
	const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
	const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
	return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;
}

export function CalculateMedian(values: number[]): number
{
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function CalculateStandardDeviation(values: number[]): number
{
	return Math.sqrt(CalculateVariance(values));
}

/**
   * Gets the current synchronized server time with drift compensation
   * @param syncResult Previous sync result to base calculation on
   * @returns Current synchronized server time
   */
export function GetSynchronizedTime(syncResult?: SyncResult): number
{
	if (syncResult && syncResult.syncTimestamp)
	{
		// Calculate current server time by applying the offset to current client time
		return Date.now() + syncResult.clockOffset;
	}
	// Fallback to local time if no sync result
	return Date.now();
}

/**
   * Checks if synchronization is still valid
   * @param syncResult The sync result to check
   * @param maxAge Maximum age in milliseconds (default: 30 seconds for tight sync)
   */
export function IsSyncValid(syncResult?: SyncResult, maxAge = 30 * 1000): boolean
{
	if (!syncResult || !syncResult.syncTimestamp)
	{
		return false;
	}
	return Date.now() - syncResult.syncTimestamp < maxAge;
}
