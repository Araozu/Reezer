<script lang="ts">
	import type { YtSongDto } from "./queries";
	import { Play } from "lucide-svelte";

	let { song }: { song: YtSongDto } = $props();
</script>

<button
	class="
		w-full flex items-center gap-4 p-3 rounded-xl
		bg-glass-bg hover:bg-glass-bg-hover
		border border-glass-border hover:border-glass-border-hover
		backdrop-blur-xl
		shadow-[0_2px_12px_-2px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]
		hover:shadow-[0_4px_16px_-2px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)]
		transition-all duration-300 ease-out
		active:scale-[0.98]
		touch-action-manipulation [-webkit-tap-highlight-color:transparent]
	"
	data-slot="button"
>
	<div class="
		relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden
		bg-glass-bg border border-glass-border
		flex items-center justify-center
	">
		{#if song.cachedPath}
			<img 
				src="/api/Yt/{song.ytId}/thumbnail" 
				alt={song.name}
				class="w-full h-full object-cover"
			/>
		{:else}
			<div class="text-muted-foreground text-sm">No thumbnail</div>
		{/if}
		<div class="
			absolute inset-0 bg-black/30 opacity-0 hover:opacity-100
			transition-opacity duration-200
			flex items-center justify-center
		">
			<Play class="w-8 h-8 text-white fill-white" />
		</div>
	</div>

	<div class="flex-1 text-left min-w-0">
		<h3 class="font-medium truncate">{song.name}</h3>
		<p class="text-sm text-muted-foreground truncate">YouTube Song</p>
	</div>
</button>
