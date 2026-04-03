<script lang="ts">
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import PlayerContentsCollapsedMobile from "./player-contents-collapsed-mobile.svelte";
	import PlayerContentsPlaying from "./player-contents-playing.svelte";
	import PlayerContentsQueue from "./player-contents-queue.svelte";
	import { GetSvelteManagerContext } from "~/context/music-player-context";

	let { collapsed = $bindable() }: { collapsed: boolean } = $props();

	const svManager = GetSvelteManagerContext();

	let currentSong = $derived(svManager.currentSong);
	let currentTab = $state<"playing" | "queue">("playing");

	let coverUrl = $derived.by(() =>
	{
		if (!currentSong) return "/vinyl.jpg";

		if (currentSong.type === "regular") return `/api/Albums/${currentSong.albumId}/cover`;
		else if (currentSong.type === "youtube") return `/api/Yt/${currentSong.id}/thumbnail`;
		else return "/vinyl.jpg";
	});

	let open = $state(false);
</script>

<div class="p-2 bottom-0 fixed z-20 w-screen">
	<div
		class="border-glass-border py-0 rounded-2xl bg-background/80 backdrop-blur-xl h-full border shadow-[0_-4px_24px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]"
	>
		<div class={collapsed ? "p-1" : ""}>
			{#if collapsed}
				<PlayerContentsCollapsedMobile
					bind:coverUrl
					song={currentSong}
					expand={() => (open = true)}
				/>
			{:else if !collapsed && currentTab === "playing"}
				<PlayerContentsPlaying bind:coverUrl song={currentSong} />
			{:else if !collapsed && currentTab === "queue"}
				<PlayerContentsQueue />
			{/if}
		</div>
	</div>
</div>

<Drawer.Root bind:open>
	<Drawer.Content class="h-90vh">
		<div class="px-4 py-8">
			<Tabs.Root bind:value={currentTab} class="mb-6">
				<Tabs.List class="grid w-full grid-cols-2">
					<Tabs.Trigger value="playing">Now Playing</Tabs.Trigger>
					<Tabs.Trigger value="queue">Queue</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>

			{#if currentTab === "playing"}
				<PlayerContentsPlaying bind:coverUrl song={currentSong} />
			{:else if currentTab === "queue"}
				<PlayerContentsQueue />
			{/if}
		</div>
	</Drawer.Content>
</Drawer.Root>
