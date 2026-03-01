<script lang="ts">
	import { Disc, ListEnd, Play, EllipsisVertical } from "lucide-svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import AlbumCover from "~/components/album-cover.svelte";
	import SongRow from "./SongRow.svelte";
	import type { RegularSong } from "./queries";

	interface Props {
		albumId: string;
		albumName: string;
		songs: RegularSong[];
		currentSongId: string | null;
		uniqueDiscs: number[];
		getSongsForDisc: (discNumber: number) => RegularSong[];
		getSongIndex: (song: RegularSong) => number;
		onPlayAll: () => void;
		onAddAllToQueue: () => void;
		onPlayFromSong: (index: number) => void;
		onAddLastSong: (song: RegularSong) => void;
		onAddNextSong: (song: RegularSong) => void;
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

	function copyTracklist(discNumber: number)
	{
		const songs = getSongsForDisc(discNumber);
		const text = songs.map((s) => s.name).join("\n");
		navigator.clipboard.writeText(text);
	}
</script>

<div class="relative">
	<AlbumCover {albumId} {albumName} class="rounded-none" skipFadeIn />
</div>

<div class="px-4 py-2 -translate-y-8 w-full transform">
	<div
		class="py-1 font-display text-3xl font-bold backdrop-blur-xl bg-glass-bg border-glass-border rounded-2xl shadow-[0_4px_24px_-4px_var(--glass-shadow) inset_0_1px_1px_var(--glass-highlight)]
		border text-center"
	>
		{albumName}
	</div>

	<div class="mt-2 md:grid-cols-[20rem_auto] md:justify-start gap-2 grid justify-center">
		<div class="md:text-left md:justify-start gap-2 flex items-center justify-center text-center">
			<Button onclick={onPlayAll}>
				<Play />
				Play All
			</Button>

			<Button onclick={onAddAllToQueue} variant="outline">
				<ListEnd />
				Add to queue
			</Button>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button variant="ghost" size="icon" {...props}>
							<EllipsisVertical class="size-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#if uniqueDiscs.length === 1}
						<DropdownMenu.Item onclick={() => copyTracklist(uniqueDiscs[0])}>
							Copy Tracklist
						</DropdownMenu.Item>
					{:else}
						{#each uniqueDiscs as disc (disc)}
							<DropdownMenu.Item onclick={() => copyTracklist(disc)}>
								Copy Disc {disc} Tracklist
							</DropdownMenu.Item>
						{/each}
					{/if}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</div>

<div class="py-6">
	{#each uniqueDiscs as discNumber (discNumber)}
		<div class="mb-6">
			<div class="gap-2 px-3 py-2 mb-2 text-muted-foreground flex items-center">
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
