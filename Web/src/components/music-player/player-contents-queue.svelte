<script lang="ts">
import { EllipsisVertical, X, GripVertical, Repeat, Repeat1 } from "lucide-svelte";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { GetQueueContext } from "~/context/music-player-context";
import { SvelteRuneQueue } from "~/audio-engine/queues/SvelteRuneQueue.svelte";
import { LoopMode } from "~/audio-engine/types";
import { dndzone } from "svelte-dnd-action";
import { flip } from "svelte/animate";

let queue = GetQueueContext();
let sv_queue = new SvelteRuneQueue(queue);

let current_queue = $derived(sv_queue.queue);
let currentIdx = $derived(sv_queue.currentIdx);
let loopMode = $derived(sv_queue.loopMode);

let items = $state<{id: string, song: any, isCurrent: boolean}[]>([]);
let isDragging = $state(false);
let dragDisabled = $state(true);

$effect(() =>
{
	if (!isDragging)
	{
		items = current_queue.map((song, i) => ({
			id: crypto.randomUUID(),
			song,
			isCurrent: i === currentIdx,
		}));
	}
});

function handleDndConsider(e: CustomEvent<any>)
{
	items = e.detail.items;
	isDragging = true;
}

function handleDndFinalize(e: CustomEvent<any>)
{
	items = e.detail.items;
	isDragging = false;
	dragDisabled = true;

	const newCurrentIdx = items.findIndex((i) => i.isCurrent);
	queue.SetQueue(items.map((i) => i.song), newCurrentIdx);
}

function startDrag(e: MouseEvent | TouchEvent)
{
	dragDisabled = false;
}

function clearAbove(index: number)
{
	for (let i = index - 1; i >= 0; i -= 1)
	{
		queue.RemoveAt(i);
	}
}

function clearBelow(index: number)
{
	const length = items.length;
	for (let i = length - 1; i > index; i -= 1)
	{
		queue.RemoveAt(i);
	}
}

function toggleLoopMode()
{
	const nextMode = (loopMode + 1) % 3;
	queue.SetLoopMode(nextMode);
}
</script>

<div class="flex items-center justify-between px-4 py-2 mb-2">
	<h2 class="text-lg font-semibold">Queue</h2>
	<button
		class="p-2 rounded-full hover:bg-glass-bg-hover transition-colors touch-action-manipulation [-webkit-tap-highlight-color:transparent]"
		onclick={toggleLoopMode}
		title="Toggle Loop Mode"
	>
		{#if loopMode === LoopMode.None}
			<Repeat class="opacity-50" />
		{:else if loopMode === LoopMode.All}
			<Repeat class="text-primary" />
		{:else if loopMode === LoopMode.One}
			<Repeat1 class="text-primary" />
		{/if}
	</button>
</div>

<div
	class="space-y-1.5 max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden"
	use:dndzone={{items, dragDisabled, flipDurationMs: 300}}
	onconsider={handleDndConsider}
	onfinalize={handleDndFinalize}
>
	{#each items as item, index (item.id)}
		<div
			animate:flip={{duration: 300}}
			class={[
				"group/queue-item w-full flex items-stretch rounded-xl transition-all duration-300 ease-out",
				"backdrop-blur-lg border",
				"shadow-[0_2px_12px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]",
				item.isCurrent
					? "bg-primary/20 border-primary/30 shadow-[0_4px_16px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]"
					: "bg-glass-bg border-glass-border hover:bg-glass-bg-hover hover:border-glass-border-hover hover:shadow-[0_4px_16px_-4px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)]",
			]}
		>
			<div
				class="pl-3 pr-1 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none opacity-50 hover:opacity-100 transition-opacity"
				onmousedown={startDrag}
				ontouchstart={startDrag}
				role="button"
				tabindex="0"
			>
				<GripVertical size={16} />
			</div>

			<button
				class="flex-1 min-w-0 text-left cursor-pointer rounded-lg p-3 transition-all duration-300 touch-action-manipulation [-webkit-tap-highlight-color:transparent]"
				onclick={() => queue.PlayAt(index)}
			>
				<p class="font-medium truncate">
					{item.song.name}
				</p>
				<p class="text-sm text-muted-foreground truncate">
					<span class="truncate">{item.song.artist}</span>
					<span class="shrink-0"> • </span>
					<span class="truncate">{item.song.album}</span>
				</p>
			</button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="px-2 opacity-0 group-hover/queue-item:opacity-100 hover:bg-glass-bg-hover transition-all duration-300 active:scale-95 flex items-center cursor-pointer touch-action-manipulation [-webkit-tap-highlight-color:transparent]"
					onclick={(e) => e.stopPropagation()}
				>
					<EllipsisVertical size={18} class="text-muted-foreground" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item onclick={() => clearAbove(index)} disabled={index === 0}>
						Clear queue above
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => clearBelow(index)} disabled={index === items.length - 1}>
						Clear queue below
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<button
				class="px-3 opacity-0 group-hover/queue-item:opacity-100 hover:bg-destructive/20 rounded-r-[11px] transition-all duration-300 active:scale-95 flex items-center touch-action-manipulation [-webkit-tap-highlight-color:transparent]"
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
	{#if items.length === 0}
		<p class="text-center text-muted-foreground py-8">
			No songs in queue
		</p>
	{/if}
</div>
