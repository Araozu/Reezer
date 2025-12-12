<script lang="ts">
import * as Card from "$lib/components/ui/card";
import { SetSyncPlayerManagerContext } from "~/context/music-player-context";
import { Disc3, Loader2, AlertCircle } from "lucide-svelte";
import { SyncPlayerManager } from "~/audio-engine/managers/SyncPlayerManager.svelte";
import { page } from "$app/state";
import LavaBackground from "$lib/components/lava-background.svelte";
import { goto } from "$app/navigation";

let { children } = $props();

const playerManager = new SyncPlayerManager(page.params.roomId);
SetSyncPlayerManagerContext(playerManager);
const syncStatus = $derived(playerManager.status);

let countdown = $state(5);

$effect(() =>
{
	if (syncStatus === "disconnected")
	{
		const timer = setInterval(() =>
		{
			countdown--;
			if (countdown <= 0)
			{
				clearInterval(timer);
				goto("/");
			}
		}, 1000);
		return () => clearInterval(timer);
	}
	else
	{
		countdown = 5;
	}
});
</script>

{@render children()}

{#if syncStatus === "reconnecting"}
	<div class="fixed top-0 left-0 right-0 z-50 bg-glass-bg/95 backdrop-blur-xl border-b border-glass-border shadow-[0_4px_12px_-2px_var(--glass-shadow)]">
		<div class="flex items-center justify-center gap-2 py-2 px-4">
			<Loader2 class="size-4 animate-spin" />
			<span class="text-sm font-medium">Reconnecting...</span>
		</div>
	</div>
{/if}

{#if syncStatus === "connecting" || syncStatus === "clock_sync" || syncStatus === "disconnected"}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 z-50">
		<div class="flex w-full flex-col justify-center items-center gap-6">
			<div class="flex items-center gap-2 self-center font-medium">
				<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
					<Disc3 class="size-4" />
				</div>
				Reezer
			</div>

			<Card.Root class="w-full max-w-md bg-glass-bg backdrop-blur-xl border-glass-border shadow-[0_4px_24px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]">
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						{#if syncStatus === "connecting"}
							<Loader2 class="size-5 animate-spin" />
							Connecting...
						{:else if syncStatus === "clock_sync"}
							<Loader2 class="size-5 animate-spin" />
							Synchronizing...
						{:else if syncStatus === "disconnected"}
							<AlertCircle class="size-5 text-destructive" />
							Connection Failed
						{:else}
							Status: {syncStatus}
						{/if}
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if syncStatus === "connecting"}
						<p class="text-muted-foreground">Establishing connection to the room...</p>
					{:else if syncStatus === "clock_sync"}
						<p class="text-muted-foreground">Synchronizing playback clock...</p>
					{:else if syncStatus === "disconnected"}
						<p>Lost connection to the server.</p>
						<p class="text-sm text-muted-foreground">Redirecting to home in {countdown}s...</p>
					{:else}
						<p>Unknown status encountered.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
{/if}
