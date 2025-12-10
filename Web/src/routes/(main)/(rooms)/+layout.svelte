<script lang="ts">
import { SyncPlayerManager } from "~/player2/managers/SyncPlayerManager.svelte";

let { children } = $props();

const playerManager = new SyncPlayerManager();
const syncStatus = $derived(playerManager.status);

// $effect(() =>
// {
// 	if (
// 		$userQuery.error?.status === 401 ||
// 				$userQuery.error?.status === 403
// 	)
// 	{
// 		goto("/");
// 	}
// });
</script>

<div>
	{#if syncStatus === "connecting"}
		<div
			class="fixed top-0 w-screen bg-blue-600/50 text-white text-xs text-center"
		>
			Connecting...
		</div>
	{:else if syncStatus === "clock_sync"}
		<div
			class="fixed top-0 w-screen bg-blue-600/50 text-white text-xs text-center"
		>
			Synchronizing clock...
		</div>
	{:else if syncStatus === "connected"}
		{@render children()}
	{:else if syncStatus === "disconnected"}
		<p>disconnected...</p>
	{:else}
		<p>??</p>
	{/if}
</div>
