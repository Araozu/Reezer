<script lang="ts">
import { page } from "$app/state";
import type { PageProps } from "./$types";
import type { components } from "~/api";
import { SvelteRuneQueue } from "~/player2/queues/SvelteRuneQueue.svelte";
import AlbumMobileView from "./AlbumMobileView.svelte";
import AlbumDesktopView from "./AlbumDesktopView.svelte";
import AlbumMobileSkeleton from "./AlbumMobileSkeleton.svelte";
import AlbumDesktopSkeleton from "./AlbumDesktopSkeleton.svelte";
import type { RegularSong } from "./queries";
import { GetQueueContext } from "~/context/music-player-context";

type AlbumWithTracklistDto = components["schemas"]["AlbumWithTracklistDto"];

let { data }: PageProps = $props();

const queue = GetQueueContext();
const svQueue = new SvelteRuneQueue(queue);

const currentSongId = $derived(svQueue.currentSong?.id ?? null);

let albumId = $derived(page.params.albumId ?? "-");
let roomId = $derived(page.params.roomId ?? "-");

function getAlbumName(albumData: AlbumWithTracklistDto): string
{
	return albumData.name ?? "";
}

function getSongs(albumData: AlbumWithTracklistDto): RegularSong[]
{
	return (albumData.songs ?? []).map((s) => ({
		...s,
		type: "regular",
	}));
}

function getArtistId(songs: RegularSong[]): string
{
	return songs[0]?.artistId ?? "";
}

function getArtistName(songs: RegularSong[]): string
{
	return songs[0]?.artist ?? "";
}

function getUniqueDiscs(songs: RegularSong[]): number[]
{
	const discs = new Set(songs.map((s) => Number(s.discNumber ?? 1)));
	return Array.from(discs).sort((a, b) => a - b);
}

function getSongsForDisc(songs: RegularSong[], discNumber: number): RegularSong[]
{
	return songs.filter((s) => Number(s.discNumber ?? 1) === discNumber);
}

function getSongIndex(songs: RegularSong[], song: RegularSong): number
{
	return songs.findIndex((s) => s.id === song.id);
}

function playFromSong(songs: RegularSong[], index: number)
{
	queue.PlaySongList(songs.slice(index));
}
</script>

<svelte:head>
	<title>Reezer - Album</title>
</svelte:head>

{#await data.albumDataPromise}
	<div class="block md:hidden">
		<AlbumMobileSkeleton {albumId} />
	</div>
	<div class="hidden md:block">
		<AlbumDesktopSkeleton {albumId} />
	</div>
	{:then albumData}
	{@const songs = getSongs(albumData)}
	{@const albumName = getAlbumName(albumData)}
	{@const artistId = getArtistId(songs)}
	{@const artistName = getArtistName(songs)}
	{@const uniqueDiscs = getUniqueDiscs(songs)}

	<div class="block md:hidden">
		<AlbumMobileView
			{albumId}
			{albumName}
			{songs}
			{currentSongId}
			{uniqueDiscs}
			getSongsForDisc={(disc) => getSongsForDisc(songs, disc)}
			getSongIndex={(song) => getSongIndex(songs, song)}
			onPlayAll={() => queue.PlaySongList(songs)}
			onAddAllToQueue={() => queue.AddLastSongList(songs)}
			onPlayFromSong={(idx) => playFromSong(songs, idx)}
			onAddLastSong={(song) => queue.AddLastSong(song)}
			onAddNextSong={(song) => queue.AddNextSong(song)}
			{roomId}
			{artistId}
			{artistName}
		/>
	</div>
	<div class="hidden md:block">
		<AlbumDesktopView
			{albumId}
			{albumName}
			{songs}
			{currentSongId}
			{uniqueDiscs}
			getSongsForDisc={(disc) => getSongsForDisc(songs, disc)}
			getSongIndex={(song) => getSongIndex(songs, song)}
			onPlayFromSong={(idx) => playFromSong(songs, idx)}
			onAddLastSong={(song) => queue.AddLastSong(song)}
			onAddNextSong={(song) => queue.AddNextSong(song)}
			onPlayAll={() => queue.PlaySongList(songs)}
			onAddAllToQueue={() => queue.AddLastSongList(songs)}
			{roomId}
			{artistId}
			{artistName}
		/>
	</div>
	{:catch error}
	<div class="flex flex-col items-center justify-center h-64 gap-4">
		<p class="text-destructive">Error loading album</p>
		<p class="text-muted-foreground text-sm">{error?.message ?? "Unknown error"}</p>
	</div>
{/await}
