<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import {
		ChevronsRight,
		ChevronsLeft,
		Play,
		Pause,
		SkipForward,
		SkipBack,
		Volume1,
		Volume2,
	} from "lucide-svelte";
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import VolumeSlider from "./volume-slider.svelte";
	import PositionSlider from "./position-slider.svelte";
    import PlayerContentsCollapsed from "./player-contents-collapsed.svelte";

	let { collapsed = $bindable() }: { collapsed: boolean } = $props();

	let player = GetCurrentPlayer();
	let song = $derived(player.currentSong);
	let isPaused = player.isPaused;
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
					<Tabs.Root class="w-[400px]" bind:value={currentTab}>
						<Tabs.List>
							<Tabs.Trigger value="playing">Now Playing</Tabs.Trigger>
							<Tabs.Trigger value="queue">Queue</Tabs.Trigger>
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
			<PlayerContentsCollapsed bind:coverUrl={coverUrl} bind:song={song} />
			{/if}

			<!-- <img -->
			<!-- 	class={[ -->
			<!-- 		"shadow aspect-square object-cover", -->
			<!-- 		collapsed ? "rounded" : "rounded-xl", -->
			<!-- 	]} -->
			<!-- 	src={coverUrl} -->
			<!-- 	alt="Album portrait" -->
			<!-- /> -->
			<!-- {#if !collapsed} -->
			<!-- 	<div class="py-2"> -->
			<!-- 		<p -->
			<!-- 			class="font-bold font-display text-xl" -->
			<!-- 		> -->
			<!-- 			{song?.name ?? "-"} -->
			<!-- 		</p> -->
			<!-- 		<p -->
			<!-- 			class="font-medium text-foreground/80" -->
			<!-- 		> -->
			<!-- 			<span class="underline"> -->
			<!-- 				{song?.artist ?? "-"} -->
			<!-- 			</span> -->
			<!-- 			• -->
			<!-- 			<a -->
			<!-- 				class="hover:underline" -->
			<!-- 				href={`/albums/${song?.albumId}`} -->
			<!-- 			> -->
			<!-- 				{song?.album ?? "-"} -->
			<!-- 			</a> -->
			<!-- 		</p> -->
			<!-- 	</div> -->
			<!-- {/if} -->
			<!---->
			<!-- {#if currentTab === "queue"} -->
			<!-- 	<p>queue</p> -->
			<!-- {/if} -->
			<!-- <div -->
			<!-- 	class={[ -->
			<!-- 		"flex items-center gap-1 my-8", -->
			<!-- 		collapsed && "flex-col", -->
			<!-- 	]} -->
			<!-- > -->
			<!-- 	<button -->
			<!-- 		class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors" -->
			<!-- 		onclick={() => player.Previous()} -->
			<!-- 	> -->
			<!-- 		<SkipBack class="m-2" size={16} /> -->
			<!-- 	</button> -->
			<!-- 	<button -->
			<!-- 		class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full cursor-pointer transition-colors" -->
			<!-- 		onclick={() => player.TogglePlayPause()} -->
			<!-- 	> -->
			<!-- 		{#if $isPaused} -->
			<!-- 			<Play class="m-2" size={32} /> -->
			<!-- 		{:else} -->
			<!-- 			<Pause class="m-2" size={32} /> -->
			<!-- 		{/if} -->
			<!-- 	</button> -->
			<!-- 	<button -->
			<!-- 		class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors" -->
			<!-- 		onclick={() => player.Next()} -->
			<!-- 	> -->
			<!-- 		<SkipForward class="m-2" size={16} /> -->
			<!-- 	</button> -->
			<!-- 	{#if !collapsed} -->
			<!-- 		<div class="flex-1 ml-4"> -->
			<!-- 			<PositionSlider /> -->
			<!-- 		</div> -->
			<!-- 	{/if} -->
			<!-- </div> -->
			<!-- <div -->
			<!-- 	class={[ -->
			<!-- 		!collapsed && -->
			<!-- 			"grid grid-cols-[1.5rem_auto_2rem] items-center gap-2", -->
			<!-- 	]} -->
			<!-- > -->
			<!-- 	{#if !collapsed} -->
			<!-- 		<div class="text-center"> -->
			<!-- 			<Volume1 /> -->
			<!-- 		</div> -->
			<!-- 	{/if} -->
			<!-- 	<div> -->
			<!-- 		<VolumeSlider {collapsed} /> -->
			<!-- 	</div> -->
			<!-- 	{#if !collapsed} -->
			<!-- 		<div class="text-center"> -->
			<!-- 			<Volume2 /> -->
			<!-- 		</div> -->
			<!-- 	{/if} -->
			<!-- </div> -->
		</Card.Content>
	</Card.Root>
</div>
