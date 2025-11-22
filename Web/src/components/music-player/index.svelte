<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { ChevronsRight, ChevronsLeft } from "lucide-svelte";
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import PlayerContentsCollapsed from "./player-contents-collapsed.svelte";
	import PlayerContentsPlaying from "./player-contents-playing.svelte";
	import PlayerContentsQueue from "./player-contents-queue.svelte";
	import { MediaQuery } from "svelte/reactivity";

	let { collapsed = $bindable() }: { collapsed: boolean } = $props();

	const isDesktop = new MediaQuery("(min-width: 48rem)");

	let player = GetCurrentPlayer();
	let song = $derived(player.currentSong);
	let currentTab = $state<"playing" | "queue">("playing");

	let coverUrl = $derived(song ? `/api/Albums/${song.albumId}/cover` : "/vinyl.jpg");
</script>

<div
	class={[
		"p-1",
		"md:h-screen md:sticky md:top-0 md:w-auto",
		"fixed bottom-0 w-screen",
	]}
>
	<Card.Root
		class="h-full border-primary md:py-6 py-0 md:rounded-xl rounded"
	>
		<div class="md:block hidden">
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
							bind:value={currentTab}
						>
							<Tabs.List>
								<Tabs.Trigger
									value="playing"
									>Now
									Playing</Tabs.Trigger
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
							"hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors px-1",
							!collapsed && "mr-1",
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
		</div>
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
				<PlayerContentsQueue />
			{/if}
		</Card.Content>
	</Card.Root>
</div>
