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
	import { GetPlayerContext } from "~/player2/context/player-store";

	let {
		coverUrl = $bindable(),
		song = $bindable(),
	}: {
		coverUrl: string;
		song: ISong;
	} = $props();

	let player = GetPlayerContext();

	let isPaused = player.isPaused;
	let isBuffering = $derived(player.isBuffering);
</script>

<div class="flex justify-center">
	<img
		class={[
			"shadow-lg aspect-square object-cover",
			"rounded-2xl h-full w-full",
			"max-h-60 max-w-60 md:max-w-[30rem] md:max-h-[30rem]",
		]}
		src={coverUrl}
		alt="Album portrait"
	/>
</div>
<div class="py-3">
	<p class="font-bold font-display text-xl">
		{song?.name ?? "-"}
	</p>
	<p class="font-medium text-muted-foreground">
		<a class="hover:text-foreground transition-colors" href={`/artists/${song?.artistId ?? ""}`}>
			{song?.artist ?? "-"}
		</a>
		•
		<a class="hover:text-foreground transition-colors" href={`/albums/${song?.albumId}`}>
			{song?.album ?? "-"}
		</a>
	</p>
</div>

<div class={["flex items-center gap-1 my-6"]}>
	<button
		class="hover:bg-glass-bg-hover rounded-xl cursor-pointer transition-all duration-300 active:scale-95"
		onclick={() => player.Prev()}
	>
		<SkipBack class="m-2.5" size={18} />
	</button>
	<button
		class="bg-glass-bg hover:bg-glass-bg-hover rounded-full cursor-pointer transition-all duration-300 active:scale-95 border border-glass-border"
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
		class="hover:bg-glass-bg-hover rounded-xl cursor-pointer transition-all duration-300 active:scale-95"
		onclick={() => player.Next()}
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
