<script lang="ts">
import { page } from "$app/state";
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
import { GetPlayerContext, GetQueueContext } from "~/context/music-player-context";
import type { ISong } from "~/audio-engine/types";

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

let artistName = $derived.by(() =>
{
	if (!song) return "-";

	if (song.type === "regular") return song.artist;
	else if (song.type === "youtube") return "YouTube";
	else return "-";
});
let artistLink = $derived.by(() =>
{
	if (!song) return "#";

	if (song.type === "regular") return `/${roomId}/artists/${song.artistId}`;
	else if (song.type === "youtube") return `/${roomId}/yt`;
	else return "#";
});

</script>

<div class="flex justify-center">
	<img
		class={[
			"shadow-lg aspect-square",
			song?.type === "youtube" ? "object-contain" : "object-cover",
			"rounded-2xl h-full w-full",
			"max-h-60 max-w-60 md:max-w-120 md:max-h-120",
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
		<a class="hover:text-foreground transition-colors" href={artistLink}>
			{artistName}
		</a>
		•
		<a class="hover:text-foreground transition-colors" href={`/${roomId}/albums/${song?.albumId ?? ""}`}>
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
		class="hover:bg-glass-bg-hover rounded-full cursor-pointer transition-all duration-300 active:scale-95 border border-glass-border"
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
