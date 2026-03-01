<script lang="ts">
	import { Play, Pause, SkipForward, SkipBack, LoaderCircle } from "lucide-svelte";
	import VolumeSlider from "./volume-slider.svelte";
	import { GetSvelteManagerContext } from "~/context/music-player-context";

	let { coverUrl = $bindable() }: { coverUrl: string } = $props();

	const svManager = GetSvelteManagerContext();

	let isPaused = $derived(svManager.playState === "paused");
	let isBuffering = $derived(svManager.playState === "buffering");
</script>

<img
	class={["shadow-lg aspect-square object-cover", "rounded-xl"]}
	src={coverUrl}
	alt="Album portrait"
/>

<div class={["gap-1 my-8 flex items-center", "flex-col"]}>
	<button
		class="hover:bg-glass-bg-hover rounded-xl cursor-pointer transition-all duration-300 active:scale-95"
		onclick={() => svManager.imanager.Prev()}
	>
		<SkipBack class="m-2" size={16} />
	</button>
	<button
		class="hover:bg-glass-bg-hover cursor-pointer rounded-full transition-all duration-300 active:scale-95"
		onclick={() => svManager.imanager.TogglePlayPause()}
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
		onclick={() => svManager.imanager.Next()}
	>
		<SkipForward class="m-2" size={16} />
	</button>
</div>
<div>
	<VolumeSlider collapsed={true} />
</div>
