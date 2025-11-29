<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { ChevronsRight, ChevronsLeft } from "lucide-svelte";
	import PlayerContentsCollapsed from "./player-contents-collapsed.svelte";
	import PlayerContentsPlaying from "./player-contents-playing.svelte";
	import PlayerContentsQueue from "./player-contents-queue.svelte";
	import ColorBlobs from "./color-blobs.svelte";
	import { GetQueueContext } from "~/player2/context/player-store";
	import { SvelteRuneQueue } from "~/player2/queues/SvelteRuneQueue.svelte";
	import { extractColorsFromImage } from "$lib/color-extractor";

	let { collapsed = $bindable() }: { collapsed: boolean } = $props();

	let queue = GetQueueContext();
	let svelteQueue = new SvelteRuneQueue(queue);

	let currentSong = $derived(svelteQueue.currentSong);
	let currentTab = $state<"playing" | "queue">("playing");

	let coverUrl = $derived(currentSong ? `/api/Albums/${currentSong.albumId}/cover` : "/vinyl.jpg");

	let extractedColors = $state<string[]>(["#ff6b6b", "#4ecdc4", "#ffe66d", "#9b59b6"]);

	$effect(() =>
	{
		if (coverUrl)
		{
			extractColorsFromImage(coverUrl).then((result) =>
			{
				extractedColors = result.colors;
			});
		}
	});
</script>

<div class={["p-1", "h-screen sticky top-0 w-auto"]}>
	<ColorBlobs colors={extractedColors} />
	<Card.Root class="h-full py-6 rounded-2xl relative z-10">
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
					<Tabs.Root bind:value={currentTab}>
						<Tabs.List>
							<Tabs.Trigger value="playing">
								Now Playing
							</Tabs.Trigger>
							<Tabs.Trigger value="queue">
								Queue
							</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>
				{/if}

				<button
					class={[
						"hover:bg-glass-bg-hover rounded-xl cursor-pointer transition-all duration-300 px-1.5 py-1.5",
						!collapsed && "mr-1",
					]}
					onclick={() =>
					{
						collapsed = !collapsed;
					}}
				>
					{#if collapsed}
						<ChevronsLeft class="size-5" />
					{:else}
						<ChevronsRight class="size-5" />
					{/if}
				</button>
			</Card.Title>
		</Card.Header>
		<Card.Content class={collapsed ? "px-2" : ""}>
			{#if collapsed}
				<PlayerContentsCollapsed
					bind:coverUrl
				/>
			{:else if !collapsed && currentTab === "playing"}
				<PlayerContentsPlaying
					bind:coverUrl
					song={currentSong}
				/>
			{:else if !collapsed && currentTab === "queue"}
				<PlayerContentsQueue />
			{/if}
		</Card.Content>
	</Card.Root>
</div>
