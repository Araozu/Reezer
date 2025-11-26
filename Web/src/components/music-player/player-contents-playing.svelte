<script lang="ts">
	import type { ISong } from "../../providers";
	import {
		Play,
		Pause,
		SkipForward,
		SkipBack,
		Volume2,
		Volume1,
		LoaderCircle,
	} from "lucide-svelte";
	import VolumeSlider from "./volume-slider.svelte";
	import PositionSlider from "./position-slider.svelte";
	import { GetPlayerStore } from "~/player2/stores/player-store";

	let {
		coverUrl = $bindable(),
		song = $bindable(),
	}: {
		coverUrl: string;
		song: ISong;
	} = $props();

	let player = GetPlayerStore();

	let isPaused = player.isPaused;
	let isBuffering = $derived(player.isBuffering);
</script>

<div class="flex justify-center">
	<img
		class={[
			"shadow aspect-square object-cover",
			"rounded-xl h-full w-full",
			"max-h-60 max-w-60 md:max-w-[30rem] md:max-h-[30rem]",
		]}
		src={coverUrl}
		alt="Album portrait"
	/>
</div>
<div class="py-2">
	<p class="font-bold font-display text-xl">
		{song?.name ?? "-"}
	</p>
	<p class="font-medium text-foreground/80">
		<a class="underline" href={`/artists/${song?.artistId ?? ""}`}>
			{song?.artist ?? "-"}
		</a>
		•
		<a class="hover:underline" href={`/albums/${song?.albumId}`}>
			{song?.album ?? "-"}
		</a>
	</p>
</div>

<div class={["flex items-center gap-1 my-8"]}>
	<button
		class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors"
		onclick={() => player.Prev()}
	>
		<SkipBack class="m-2" size={16} />
	</button>
	<button
		class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full cursor-pointer transition-colors"
		onclick={() => player.TogglePlayPause()}
	>
		{#if isBuffering}
			<LoaderCircle class="m-2 animate-spin" size={32} />
		{:else if $isPaused}
			<Play class="m-2" size={32} />
		{:else}
			<Pause class="m-2" size={32} />
		{/if}
	</button>
	<button
		class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors"
		onclick={() => player.Next()}
	>
		<SkipForward class="m-2" size={16} />
	</button>
	<div class="flex-1 ml-4">
		<PositionSlider />
	</div>
</div>
<div class={["grid grid-cols-[1.5rem_auto_2rem] items-center gap-2"]}>
	<div class="text-center">
		<Volume1 />
	</div>
	<div>
		<VolumeSlider collapsed={false} />
	</div>
	<div class="text-center">
		<Volume2 />
	</div>
</div>
