<script lang="ts">
import {
	Play,
	Pause,
	SkipForward,
	SkipBack,
	LoaderCircle,
} from "lucide-svelte";
import VolumeSlider from "./volume-slider.svelte";
import { GetPlayerContext, GetQueueContext } from "~/context/music-player-context";

let {
	coverUrl = $bindable(),
}: {
	coverUrl: string;
} = $props();

let player = GetPlayerContext();
let queue  = GetQueueContext();

// FIXME: regression
let isPaused = false;
let isBuffering = false;
</script>

<img
	class={["shadow-lg aspect-square object-cover", "rounded-xl"]}
	src={coverUrl}
	alt="Album portrait"
/>

<div class={["flex items-center gap-1 my-8", "flex-col"]}>
	<button
		class="hover:bg-glass-bg-hover rounded-xl cursor-pointer transition-all duration-300 active:scale-95"
		onclick={() => queue.Prev()}
	>
		<SkipBack class="m-2" size={16} />
	</button>
	<button
		class="hover:bg-glass-bg-hover rounded-full cursor-pointer transition-all duration-300 active:scale-95"
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
		<SkipForward class="m-2" size={16} />
	</button>
</div>
<div>
	<VolumeSlider collapsed={true} />
</div>
