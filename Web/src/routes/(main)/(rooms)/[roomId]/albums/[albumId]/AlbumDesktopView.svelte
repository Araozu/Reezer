<script lang="ts">
	import type { components } from "~/api";
	import { Disc } from "lucide-svelte";
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
		onPlayFromSong,
		onAddLastSong,
		onAddNextSong,
		roomId,
		artistId,
		artistName,
	}: Props = $props();
</script>

<div class="grid grid-cols-[20rem_auto] xl:grid-cols-[35rem_auto]">
	<div class="h-screen flex flex-col items-center justify-center px-4 sticky top-0">
		<AlbumCover {albumId} {albumName} />
		<div class="w-full px-4 py-2 transform -translate-y-8">
			<div class="py-1 font-display text-4xl font-bold text-center backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl
				shadow-[0_4px_24px_-4px_var(--glass-shadow) inset_0_1px_1px_var(--glass-highlight)]
				hover:bg-glass-bg-hover transition-colors">
				{albumName}
			</div>
		</div>
		<div class="w-full px-12 py-2 transform -translate-y-8">
			<div class="font-display text-xl font-bold text-center backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl
				shadow-[0_4px_24px_-4px_var(--glass-shadow) inset_0_1px_1px_var(--glass-highlight)]
				hover:bg-glass-bg-hover transition-colors">
				<a href="/{roomId}/artists/{artistId}" class="block">{artistName}</a>
			</div>
		</div>
	</div>
	<div>
		<div class="min-h-screen flex flex-col justify-center px-4 py-16">
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
	</div>
</div>
