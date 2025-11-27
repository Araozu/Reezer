<script lang="ts">
	import { X } from "lucide-svelte";
	import { GetPlayerContext } from "~/player2/context/player-store";

	let player = GetPlayerContext();

	let queue = $derived(player.queue);
	let currentSongIdx = $derived(player.currentSongIdx);
</script>

<div class="space-y-1.5 max-h-[calc(100vh-8rem)] overflow-scroll">
	{#each queue as song, index (song.id + index)}
		<div
			class={[
				"group/queue-item w-full flex items-center gap-2 p-3 border border-glass-border rounded-xl transition-all duration-300",
				index === currentSongIdx
					? "bg-primary/15 border-primary/30"
					: "hover:bg-glass-bg-hover",
			]}
		>
			<button
				class="flex-1 text-left cursor-pointer hover:bg-glass-bg rounded-lg p-2 -m-2 transition-all duration-300"
				onclick={() => player.PlayIdx(index)}
			>
				<p class="font-medium truncate">
					{song.name}
				</p>
				<p class="text-sm text-muted-foreground truncate">
					<span>{song.artist}</span>
					•
					{song.album}
				</p>
			</button>
			<button
				class="p-2 opacity-0 group-hover/queue-item:opacity-100 hover:bg-destructive/20 rounded-lg transition-all duration-300 active:scale-95"
				onclick={(e) =>
				{
					e.stopPropagation();
					player.RemoveSongFromQueue(index);
				}}
				aria-label="Remove song from queue"
			>
				<X size={18} class="text-muted-foreground hover:text-destructive transition-colors" />
			</button>
		</div>
	{/each}
	{#if queue.length === 0}
		<p class="text-center text-muted-foreground py-8">
			No songs in queue
		</p>
	{/if}
</div>
