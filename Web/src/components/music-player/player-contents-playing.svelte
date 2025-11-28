<script lang="ts">
	import { page } from "$app/state";
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
	import { GetPlayerContext, GetQueueContext } from "~/player2/context/player-store";
	import LavaLamp from "./lava-lamp.svelte";
	import { extractColorsFromImage } from "$lib/color-extractor";

	let {
		coverUrl = $bindable(),
		song,
	}: {
		coverUrl: string;
		song: ISong | null;
	} = $props();

	let player = GetPlayerContext();
	let queue = GetQueueContext();
	const roomId = page.params.roomId;

	// FIXME: regression
	let isPaused = false;
	let isBuffering = false;

	let extractedColors = $state<string[]>(["#ff6b6b", "#4ecdc4", "#ffe66d"]);
	let isDark = $state(false);

	$effect(() => {
		if (coverUrl) {
			extractColorsFromImage(coverUrl)
				.then((result) => {
					extractedColors = result.colors;
					isDark = result.isDark;
				})
				.catch(() => {
					extractedColors = ["#ff6b6b", "#4ecdc4", "#ffe66d"];
					isDark = false;
				});
		}
	});
</script>

<div class="flex justify-center">
	<div class="relative max-h-60 max-w-60 md:max-w-120 md:max-h-120 aspect-square w-full">
		<LavaLamp colors={extractedColors} {isDark} />
		<img
			class={[
				"shadow-lg aspect-square object-cover",
				"rounded-2xl h-full w-full relative z-10",
			]}
			src={coverUrl}
			alt="Album portrait"
		/>
	</div>
</div>
<div class="py-3">
	<p class="font-bold font-display text-xl">
		{song?.name ?? "-"}
	</p>
	<p class="font-medium text-muted-foreground">
		<a class="hover:text-foreground transition-colors" href={`/${roomId}/artists/${song?.artistId ?? ""}`}>
			{song?.artist ?? "-"}
		</a>
		•
		<a class="hover:text-foreground transition-colors" href={`/${roomId}/albums/${song?.albumId}`}>
			{song?.album ?? "-"}
		</a>
	</p>
</div>

<div class={["flex items-center gap-1 my-6"]}>
	<button
		class="hover:bg-glass-bg-hover rounded-xl cursor-pointer transition-all duration-300 active:scale-95"
		onclick={() => queue.Prev()}
	>
		<SkipBack class="m-2.5" size={18} />
	</button>
	<button
		class="bg-glass-bg hover:bg-glass-bg-hover rounded-full cursor-pointer transition-all duration-300 active:scale-95 border border-glass-border"
		onclick={() => player.TogglePlayPause()}
	>
		{#if isBuffering}
			<LoaderCircle class="m-2 animate-spin" size={32} />
		{:else if isPaused}
			<Play class="m-2" size={32} />
		{:else}
			<Pause class="m-2" size={32} />
		{/if}
	</button>
	<button
		class="hover:bg-glass-bg-hover rounded-xl cursor-pointer transition-all duration-300 active:scale-95"
		onclick={() => queue.Next()}
	>
		<SkipForward class="m-2.5" size={18} />
	</button>
	<div class="flex-1 ml-4">
		<PositionSlider />
	</div>
</div>
<div class={["grid grid-cols-[1.5rem_auto_2rem] items-center gap-2"]}>
	<div class="text-center text-muted-foreground">
		<Volume1 size={18} />
	</div>
	<div>
		<VolumeSlider collapsed={false} />
	</div>
	<div class="text-center text-muted-foreground">
		<Volume2 size={18} />
	</div>
</div>
