<script lang="ts">
import type { ISong } from "~/providers";
import { Play, EllipsisVertical, ExternalLink, Plus, ListStart } from "lucide-svelte";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { GetQueueContext } from "~/context/music-player-context";

let { song }: { song: ISong } = $props();

const queue = GetQueueContext();
</script>

<div
	class="
	w-full flex flex-col gap-3 rounded-xl
	bg-glass-bg hover:bg-glass-bg-hover
	border border-glass-border hover:border-glass-border-hover
	backdrop-blur-xl
	shadow-[0_2px_12px_-2px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]
	hover:shadow-[0_4px_16px_-2px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)]
	transition-all duration-300 ease-out
	overflow-hidden
	"
>
	<button
		class="
		group relative w-full aspect-video shrink-0 overflow-hidden
		bg-glass-bg
		flex items-center justify-center
		cursor-pointer
		touch-action-manipulation [-webkit-tap-highlight-color:transparent]
		active:scale-[0.98]
		transition-transform duration-200
		"
		data-slot="button"
		onclick={() => queue.PlaySong(song)}
	>
		<img
			src="/api/Yt/{song.id}/thumbnail"
			alt={song.name}
			class="w-full h-full object-cover"
		/>
		<div class="
			absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
			transition-opacity duration-200
			flex items-center justify-center
			">
			<Play class="w-12 h-12 text-white fill-white" />
		</div>
	</button>

	<div class="px-3 pb-3 flex items-start justify-between gap-2">
		<div class="flex-1 min-w-0">
			<h3 class="font-medium line-clamp-2 leading-snug">{song.name}</h3>
			<p class="text-sm text-muted-foreground mt-1">YouTube Song</p>
		</div>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="
				shrink-0 p-1.5 rounded-lg
				hover:bg-glass-bg-active
				transition-all duration-200
				active:scale-95
				touch-action-manipulation [-webkit-tap-highlight-color:transparent]
				"
				onclick={(e) => e.stopPropagation()}
			>
				<EllipsisVertical size={20} class="text-muted-foreground" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item onclick={() => queue.AddNextSong(song)}>
					<Plus size={16} class="mr-2" />
					Play Next
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => queue.AddLastSong(song)}>
					<ListStart size={16} class="mr-2" />
					Add to Queue
				</DropdownMenu.Item>
				<a href={`https://www.youtube.com/watch?v=${song.id}`} target="_blank" rel="noopener noreferrer">
					<DropdownMenu.Item>
						<ExternalLink size={16} class="mr-2" />
						See in YouTube
					</DropdownMenu.Item>
				</a>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>
