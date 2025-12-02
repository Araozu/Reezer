<script lang="ts">
	import type { components } from "~/api";
	import { Disc, ListEnd, Play } from "lucide-svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import AlbumCover from "~/components/album-cover.svelte";
	import SongRow from "./SongRow.svelte";

	type SongDto = components["schemas"]["SongDto"];

	interface Props {
		albumId: string;
		albumName: string;
		songs: SongDto[];
		currentSongId: string | null;
		uniqueDiscs: number[];
		getSongsForDisc: (discNumber: number) => SongDto[];
		getSongIndex: (song: SongDto) => number;
		onPlayAll: () => void;
		onAddAllToQueue: () => void;
		onPlayFromSong: (index: number) => void;
		onAddLastSong: (song: SongDto) => void;
		onAddNextSong: (song: SongDto) => void;
		roomId: string;
		artistId: string;
		artistName: string;
	}

	let {
		albumId,
		albumName,
		currentSongId,
		uniqueDiscs,
		getSongsForDisc,
		getSongIndex,
		onPlayAll,
		onAddAllToQueue,
		onPlayFromSong,
		onAddLastSong,
		onAddNextSong,
	}: Props = $props();
</script>

<div class="relative">
	<AlbumCover {albumId} {albumName} class="rounded-none" skipFadeIn />
</div>

<div class="w-full px-4 py-2 transform -translate-y-8">
	<div class="py-1 font-display text-3xl font-bold text-center backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl
		shadow-[0_4px_24px_-4px_var(--glass-shadow) inset_0_1px_1px_var(--glass-highlight)]">
		{albumName}
	</div>

	<div
		class="mt-2 grid md:grid-cols-[20rem_auto] justify-center md:justify-start gap-2"
	>

		<div class="md:text-left text-center">
			<Button onclick={onPlayAll} class="mr-2">
				<Play />
				Play All
			</Button>

			<Button onclick={onAddAllToQueue} variant="outline">
				<ListEnd />
				Add to queue
			</Button>
		</div>
	</div>
</div>

<div class="py-6">
	{#each uniqueDiscs as discNumber (discNumber)}
		<div class="mb-6">
			<div class="flex items-center gap-2 px-3 py-2 mb-2 text-muted-foreground">
				<Disc class="size-4" />
				<span class="text-sm font-medium">Disc {discNumber}</span>
			</div>
			{#each getSongsForDisc(discNumber) as song (song.id)}
				<SongRow
					{song}
					isCurrentSong={song.id === currentSongId}
					onPlay={() => onPlayFromSong(getSongIndex(song))}
					onAddLast={() => onAddLastSong(song)}
					onAddNext={() => onAddNextSong(song)}
				/>
			{/each}
		</div>
	{/each}
</div>
