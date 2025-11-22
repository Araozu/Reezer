<script lang="ts">
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import { Play, Pause, SkipForward, SkipBack, Loader2 } from "lucide-svelte";

	let player = GetCurrentPlayer();
	let song = $derived(player.currentSong);
	let isPaused = player.isPaused;
	let isBuffering = $derived(player.isBuffering);
	let coverUrl = $derived(song ? `/api/Albums/${song.albumId}/cover` : "/vinyl.jpg");
</script>

<div class="flex items-center gap-3 w-full">
	<img
		class="w-12 h-12 rounded object-cover shadow"
		src={coverUrl}
		alt="Album cover"
	/>
	<div class="flex-1 min-w-0">
		<p class="font-bold text-sm truncate">
			{song?.name ?? "-"}
		</p>
		<p class="text-xs text-foreground/80 truncate">
			{song?.artist ?? "-"}
		</p>
	</div>
	<div class="flex items-center gap-1">
		<button
			class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors"
			onclick={() => player.Previous()}
		>
			<SkipBack class="m-1.5" size={20} />
		</button>
		<button
			class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full cursor-pointer transition-colors"
			onclick={() => player.TogglePlayPause()}
		>
			{#if isBuffering}
				<Loader2 class="m-1.5 animate-spin" size={24} />
			{:else if $isPaused}
				<Play class="m-1.5" size={24} />
			{:else}
				<Pause class="m-1.5" size={24} />
			{/if}
		</button>
		<button
			class="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer transition-colors"
			onclick={() => player.Next()}
		>
			<SkipForward class="m-1.5" size={20} />
		</button>
	</div>
</div>
