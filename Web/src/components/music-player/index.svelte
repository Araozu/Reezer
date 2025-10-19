<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { ChevronsRight, ChevronsLeft } from "lucide-svelte";
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import PlayerContentsCollapsed from "./player-contents-collapsed.svelte";
	import PlayerContentsPlaying from "./player-contents-playing.svelte";

	let { collapsed = $bindable() }: { collapsed: boolean } = $props();

	let player = GetCurrentPlayer();
	let song = $derived(player.currentSong);
	let currentTab = $state<"playing" | "queue">("playing");

	let coverUrl = $derived(song ? `/api/Albums/${song.albumId}/cover` : "/vinyl.jpg");
</script>

<div class="p-1 h-screen sticky top-0">
	<Card.Root class="h-full border-primary">
		<Card.Header class={collapsed ? "px-0" : ""}>
			<Card.Title
				class={[
					"font-display flex items-center gap-2",
					collapsed
						? "justify-center"
						: "justify-between",
				]}
			>
				{#if !collapsed}
					<Tabs.Root
						class="w-[400px]"
						bind:value={currentTab}
					>
						<Tabs.List>
							<Tabs.Trigger
								value="playing"
								>Now Playing</Tabs.Trigger
							>
							<Tabs.Trigger
								value="queue"
								>Queue</Tabs.Trigger
							>
						</Tabs.List>
					</Tabs.Root>
				{/if}

				<button
					class={[
						"hover:bg-zinc-200 rounded-sm cursor-pointer transition-colors",
						!collapsed && "mr-2",
					]}
					onclick={() =>
					{
						collapsed = !collapsed;
					}}
				>
					{#if collapsed}
						<ChevronsLeft />
					{:else}
						<ChevronsRight />
					{/if}
				</button>
			</Card.Title>
		</Card.Header>
		<Card.Content class={collapsed ? "px-2" : ""}>
			{#if collapsed}
				<PlayerContentsCollapsed
					bind:coverUrl
					bind:song
				/>
			{:else if !collapsed && currentTab === "playing"}
				<PlayerContentsPlaying
					bind:coverUrl
					bind:song
				/>
			{:else if !collapsed && currentTab === "queue"}
				the queue
			{/if}
		</Card.Content>
	</Card.Root>
</div>
