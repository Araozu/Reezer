<script lang="ts">
	import { GetCurrentPlayer } from "../../player/index.svelte";

	let player = GetCurrentPlayer();
	let queue = $derived(player.queue);
	let currentSongIdx = $derived(player.currentSongIdx);
</script>

<div class="space-y-1 max-h-[calc(100vh-8rem)] overflow-scroll">
	{#each queue as song, index (song.id + index)}
		<button
			class={[
				"w-full text-left p-3 border rounded-lg cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900",
				index === currentSongIdx && "bg-primary/10 border-primary",
			]}
			onclick={() => player.PlaySongAtIndex(index)}
		>
			<p class="font-medium">
				{song.name}
			</p>
			<p class="text-sm text-foreground/80">
				<span class="underline">{song.artist}</span>
				•
				{song.album}
			</p>
		</button>
	{/each}
	{#if queue.length === 0}
		<p class="text-center text-foreground/60 py-8">No songs in queue</p>
	{/if}
</div>
