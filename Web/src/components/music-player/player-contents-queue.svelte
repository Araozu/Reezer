<script lang="ts">
	import { X } from "lucide-svelte";
	import { GetQueueContext } from "~/player2/context/player-store";
	import { SvelteRuneQueue } from "~/player2/queues/SvelteRuneQueue.svelte";

	let queue = GetQueueContext();
	let sv_queue = new SvelteRuneQueue(queue);

	let current_queue = $derived(sv_queue.queue);
	let currentIdx = $derived(sv_queue.currentIdx);
</script>

<div class="space-y-1.5 max-h-[calc(100vh-8rem)] overflow-scroll">
	{#each current_queue as song, index (song.id + index)}
		<div
			class={[
				"group/queue-item w-full flex items-center gap-2 p-3 border border-glass-border rounded-xl transition-all duration-300",
				index === currentIdx
					? "bg-primary/15 border-primary/30"
					: "hover:bg-glass-bg-hover",
			]}
		>
			<button
				class="flex-1 text-left cursor-pointer hover:bg-glass-bg rounded-lg p-2 -m-2 transition-all duration-300"
				onclick={() => queue.PlayIdx(index)}
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
					queue.RemoveIdx(index);
				}}
				aria-label="Remove song from queue"
			>
				<X size={18} class="text-muted-foreground hover:text-destructive transition-colors" />
			</button>
		</div>
	{/each}
	{#if current_queue.length === 0}
		<p class="text-center text-muted-foreground py-8">
			No songs in queue
		</p>
	{/if}
</div>
