<script lang="ts">
	import { EllipsisVertical, MoreVertical, X } from "lucide-svelte";
	import { GetQueueContext } from "~/player2/context/player-store";
	import { SvelteRuneQueue } from "~/player2/queues/SvelteRuneQueue.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	let queue = GetQueueContext();
	let sv_queue = new SvelteRuneQueue(queue);

	let current_queue = $derived(sv_queue.queue);
	let currentIdx = $derived(sv_queue.currentIdx);

	function clearAbove(index: number)
	{
		for (let i = index - 1; i >= 0; i--)
		{
			queue.RemoveAt(i);
		}
	}

	function clearBelow(index: number)
	{
		const length = current_queue.length;
		for (let i = length - 1; i > index; i--)
		{
			queue.RemoveAt(i);
		}
	}
</script>

<div class="space-y-1.5 max-h-[calc(100vh-8rem)] overflow-scroll">
	{#each current_queue as song, index (song.id + index)}
		<div
			class={[
				"group/queue-item w-full flex items-stretch rounded-xl transition-all duration-300 ease-out",
				"backdrop-blur-lg border",
				"shadow-[0_2px_12px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]",
				index === currentIdx
					? "bg-primary/20 border-primary/30 shadow-[0_4px_16px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]"
					: "bg-glass-bg border-glass-border hover:bg-glass-bg-hover hover:border-glass-border-hover hover:shadow-[0_4px_16px_-4px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)]",
			]}
		>
			<button
				class="flex-1 min-w-0 text-left cursor-pointer rounded-lg p-3 transition-all duration-300"
				onclick={() => queue.PlayAt(index)}
			>
				<p class="font-medium truncate">
					{song.name}
				</p>
				<p class="text-sm text-muted-foreground truncate">
					<span class="truncate">{song.artist}</span>
					<span class="shrink-0"> • </span>
					<span class="truncate">{song.album}</span>
				</p>
			</button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="px-2 opacity-0 group-hover/queue-item:opacity-100 hover:bg-glass-bg-hover transition-all duration-300 active:scale-95 flex items-center cursor-pointer"
					onclick={(e) => e.stopPropagation()}
				>
					<EllipsisVertical size={18} class="text-muted-foreground" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item onclick={() => clearAbove(index)} disabled={index === 0}>
						Clear queue above
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => clearBelow(index)} disabled={index === current_queue.length - 1}>
						Clear queue below
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<button
				class="px-3 opacity-0 group-hover/queue-item:opacity-100 hover:bg-destructive/20 rounded-r-[11px] transition-all duration-300 active:scale-95 flex items-center"
				onclick={(e) =>
				{
					e.stopPropagation();
					queue.RemoveAt(index);
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
