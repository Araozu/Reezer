<script lang="ts">
	import type { PageProps } from "./$types";
	import AlbumCard from "~/components/album-card.svelte";
	import AlbumCardSkeleton from "~/components/album-card-skeleton.svelte";
	import BackButton from "$lib/components/back-button.svelte";

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Reezer - Artist</title>
</svelte:head>

{#await data.artistDataPromise}
	<h1 class="font-display text-4xl font-semibold py-8 px-4 flex items-center gap-3">
		<BackButton />
		<span class="font-medium">&nbsp;</span>
	</h1>

	<div class="px-4">
		<h2 class="text-2xl font-semibold mb-4">Albums</h2>
		<div class="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-2">
			{#each new Array(5).fill(null) as _, idx (idx)}
				<AlbumCardSkeleton />
			{/each}
		</div>
	</div>
{:then artistData}
	<h1 class="font-display text-4xl font-semibold py-8 px-4 flex items-center gap-3">
		<BackButton />
		<span class="font-medium">{artistData.name}</span>
	</h1>

	<div class="px-4">
		<h2 class="text-2xl font-semibold mb-4">Albums</h2>
		<div class="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-2">
			{#each artistData.albums ?? [] as album (album.id)}
				<AlbumCard {album} />
			{/each}
		</div>
	</div>
{/await}
