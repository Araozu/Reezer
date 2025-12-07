<script lang="ts">
	import type { ISong } from "~/providers";
	import { Play } from "lucide-svelte";
	import { GetQueueContext } from "~/player2/context/player-store";

	let { song }: { song: ISong } = $props();

	const queue = GetQueueContext();
</script>

<button
	class="
		group w-full flex flex-col gap-3 rounded-xl
		bg-glass-bg hover:bg-glass-bg-hover
		border border-glass-border hover:border-glass-border-hover
		backdrop-blur-xl
		shadow-[0_2px_12px_-2px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]
		hover:shadow-[0_4px_16px_-2px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)]
		transition-all duration-300 ease-out
		active:scale-[0.98]
		touch-action-manipulation [-webkit-tap-highlight-color:transparent]
		overflow-hidden
	"
	data-slot="button"
	onclick={() => queue.PlaySong(song)}
>
	<div class="
		relative w-full aspect-video shrink-0 overflow-hidden
		bg-glass-bg
		flex items-center justify-center
	">
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
	</div>

	<div class="px-3 pb-3 text-left w-full">
		<h3 class="font-medium line-clamp-2 leading-snug">{song.name}</h3>
		<p class="text-sm text-muted-foreground mt-1">YouTube Song</p>
	</div>
</button>
