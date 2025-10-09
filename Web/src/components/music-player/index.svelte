<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
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
	import { Slider } from "$lib/components/ui/slider/index.js";

	let { collapsed = $bindable() }: { collapsed: boolean } = $props();

	let player = GetCurrentPlayer();
	let song = $derived(player.currentSong);
	let isPaused = player.isPaused;
	let coverUrl = $derived(
		song ? `/api/Albums/${song.albumId}/cover` : "/vinyl.jpg",
	);
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
					<span>Now playing</span>
				{/if}

				<button
					class={[
						"hover:bg-zinc-200 rounded-sm cursor-pointer transition-colors",
						!collapsed && "mr-2",
					]}
					onclick={() => {
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
			<img
				class={[
					"shadow",
					collapsed ? "rounded" : "rounded-xl",
				]}
				src={coverUrl}
				alt="Album portrait"
			/>
			{#if !collapsed}
				<div class="py-2">
					<p
						class="font-bold font-display text-xl"
					>
						{song?.name ?? "-"}
					</p>
					<p
						class="font-medium text-foreground/80"
					>
						<span class="underline">
							{song?.artist ?? "-"}
						</span>
						• {song?.album ?? "-"}
					</p>
				</div>
			{/if}
			<div
				class={[
					"flex items-center gap-1 my-8",
					collapsed && "flex-col",
				]}
			>
				<button
					class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors"
				>
					<SkipBack class="m-2" size={16} />
				</button>
				<button
					class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full cursor-pointer transition-colors"
					onclick={() => player.TogglePlayPause()}
				>
					{#if $isPaused}
						<Play class="m-2" size={32} />
					{:else}
						<Pause class="m-2" size={32} />
					{/if}
				</button>
				<button
					class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors"
				>
					<SkipForward class="m-2" size={16} />
				</button>
			</div>
			<div
				class={[
					!collapsed &&
						"grid grid-cols-[1.5rem_auto_2rem] items-center gap-2",
				]}
			>
				{#if !collapsed}
					<div class="text-center">
						<Volume1 />
					</div>
				{/if}
				<div>
					<Slider
						type="single"
						orientation={collapsed
							? "vertical"
							: "horizontal"}
						bind:value={player.volume}
						max={100}
						step={1}
						onValueChange={(
							value: number,
						) => player.SetVolume(value)}
					/>
				</div>
				{#if !collapsed}
					<div class="text-center">
						<Volume2 />
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</div>
