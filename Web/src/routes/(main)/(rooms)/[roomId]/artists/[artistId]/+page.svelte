<script lang="ts">
	import { page } from "$app/state";
	import { toStore } from "svelte/store";
	import { useArtistByIdQuery } from "./queries";
	import AlbumCard from "~/components/album-card.svelte";
	import AlbumCardSkeleton from "~/components/album-card-skeleton.svelte";
	import BackButton from "$lib/components/back-button.svelte";

	let artistId = toStore(() => page.params.artistId ?? "-");
	let artistQuery = useArtistByIdQuery(artistId);

	let artistName = $derived($artistQuery.data?.name ?? "");
	let albums = $derived($artistQuery.data?.albums ?? []);
</script>

<svelte:head>
	<title>Reezer - {artistName}</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4 flex items-center gap-3">
	<BackButton />
	<span class="font-medium">{artistName}</span>
</h1>

<div class="px-4">
	<h2 class="text-2xl font-semibold mb-4">Albums</h2>
	<div class="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-2">
		{#if $artistQuery.data}
			{#each albums as album (album.id)}
				<AlbumCard {album} />
			{/each}
		{:else}
			{#each new Array(5).fill(null) as _, idx (idx)}
				<AlbumCardSkeleton />
			{/each}
		{/if}
	</div>
</div>
