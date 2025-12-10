export interface SyncResult {
  roundTripTime: number; // in milliseconds
  clockOffset: number; // in milliseconds (positive = server is ahead, negative = client is ahead)
  serverTime: number; // synchronized server time in milliseconds
  accuracy: "high" | "medium" | "low";
}

export function CalculateMAD(values: number[]): number
{
	const sorted = [...values].sort((a, b) => a - b);
	const median = sorted[Math.floor(sorted.length / 2)]!;
	const absoluteDeviations = values.map((val) => Math.abs(val - median));
	const sortedDeviations = absoluteDeviations.sort((a, b) => a - b);
	return sortedDeviations[Math.floor(sortedDeviations.length / 2)]!;
}

/**
   * Gets the current synchronized server time
   * @param syncResult Previous sync result to base calculation on
   * @returns Current synchronized server time in milliseconds
   */
export function GetSynchronizedTime(syncResult?: SyncResult): number
{
	if (syncResult)
	{
		// Extrapolate from last sync: serverTime = clientTime + offset
		const clientTime = Date.now();
		return clientTime + syncResult.clockOffset;
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
