<script lang="ts">
	import { GetPlayerStore } from "~/player2/stores/player-store";
	import { X } from "lucide-svelte";

	let player = GetPlayerStore();

	let queue = $derived(player.queue);
	let currentSongIdx = $derived(player.currentSongIdx);
</script>

<div class="space-y-1 max-h-[calc(100vh-8rem)] overflow-scroll">
	{#each queue as song, index (song.id + index)}
		<div
			class={[
				"w-full flex items-center gap-2 p-3 border rounded-lg transition-colors",
				index === currentSongIdx &&
					"bg-primary/10 border-primary",
			]}
		>
			<button
				class="flex-1 text-left cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded p-2 -m-2"
				onclick={() => player.PlayIdx(index)}
			>
				<p class="font-medium">
					{song.name}
				</p>
				<p class="text-sm text-foreground/80">
					<span class="underline"
						>{song.artist}</span
					>
					•
					{song.album}
				</p>
			</button>
			<button
				class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
				onclick={(e) =>
				{
					e.stopPropagation();
					player.RemoveSongFromQueue(index);
				}}
				aria-label="Remove song from queue"
			>
				<X size={18} class="text-foreground/60" />
			</button>
		</div>
	{/each}
	{#if queue.length === 0}
		<p class="text-center text-foreground/60 py-8">
			No songs in queue
		</p>
	{/if}
</div>
