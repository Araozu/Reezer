<script lang="ts">
	import { Drawer } from "vaul-svelte";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import MiniPlayerBar from "./mini-player-bar.svelte";
	import PlayerContentsPlaying from "./player-contents-playing.svelte";
	import PlayerContentsQueue from "./player-contents-queue.svelte";

	let player = GetCurrentPlayer();
	let song = $derived(player.currentSong);
	let currentTab = $state<"playing" | "queue">("playing");
	let coverUrl = $derived(song ? `/api/Albums/${song.albumId}/cover` : "/vinyl.jpg");
</script>

<Drawer.Root>
	<Drawer.Trigger class="w-full">
		<div class="bg-card border-t border-border p-3">
			<MiniPlayerBar />
		</div>
	</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Overlay class="fixed inset-0 bg-black/40" />
		<Drawer.Content
			class="bg-card flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0"
		>
			<div class="p-4 bg-card rounded-t-[10px] flex-1 overflow-y-auto">
				<div class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6"></div>
				<div class="max-w-md mx-auto">
					<Tabs.Root bind:value={currentTab}>
						<Tabs.List class="w-full mb-4">
							<Tabs.Trigger value="playing" class="flex-1">
								Now Playing
							</Tabs.Trigger>
							<Tabs.Trigger value="queue" class="flex-1">
								Queue
							</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>
					{#if currentTab === "playing"}
						<PlayerContentsPlaying bind:coverUrl bind:song />
					{:else}
						<PlayerContentsQueue />
					{/if}
				</div>
			</div>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
