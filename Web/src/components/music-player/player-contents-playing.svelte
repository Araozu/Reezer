<script lang="ts">
    import { GetCurrentPlayer } from "../../player/index.svelte";
    import type { ISong } from "../../providers";
	import {
		Play,
		Pause,
		SkipForward,
		SkipBack,
		Volume2,
		Volume1,
	} from "lucide-svelte";
    import VolumeSlider from "./volume-slider.svelte";
    import PositionSlider from "./position-slider.svelte";

let {
	coverUrl = $bindable(),
	song = $bindable(),
}: {
	coverUrl: string,
	song: ISong,
} = $props();

	let player = GetCurrentPlayer();
	let isPaused = player.isPaused;
</script>

<img
	class={[
		"shadow aspect-square object-cover",
		"rounded-xl",
	]}
	src={coverUrl}
	alt="Album portrait"
/>
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
			•
			<a
				class="hover:underline"
				href={`/albums/${song?.albumId}`}
			>
				{song?.album ?? "-"}
			</a>
		</p>
	</div>

<div
	class={[
		"flex items-center gap-1 my-8",
	]}
>
	<button
		class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors"
		onclick={() => player.Previous()}
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
		onclick={() => player.Next()}
	>
		<SkipForward class="m-2" size={16} />
	</button>
		<div class="flex-1 ml-4">
			<PositionSlider />
		</div>
</div>
<div
	class={[
		"grid grid-cols-[1.5rem_auto_2rem] items-center gap-2",
	]}
>
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
