<script lang="ts">
	import type { components } from "~/api";
	import { ListStart, Play, Plus } from "lucide-svelte";

	type SongDto = components["schemas"]["SongDto"];

	interface Props {
		song: SongDto;
		isCurrentSong: boolean;
		onPlay: () => void;
		onAddLast: () => void;
		onAddNext: () => void;
	}

	let { song, isCurrentSong, onPlay, onAddLast, onAddNext }: Props = $props();

	let currentSongClass = $derived(isCurrentSong
		? "bg-primary/10 border border-primary/30 shadow-[0_0_0_1px_var(--glass-border),inset_0_1px_1px_var(--glass-highlight)]"
		: "border border-transparent");
</script>

<div
	class={`group/row rounded-xl hover:bg-glass-bg-hover hover:backdrop-blur-lg grid grid-cols-[auto_2.5rem_2.5rem] transition-all duration-300 hover:shadow-[inset_0_1px_1px_var(--glass-highlight)] ${currentSongClass}`}
>
	<button
		class="px-3 py-3 touch-action-manipulation inline-block w-full cursor-pointer text-left [-webkit-tap-highlight-color:transparent]"
		onclick={onPlay}
	>
		<div class="gap-4 grid grid-cols-[2rem_auto] items-center">
			<div class="h-6 text-muted-foreground inline-flex items-center justify-center">
				<Play class="size-4 hidden group-hover/row:inline-block" />
				<span class="inline-block tabular-nums group-hover/row:hidden">{song.trackNumber}</span>
			</div>
			<div class="inline-block truncate">
				{song.name}
			</div>
		</div>
	</button>
	<button
		data-slot="song-action"
		class="rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/20 touch-action-manipulation inline-flex cursor-pointer items-center justify-center transition-all duration-300 [-webkit-tap-highlight-color:transparent] active:scale-95"
		onclick={onAddLast}
		title="Add to queue"
	>
		<Plus class="size-4" />
	</button>
	<button
		data-slot="song-action"
		class="rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/20 touch-action-manipulation inline-flex cursor-pointer items-center justify-center transition-all duration-300 [-webkit-tap-highlight-color:transparent] active:scale-95"
		onclick={onAddNext}
		title="Play next"
	>
		<ListStart class="size-4" />
	</button>
</div>
