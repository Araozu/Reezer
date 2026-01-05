<script lang="ts">
import { Play, Pause, LoaderCircle } from "lucide-svelte";
import type { ISong } from "~/audio-engine/types";
import { GetSvelteManagerContext } from "~/context/music-player-context";

let {
	coverUrl = $bindable(),
	song,
	expand,
}: {
	coverUrl: string;
	song: ISong | null;
	expand: () => void;
} = $props();

const svManager = GetSvelteManagerContext();

let isPaused = $derived(svManager.playState === "paused");
let isBuffering = $derived(svManager.playState === "buffering");
</script>

<div class="grid grid-cols-[3rem_auto_3rem] items-center gap-4">
	<div>
		<img
			class={["shadow-lg aspect-square object-cover", "rounded-xl"]}
			src={coverUrl}
			alt="Album portrait"
		/>
	</div>
	<button class="inline-block w-full text-left" onclick={expand}>
		<p class="font-medium truncate">{song?.name ?? "-"}</p>
		<p class="text-sm text-muted-foreground truncate">{song?.artist ?? "-"}</p>
	</button>
	<div>
		<button
			class="hover:bg-glass-bg-hover rounded-full cursor-pointer transition-all duration-300 active:scale-95"
			onclick={() => svManager.imanager.TogglePlayPause()}
		>
			{#if isBuffering}
				<LoaderCircle
					class="m-2 animate-spin"
					size={32}
				/>
			{:else if isPaused}
				<Play class="m-2" size={32} />
			{:else}
				<Pause class="m-2" size={32} />
			{/if}
		</button>
	</div>
</div>
