<script lang="ts">
import * as Card from "$lib/components/ui/card/index.js";
import * as Tabs from "$lib/components/ui/tabs/index.js";
import { ChevronsRight, ChevronsLeft } from "lucide-svelte";
import PlayerContentsCollapsed from "./player-contents-collapsed.svelte";
import PlayerContentsPlaying from "./player-contents-playing.svelte";
import PlayerContentsQueue from "./player-contents-queue.svelte";
import ColorBlobs from "./color-blobs.svelte";
import { extractColorsFromImage } from "$lib/color-extractor";
import { GetQueueContext } from "~/context/music-player-context";
import { SvelteRuneQueue } from "~/audio-engine/queues/SvelteRuneQueue.svelte";
    import PlayerContentsGroup from "./player-contents-group.svelte";

let { collapsed = $bindable() }: { collapsed: boolean } = $props();

let queue = GetQueueContext();
let svelteQueue = new SvelteRuneQueue(queue);

let currentSong = $derived(svelteQueue.currentSong);
let currentTab = $state<"playing" | "queue" | "multiplayer">("playing");

let coverUrl = $derived.by(() =>
{
	if (!currentSong) return "/vinyl.jpg";

	if (currentSong.type === "regular") return `/api/Albums/${currentSong.albumId}/cover`;
	else if (currentSong.type === "youtube") return `/api/Yt/${currentSong.id}/thumbnail`;
	else return "/vinyl.jpg";
});

let extractedColors = $state<string[]>([]);
let colorWeights = $state<number[]>([]);

$effect(() =>
{
	if (coverUrl)
	{
		extractColorsFromImage(coverUrl, 6).then((result) =>
		{
			extractedColors = result.colors;
			colorWeights = result.weights;
		});
	}
});
</script>

<div class={["p-1", "h-screen sticky top-0 w-auto z-20"]}>
	<ColorBlobs colors={extractedColors} weights={colorWeights} />
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
							<Tabs.Trigger value="multiplayer">
								Multiplayer
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
		<Card.Content class={collapsed ? "px-1 md:px-1" : ""}>
			{#if collapsed}
				<PlayerContentsCollapsed
					bind:coverUrl
				/>
			{:else if !collapsed && currentTab === "playing"}
				<PlayerContentsPlaying
					bind:coverUrl
					song={currentSong}
				/>
			{:else if !collapsed && currentTab === "multiplayer"}
			<PlayerContentsGroup />
			{:else if !collapsed && currentTab === "queue"}
				<PlayerContentsQueue />
			{/if}
		</Card.Content>
	</Card.Root>
</div>
