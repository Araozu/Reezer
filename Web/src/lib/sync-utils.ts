export interface SyncResult {
  roundTripTime: number; // in milliseconds
  clockOffset: number; // in milliseconds (positive = client is ahead)
  serverTime: number; // synchronized server time in milliseconds
  accuracy: "high" | "medium" | "low";
}

export function CalculateVariance(values: number[]): number
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
export function GetSynchronizedTime(syncResult?: SyncResult): number
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
export function IsSyncValid(lastSyncTime: number, maxAge = 5 * 60 * 1000): boolean
{
	return Date.now() - lastSyncTime < maxAge;
}
