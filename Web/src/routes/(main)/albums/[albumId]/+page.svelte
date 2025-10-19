<script lang="ts">
	import { page } from "$app/state";
	import { toStore } from "svelte/store";
	import { useAlbumByIdQuery } from "./queries";
	import type { ISong } from "../../../../providers";
	import { GetCurrentPlayer } from "../../../../player/index.svelte";
	import type { PageProps } from "./$types";
	import type { components } from "../../../../api";
	import { ListStart, Play, Plus } from "lucide-svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { toast } from "svelte-sonner";

	type SongDto = components["schemas"]["SongDto"];

	let { data }: PageProps = $props();

	const player = GetCurrentPlayer();
	let albumId = toStore(() => page.params.albumId ?? "-");
	let dataStore = toStore(() => data.albumData);
	let albumQuery = useAlbumByIdQuery(albumId, dataStore);

	let albumName = $derived($albumQuery.data?.name ?? "");

	function PlayNow(song: ISong) {
		player.PlaySong(song);
		toast.success("Playing now");
	}

	function PlayAllNow() {
		const songs = $albumQuery.data?.songs ?? [];
		player.PlaySongs(songs);
		toast.success("Playing all now");
	}

	function PlayLast(song: ISong) {
		player.AddSongToQueue(song);
		toast.success("Will play last");
	}

	function PlayNext(song: ISong) {
		player.PlaySongNext(song);
		toast.success("Will play next");
	}
</script>

<svelte:head>
	<title>{albumName}</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4">
	<a href="." class="hover:underline">Albums</a>
	&gt;
	<span class="font-medium">{albumName}</span>
</h1>

<div class="px-4">
	<div class="grid grid-cols-[20rem_auto]">
		<img
			class="rounded-md w-64 h-64"
			src={`/api/Albums/${$albumId}/cover`}
			alt=""
		/>

		<div>
			<Button onclick={PlayAllNow}>
				<Play />
				Play All
			</Button>
		</div>
	</div>

	<div class="py-6">
		{#if $albumQuery.data}
			{#each $albumQuery.data.songs as song}
				{@render Song(song)}
			{/each}
		{/if}
	</div>
</div>

{#snippet Song(song: SongDto)}
	<div class="grid grid-cols-[auto_3rem_3rem]">
		<button
			class="cursor-pointer transition-colors inline-block w-full text-left dark:hover:bg-zinc-900 border-b border-border/50"
			onclick={() => PlayNow(song)}
		>
			<div
				class="grid grid-cols-[2rem_auto] gap-4 items-center group p-2"
			>
				<div
					class="inline-flex items-center justify-center h-6"
				>
					<Play
						class="opacity-50 group-hover:inline-block hidden"
					/>
					<span
						class="group-hover:hidden inline-block"
						>{song.trackNumber}</span
					>
				</div>
				<div class="inline-block">
					{song.name}
				</div>
			</div>
		</button>
		<button
			class="cursor-pointer transition-colors text-left dark:hover:bg-zinc-900 border-b border-border/50
				inline-flex items-center justify-center
			"
			onclick={() => PlayLast(song)}
		>
			<Plus class="h-4 w-4" />
		</button>
		<button
			class="cursor-pointer transition-colors text-left dark:hover:bg-zinc-900 border-b border-border/50
				inline-flex items-center justify-center
			"
			onclick={() => PlayNext(song)}
		>
			<ListStart class="h-4 w-4" />
		</button>
	</div>
{/snippet}
