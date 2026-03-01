<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Disc3, CircleAlert, LoaderCircle, ChevronRight } from "lucide-svelte";
	import { goto } from "$app/navigation";
	import {
		SetPlayerManagerContext,
		SetSvelteManagerContext,
		SetSyncRoomManagerContext,
	} from "~/context/music-player-context";
	import { MultiplayerManager } from "~/audio-engine/managers/MultiplayerManager";
	import { UrlAudioSource } from "~/audio-engine/audio-sources/UrlAudioSource";
	import { SvPlayerManager } from "~/audio-engine/managers/SvPlayerManager.svelte";
	import { SyncManager } from "~/audio-engine/managers/SyncManager.svelte";
	import { page } from "$app/state";

	let { children } = $props();

	// Sync manager for room features
	const syncRoomManager = new SyncManager(page.params.roomId);
	SetSyncRoomManagerContext(syncRoomManager);

	const playerManager = new MultiplayerManager(new UrlAudioSource(), syncRoomManager);
	SetPlayerManagerContext(playerManager);

	// Svelte manager with reactivity
	const svManager = new SvPlayerManager(playerManager);
	SetSvelteManagerContext(svManager);

	const syncStatus = $derived(syncRoomManager.status);

	let hasInitialized = $state(false);
	let isConnecting = $state(false);
	let countdown = $state(5);

	async function handleContinue()
	{
		isConnecting = true;
		try
		{
			await playerManager.Init();
			// wait some ms for player to settle
			await new Promise((resolve) => setTimeout(resolve, 150));
			await syncRoomManager.connect();
			hasInitialized = true;
		}
		finally
		{
			isConnecting = false;
		}
	}

	$effect(() =>
	{
		if (syncStatus === "disconnected" && !isConnecting && !hasInitialized)
		{
			// We don't want to redirect if we haven't even tried to connect yet
			return;
		}

		if (syncStatus === "disconnected")
		{
			const timer = setInterval(() =>
			{
				countdown -= 1;
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

	$effect(() => () =>
	{
		console.log("[rooms layout] Cleanup called - cleaning up player manager");
		syncRoomManager.destroy();
	});
</script>

{@render children()}

{#if syncStatus === "reconnecting"}
	<div
		class="top-0 left-0 right-0 bg-glass-bg/95 backdrop-blur-xl border-glass-border fixed z-50 border-b shadow-[0_4px_12px_-2px_var(--glass-shadow)]"
	>
		<div class="gap-2 py-2 px-4 flex items-center justify-center">
			<LoaderCircle class="size-4 animate-spin" />
			<span class="text-sm font-medium">Reconnecting...</span>
		</div>
	</div>
{/if}

{#if syncStatus === "connecting" || syncStatus === "clock_sync" || syncStatus === "disconnected" || (syncStatus === "connected" && !hasInitialized)}
	<div
		class="inset-0 bg-black/50 backdrop-blur-sm gap-6 p-6 md:p-10 fixed z-50 flex min-h-svh flex-col items-center justify-center"
	>
		<div class="gap-6 flex w-full flex-col items-center justify-center">
			<div class="gap-2 font-medium text-white flex items-center self-center">
				<div
					class="bg-primary text-primary-foreground size-6 rounded-lg flex items-center justify-center"
				>
					<Disc3 class="size-4" />
				</div>
				Reezer
			</div>

			<Card.Root class="max-w-md bg-card border-border shadow-lg w-full">
				<Card.Header>
					<Card.Title class="gap-2 flex items-center">
						{#if isConnecting || syncStatus === "connecting"}
							<LoaderCircle class="size-5 animate-spin" />
							Connecting...
						{:else if syncStatus === "clock_sync"}
							<LoaderCircle class="size-5 animate-spin" />
							Synchronizing...
						{:else if syncStatus === "disconnected"}
							{#if !hasInitialized && !isConnecting}
								<Disc3 class="size-5 text-primary" />
								Join Room
							{:else}
								<CircleAlert class="size-5 text-destructive" />
								Connection Failed
							{/if}
						{:else if syncStatus === "connected"}
							<Disc3 class="size-5 text-primary" />
							Ready to Play
						{:else}
							Status: {syncStatus}
						{/if}
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if isConnecting || syncStatus === "connecting"}
						<p class="text-muted-foreground">Establishing connection to the room...</p>
					{:else if syncStatus === "clock_sync"}
						<p class="text-muted-foreground">Synchronizing playback clock...</p>
					{:else if syncStatus === "disconnected"}
						{#if !hasInitialized && !isConnecting}
							<p class="text-muted-foreground">
								Join the room to start listening and chatting with others.
							</p>
							<Button class="w-full" onclick={handleContinue}>
								Connect to Room
								<ChevronRight class="ml-2 size-4" />
							</Button>
						{:else}
							<p>Lost connection to the server.</p>
							<p class="text-sm text-muted-foreground">Redirecting to home in {countdown}s...</p>
						{/if}
					{:else if syncStatus === "connected"}
						<p class="text-muted-foreground">
							Successfully connected to the room. Preparing session...
						</p>
					{:else}
						<p>Unknown status encountered.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
{/if}
