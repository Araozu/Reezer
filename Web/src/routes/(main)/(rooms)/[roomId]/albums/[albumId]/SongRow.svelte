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

<div class={`group/row grid grid-cols-[auto_2.5rem_2.5rem] rounded-xl transition-all duration-300 hover:bg-glass-bg-hover hover:backdrop-blur-lg hover:shadow-[inset_0_1px_1px_var(--glass-highlight)] ${currentSongClass}`}>
	<button
		class="cursor-pointer inline-block w-full text-left px-3 py-3"
		onclick={onPlay}
	>
		<div class="grid grid-cols-[2rem_auto] gap-4 items-center">
			<div class="inline-flex items-center justify-center h-6 text-muted-foreground">
				<Play class="size-4 hidden group-hover/row:inline-block" />
				<span class="group-hover/row:hidden inline-block tabular-nums">{song.trackNumber}</span>
			</div>
			<div class="inline-block truncate">
				{song.name}
			</div>
		</div>
	</button>
	<button
		class="cursor-pointer inline-flex items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-primary/20 active:scale-95"
		onclick={onAddLast}
		title="Add to queue"
	>
		<Plus class="size-4" />
	</button>
	<button
		class="cursor-pointer inline-flex items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-primary/20 active:scale-95"
		onclick={onAddNext}
		title="Play next"
	>
		<ListStart class="size-4" />
	</button>
</div>
