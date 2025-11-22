<script lang="ts">
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import type { ISong } from "../../providers";
	import { Play, Pause, LoaderCircle } from "lucide-svelte";

	let {
		coverUrl = $bindable(),
		song = $bindable(),
		expand,
	}: {
		coverUrl: string;
		song: ISong | undefined;
		expand: () => void;
	} = $props();

	let player = GetCurrentPlayer();
	let isPaused = player.isPaused;
	let isBuffering = $derived(player.isBuffering);
</script>

<div class="grid grid-cols-[3rem_auto_3rem] items-center gap-4">
	<div>
		<img
			class={["shadow aspect-square object-cover", "rounded"]}
			src={coverUrl}
			alt="Album portrait"
		/>
	</div>
	<button class="inline-block w-full text-left" onclick={expand}>
		<p>{song?.name ?? "-"}</p>
		<p>{song?.artist ?? "-"}</p>
	</button>
	<div>
		<button
			class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full cursor-pointer transition-colors"
			onclick={() => player.TogglePlayPause()}
		>
			{#if isBuffering}
				<LoaderCircle
					class="m-2 animate-spin"
					size={32}
				/>
			{:else if $isPaused}
				<Play class="m-2" size={32} />
			{:else}
				<Pause class="m-2" size={32} />
			{/if}
		</button>
	</div>
</div>
