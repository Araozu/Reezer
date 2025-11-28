<script lang="ts">
	import { page } from "$app/state";
	import { toStore } from "svelte/store";
	import { useAlbumByIdQuery } from "./queries";
	import type { ISong } from "~/providers";
	import { GetQueueContext } from "~/player2/context/player-store";
	import type { PageProps } from "./$types";
	import type { components } from "~/api";
	import { ListEnd, ListStart, Play, Plus } from "lucide-svelte";
	import Button from "$lib/components/ui/button/button.svelte";

	type SongDto = components["schemas"]["SongDto"];

	let { data }: PageProps = $props();

	const queue = GetQueueContext();

	let albumId = toStore(() => page.params.albumId ?? "-");
	let dataStore = toStore(() => data.albumData);
	let albumQuery = useAlbumByIdQuery(albumId, dataStore);

	let albumName = $derived($albumQuery.data?.name ?? "");

	let songs: Array<ISong> = $derived($albumQuery.data?.songs ?? []);
</script>

<svelte:head>
	<title>Reezer - {albumName}</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4">
	<a href="." class="hover:underline">Albums</a>
	&gt;
	<span class="font-medium">{albumName}</span>
</h1>

<div class="px-4">
	<div
		class="grid md:grid-cols-[20rem_auto] justify-center md:justify-start gap-2"
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

	<div class="py-6">
		{#if $albumQuery.data}
			{#each $albumQuery.data.songs as song (song.id)}
				{@render Song(song)}
			{/each}
		{/if}
	</div>
</div>

{#snippet Song(song: SongDto)}
	<div class="group/row grid grid-cols-[auto_2.5rem_2.5rem] rounded-xl transition-all duration-300 hover:bg-glass-bg-hover hover:backdrop-blur-lg hover:shadow-[inset_0_1px_1px_var(--glass-highlight)]">
		<button
			class="cursor-pointer inline-block w-full text-left px-3 py-3"
			onclick={() => queue.PlaySong(song)}
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
