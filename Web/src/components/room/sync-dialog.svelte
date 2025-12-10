<script lang="ts">
import * as Dialog from "$lib/components/ui/dialog";
import { GetSyncPlayerManagerContext } from "~/player2/context/player-store";
import { Activity, Clock, Gauge, Signal, Timer } from "lucide-svelte";

let { open = $bindable(false) } = $props();

const playerManager = GetSyncPlayerManagerContext();
const syncResult = $derived(playerManager.syncResult);
const status = $derived(playerManager.status);

let serverTime = $state(Date.now());

$effect(() =>
{
	if (!open) return;
	const interval = setInterval(() =>
	{
		serverTime = Date.now() + (syncResult?.clockOffset ?? 0);
	}, 100);
	return () => clearInterval(interval);
});

function formatTime(timestamp: number): string
{
	return new Date(timestamp).toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		fractionalSecondDigits: 1,
	});
}

function formatOffset(offset: number): string
{
	const sign = offset >= 0 ? "+" : "";
	return `${sign}${offset.toFixed(1)}ms`;
}

function getAccuracyColor(accuracy: "high" | "medium" | "low"): string
{
	switch (accuracy)
	{
	case "high": return "text-green-500";
	case "medium": return "text-yellow-500";
	case "low": return "text-red-500";
	}
}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Signal class="size-5" />
				Sync Status
			</Dialog.Title>
			<Dialog.Description>
				Real-time synchronization stats
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="flex items-center justify-between rounded-lg bg-glass-bg p-3">
				<div class="flex items-center gap-2 text-muted-foreground">
					<Activity class="size-4" />
					<span>Status</span>
				</div>
				<span class="font-medium capitalize">{status}</span>
			</div>

			<div class="flex items-center justify-between rounded-lg bg-glass-bg p-3">
				<div class="flex items-center gap-2 text-muted-foreground">
					<Timer class="size-4" />
					<span>Server Time</span>
				</div>
				<span class="font-mono font-medium">{formatTime(serverTime)}</span>
			</div>

			{#if syncResult}
				<div class="flex items-center justify-between rounded-lg bg-glass-bg p-3">
					<div class="flex items-center gap-2 text-muted-foreground">
						<Gauge class="size-4" />
						<span>RTT</span>
					</div>
					<span class="font-mono font-medium">{syncResult.roundTripTime}ms</span>
				</div>

				<div class="flex items-center justify-between rounded-lg bg-glass-bg p-3">
					<div class="flex items-center gap-2 text-muted-foreground">
						<Clock class="size-4" />
						<span>Clock Offset</span>
					</div>
					<span class="font-mono font-medium">{formatOffset(syncResult.clockOffset)}</span>
				</div>

				<div class="flex items-center justify-between rounded-lg bg-glass-bg p-3">
					<div class="flex items-center gap-2 text-muted-foreground">
						<Signal class="size-4" />
						<span>Accuracy</span>
					</div>
					<span class={["font-medium capitalize", getAccuracyColor(syncResult.accuracy)]}>
						{syncResult.accuracy}
					</span>
				</div>
			{:else}
				<p class="text-center text-muted-foreground">No sync data available yet</p>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
