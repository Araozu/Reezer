<script lang="ts">
	import { page } from "$app/state";
	import { toStore } from "svelte/store";
	import { useAlbumByIdQuery } from "./queries";
	import { GetQueueContext } from "~/player2/context/player-store";
	import type { PageProps } from "./$types";
	import type { components } from "~/api";
	import { Disc, ListEnd, ListStart, Play, Plus } from "lucide-svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { SvelteRuneQueue } from "~/player2/queues/SvelteRuneQueue.svelte";
	import BackButton from "$lib/components/back-button.svelte";
    import AlbumCover from "~/components/album-cover.svelte";

	type SongDto = components["schemas"]["SongDto"];

	let { data }: PageProps = $props();

	const queue = GetQueueContext();
	const svQueue = new SvelteRuneQueue(queue);

	const currentSongId = $derived(svQueue.currentSong?.id ?? null);

	let albumId = toStore(() => page.params.albumId ?? "-");
	let dataStore = toStore(() => data.albumData);
	let albumQuery = useAlbumByIdQuery(albumId, dataStore);

	let albumName = $derived($albumQuery.data?.name ?? "");

	let songs: SongDto[] = $derived($albumQuery.data?.songs ?? []);

	let uniqueDiscs = $derived(() =>
	{
		const discs = new Set(songs.map((s) => Number(s.discNumber ?? 1)));
		return Array.from(discs).sort((a, b) => a - b);
	});

	let hasMultipleDiscs = $derived(uniqueDiscs().length > 1);

	function getSongsForDisc(discNumber: number): SongDto[]
	{
		return songs.filter((s) => Number(s.discNumber ?? 1) === discNumber);
	}

	function getSongIndex(song: SongDto): number
	{
		return songs.findIndex((s) => s.id === song.id);
	}
</script>

<svelte:head>
	<title>Reezer - {albumName}</title>
</svelte:head>

<div>
	<div class="hidden sm:block">
		<h1 class="font-display text-4xl font-semibold py-8 px-4 flex items-center gap-3">
			<BackButton />
			<a href="." class="hover:underline">Albums</a>
			&gt;
			<span class="font-medium">{albumName}</span>
		</h1>
		<div
			class="grid grid-cols-[20rem_auto] justify-center md:justify-start gap-2 px-4"
		>

			<img
				class="rounded-md w-64 h-64"
				src={`/api/Albums/${$albumId}/cover`}
				alt=""
			/>

			<div class="md:text-left text-center">
				<Button onclick={() => queue.PlaySongList(songs)} class="mr-2">
					<Play />
					Play All
				</Button>

				<Button onclick={() => queue.AddLastSongList(songs)} variant="outline">
					<ListEnd />
					Add to queue
				</Button>
			</div>
		</div>
	</div>

	<div class="sm:hidden">
	<div class="relative">
		<AlbumCover albumId={$albumId} {albumName} class="rounded-none"/>
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
				<Button onclick={() => queue.PlaySongList(songs)} class="mr-2">
					<Play />
					Play All
				</Button>

				<Button onclick={() => queue.AddLastSongList(songs)} variant="outline">
					<ListEnd />
					Add to queue
				</Button>
			</div>
		</div>
	</div>
	</div>

	<div class="py-6">
		{#if $albumQuery.data}
			{#if hasMultipleDiscs}
				{#each uniqueDiscs() as discNumber (discNumber)}
					<div class="mb-6">
						<div class="flex items-center gap-2 px-3 py-2 mb-2 text-muted-foreground">
							<Disc class="size-4" />
							<span class="text-sm font-medium">Disc {discNumber}</span>
						</div>
						{#each getSongsForDisc(discNumber) as song (song.id)}
							{@render Song(song, currentSongId, () => queue.PlaySongList(songs.slice(getSongIndex(song))))}
						{/each}
					</div>
				{/each}
			{:else}
				{#each $albumQuery.data.songs as song, index (song.id)}
					{@render Song(song, currentSongId, () => queue.PlaySongList(songs.slice(index)))}
				{/each}
			{/if}
		{/if}
	</div>
</div>

{#snippet Song(song: SongDto, currentSongId: string | null, onPlay: () => void)}
	{@const isCurrentSong = song.id === currentSongId}
	{@const currentSongClass = isCurrentSong
		? "bg-primary/10 border border-primary/30 shadow-[0_0_0_1px_var(--glass-border),inset_0_1px_1px_var(--glass-highlight)]"
		: "border border-transparent"}
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
			onclick={() => queue.AddLastSong(song)}
			title="Add to queue"
		>
			<Plus class="size-4" />
		</button>
		<button
			class="cursor-pointer inline-flex items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-primary/20 active:scale-95"
			onclick={() => queue.AddNextSong(song)}
			title="Play next"
		>
			<ListStart class="size-4" />
		</button>
	</div>
{/snippet}
