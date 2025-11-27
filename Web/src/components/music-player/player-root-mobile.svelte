<script lang="ts">
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import PlayerContentsCollapsedMobile from "./player-contents-collapsed-mobile.svelte";
	import PlayerContentsPlaying from "./player-contents-playing.svelte";
	import PlayerContentsQueue from "./player-contents-queue.svelte";
	import { GetPlayerContext } from "~/player2/context/player-store";

	let { collapsed = $bindable() }: { collapsed: boolean } = $props();

	let player = GetPlayerContext();

	let song = $derived(player.currentSong);
	let currentTab = $state<"playing" | "queue">("playing");

	let coverUrl = $derived(song ? `/api/Albums/${song.albumId}/cover` : "/vinyl.jpg");

	let open = $state(false);
</script>

<div class="p-2 fixed bottom-0 w-screen">
	<div class="h-full border border-glass-border py-0 rounded-2xl bg-background/80 backdrop-blur-xl shadow-[0_-4px_24px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]">
		<div class={collapsed ? "p-1" : ""}>
			{#if collapsed}
				<PlayerContentsCollapsedMobile
					bind:coverUrl
					bind:song
					expand={() => (open = true)}
				/>
			{:else if !collapsed && currentTab === "playing"}
				<PlayerContentsPlaying
					bind:coverUrl
					bind:song
				/>
			{:else if !collapsed && currentTab === "queue"}
				<PlayerContentsQueue />
			{/if}
		</div>
	</div>
</div>

<Drawer.Root bind:open>
	<Drawer.Content class="h-90vh">
		<div class="px-4 py-8">
			<PlayerContentsPlaying bind:coverUrl bind:song />
		</div>
	</Drawer.Content>
</Drawer.Root>
