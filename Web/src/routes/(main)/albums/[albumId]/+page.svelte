<script lang="ts">
	import { page } from "$app/state";
	import { toStore } from "svelte/store";
	import { useAlbumByIdQuery } from "./queries";
	import type { ISong } from "../../../../providers";
	import { GetCurrentPlayer } from "../../../../player/index.svelte";

	const player = GetCurrentPlayer();
	let albumId = toStore(() => page.params.albumId ?? "-");
	let albumQuery = useAlbumByIdQuery(albumId);

	function PlaySong(song: ISong) {
		player.PlaySong(song);
	}
</script>

<svelte:head>
	<title>Reezer - Album</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4">
	<a href="." class="hover:underline">Albums</a>
	&gt;
	<span class="font-medium"> NewJeans </span>
</h1>

<img
	class="rounded-md w-64 h-64"
	src={`/api/Albums/${$albumId}/cover`}
	alt=""
/>

{#if $albumQuery.data}
	{#each $albumQuery.data.songs as song}
		<div>
			<button
				class="cursor-pointer hover:text-primary transition-colors inline-block w-full text-left"
				onclick={() => PlaySong(song)}
			>
				<p>
					{song.name}
				</p>
			</button>
		</div>
	{/each}
{/if}
