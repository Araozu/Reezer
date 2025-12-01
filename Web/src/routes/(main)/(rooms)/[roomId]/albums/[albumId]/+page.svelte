<script lang="ts">
	import { page } from "$app/state";
	import { toStore } from "svelte/store";
	import { useAlbumByIdQuery } from "./queries";
	import { GetQueueContext } from "~/player2/context/player-store";
	import type { PageProps } from "./$types";
	import type { components } from "~/api";
	import { SvelteRuneQueue } from "~/player2/queues/SvelteRuneQueue.svelte";
	import AlbumMobileView from "./AlbumMobileView.svelte";
	import AlbumDesktopView from "./AlbumDesktopView.svelte";

	type SongDto = components["schemas"]["SongDto"];

	let { data }: PageProps = $props();

	const queue = GetQueueContext();
	const svQueue = new SvelteRuneQueue(queue);

	const currentSongId = $derived(svQueue.currentSong?.id ?? null);

	let albumId = toStore(() => page.params.albumId ?? "-");
	let roomId = toStore(() => page.params.roomId ?? "-");
	let dataStore = toStore(() => data.albumData);
	let albumQuery = useAlbumByIdQuery(albumId, dataStore);

	let albumName = $derived($albumQuery.data?.name ?? "");

	let songs: SongDto[] = $derived($albumQuery.data?.songs ?? []);

	let artistId = $derived(songs[0]?.artistId ?? "");
	let artistName = $derived(songs[0]?.artist ?? "");

	let uniqueDiscs = $derived(() =>
	{
		const discs = new Set(songs.map((s) => Number(s.discNumber ?? 1)));
		return Array.from(discs).sort((a, b) => a - b);
	});

	function getSongsForDisc(discNumber: number): SongDto[]
	{
		return songs.filter((s) => Number(s.discNumber ?? 1) === discNumber);
	}

	function getSongIndex(song: SongDto): number
	{
		return songs.findIndex((s) => s.id === song.id);
	}

	function playFromSong(index: number)
	{
		queue.PlaySongList(songs.slice(index));
	}
</script>

<svelte:head>
	<title>Reezer - {albumName}</title>
</svelte:head>

{#if $albumQuery.data}
	<div class="block md:hidden">
		<AlbumMobileView
			albumId={$albumId}
			{albumName}
			{songs}
			{currentSongId}
			uniqueDiscs={uniqueDiscs()}
			{getSongsForDisc}
			{getSongIndex}
			onPlayAll={() => queue.PlaySongList(songs)}
			onAddAllToQueue={() => queue.AddLastSongList(songs)}
			onPlayFromSong={playFromSong}
			onAddLastSong={(song) => queue.AddLastSong(song)}
			onAddNextSong={(song) => queue.AddNextSong(song)}
		/>
	</div>
	<div class="hidden md:block">
		<AlbumDesktopView
			albumId={$albumId}
			{albumName}
			{songs}
			{currentSongId}
			uniqueDiscs={uniqueDiscs()}
			{getSongsForDisc}
			{getSongIndex}
			onPlayFromSong={playFromSong}
			onAddLastSong={(song) => queue.AddLastSong(song)}
			onAddNextSong={(song) => queue.AddNextSong(song)}
			onPlayAll={() => queue.PlaySongList(songs)}
			roomId={$roomId}
			{artistId}
			{artistName}
		/>
	</div>
{/if}
