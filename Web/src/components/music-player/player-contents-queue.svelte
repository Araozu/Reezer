<script lang="ts">
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import type { ISong } from "../../providers";

	let player = GetCurrentPlayer();
	let queue = $derived(player.queue);
	let currentSongIdx = $derived(player.currentSongIdx);
</script>

<div class="space-y-1">
	{#each queue as song, index (song.id)}
		<div
			class={[
				"p-3 border rounded-lg",
				index === currentSongIdx && "bg-primary/10 border-primary",
			]}
		>
			<p class="font-medium">
				{song.name}
			</p>
			<p class="text-sm text-foreground/80">
				<span class="underline">{song.artist}</span>
				•
				{song.album}
			</p>
		</div>
	{/each}
	{#if queue.length === 0}
		<p class="text-center text-foreground/60 py-8">No songs in queue</p>
	{/if}
</div>
