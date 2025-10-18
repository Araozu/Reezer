<script lang="ts">
	import { useAlbums } from "../queries";
	import * as Card from "$lib/components/ui/card/index.js";
	import type { components } from "../../../api";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { toStore } from "svelte/store";
	import AlbumPagination from "./album_pagination.svelte";
	import { page } from "$app/state";

	type Album = components["schemas"]["AlbumDto"];

	let queryPage = page.url.searchParams;

	let requestPage = $state(1);
	let requestPageSize = $state(20);

	const albumsQuery = useAlbums(
		toStore(() => requestPage),
		toStore(() => requestPageSize),
	);
	const totalCount = $derived(
		($albumsQuery.data?.totalCount as number) ?? 1,
	);
	const pageSize = $derived(
		($albumsQuery.data?.pageSize as number) ?? 20,
	);
</script>

<svelte:head>
	<title>Reezer - Albums</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4">Albums</h1>

<div class="px-4">
	<AlbumPagination {totalCount} {pageSize} bind:requestPage />
	<div class="flex flex-wrap gap-2">
		{#if $albumsQuery.data}
			{#each $albumsQuery.data.items as album}
				{@render AlbumCard(album)}
			{/each}
		{:else}
			{#each new Array(10).fill(null) as _}
				{@render AlbumCardSkeleton()}
			{/each}
		{/if}
	</div>
</div>

{#snippet AlbumCard(album: Album)}
	<a class="inline-block" href={`/albums/${album.id}`}>
		<Card.Root
			class="w-full max-w-76 hover:border-primary transition-colors"
		>
			<Card.Content>
				<img
					class="rounded-md w-64 h-64"
					src={`/api/Albums/${album.id}/cover`}
					alt=""
				/>
			</Card.Content>
			<Card.Header>
				<Card.Title class="font-display">
					{album.name}
				</Card.Title>
				<Card.Description>
					<span>{album.artistName}</span>
				</Card.Description>
			</Card.Header>
		</Card.Root>
	</a>
{/snippet}

{#snippet AlbumCardSkeleton()}
	<Card.Root
		class="w-full max-w-76 hover:border-primary transition-colors"
	>
		<Card.Content>
			<Skeleton class="rounded-md w-64 h-64" />
		</Card.Content>
		<Card.Header>
			<Card.Title class="font-display">
				<Skeleton class="inline-block w-32 h-4" />
			</Card.Title>
			<Card.Description>
				<Skeleton class="inline-block w-24 h-4" />
			</Card.Description>
		</Card.Header>
	</Card.Root>
{/snippet}
