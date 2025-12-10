<script lang="ts">
import * as Card from "$lib/components/ui/card";
import { SyncPlayerManager } from "~/player2/managers/SyncPlayerManager.svelte";
import { SetSyncPlayerManagerContext } from "~/context/music-player-context";
import { Disc3 } from "lucide-svelte";

let { children } = $props();

const playerManager = new SyncPlayerManager();
SetSyncPlayerManagerContext(playerManager);
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
		{@render ConnectingCard()}
	{:else if syncStatus === "clock_sync"}
		{@render SyncCard()}
	{:else if syncStatus === "connected"}
		{@render children()}
	{:else if syncStatus === "disconnected"}
		<p>disconnected...</p>
	{:else}
		<p>Unknown status</p>
	{/if}
</div>

{#snippet ConnectingCard()}
	<div
		class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
	>
		<div class="flex w-full flex-col justify-center items-center gap-6">
			<div class="flex items-center gap-2 self-center font-medium">
				<div
					class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
				>
					<Disc3 class="size-4" />
				</div>
				Reezer
			</div>

			<Card.Root class="w-full max-w-md">
				<Card.Header>
					<Card.Title>Connecting...</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<p>
						Connecting...
					</p>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
{/snippet}

{#snippet SyncCard()}
	<div
		class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
	>
		<div class="flex w-full flex-col justify-center items-center gap-6">
			<div class="flex items-center gap-2 self-center font-medium">
				<div
					class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
				>
					<Disc3 class="size-4" />
				</div>
				Reezer
			</div>

			<Card.Root class="w-full max-w-md">
				<Card.Header>
					<Card.Title>Syncronizing...</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
				</Card.Content>
			</Card.Root>
		</div>
	</div>
{/snippet}
