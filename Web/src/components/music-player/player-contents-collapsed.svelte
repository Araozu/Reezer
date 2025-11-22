<script lang="ts">
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import type { ISong } from "../../providers";
	import {
		Play,
		Pause,
		SkipForward,
		SkipBack,
		LoaderCircle,
	} from "lucide-svelte";
	import VolumeSlider from "./volume-slider.svelte";

	let {
		coverUrl = $bindable(),
		song = $bindable(),
	}: {
		coverUrl: string;
		song: ISong | undefined;
	} = $props();

	let player = GetCurrentPlayer();
	let isPaused = player.isPaused;
	let isBuffering = $derived(player.isBuffering);
</script>

<img
	class={["shadow aspect-square object-cover", "rounded"]}
	src={coverUrl}
	alt="Album portrait"
/>

<div class={["flex items-center gap-1 my-8", "flex-col"]}>
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
</div>
<div>
	<VolumeSlider collapsed={true} />
</div>
