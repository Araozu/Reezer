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

<div class="p-1 fixed bottom-0 w-screen">
	<div class="h-full border border-primary py-0 rounded bg-background">
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
