<script lang="ts">
	import { useAlbums } from "../queries";
	import * as Card from "$lib/components/ui/card/index.js";
	import type { components } from "../../../api";
	import { toStore } from "svelte/store";
	import AlbumPagination from "./album_pagination.svelte";

	type Album = components["schemas"]["AlbumDto"];
	export type AlbumData =
		components["schemas"]["PaginatedResultOfAlbumDto"];

	let { albumsData }: { albumsData: AlbumData } = $props();

	let requestPage = $state(albumsData.page as number);
	let requestPageSize = $state(albumsData.pageSize as number);

	const albumsQuery = useAlbums(
		toStore(() => requestPage),
		toStore(() => requestPageSize),
		albumsData,
		albumsData.page as number,
	);
	const totalCount = $derived(
		($albumsQuery.data?.totalCount as number) ?? 1,
	);
	const pageSize = $derived(
		($albumsQuery.data?.pageSize as number) ?? 20,
	);
</script>

<div class="px-4">
	<AlbumPagination {totalCount} {pageSize} bind:requestPage />
	<div class="grid grid-cols-5 gap-2">
		{#if $albumsQuery.data}
			{#each $albumsQuery.data.items as album}
				{@render AlbumCard(album)}
			{/each}
		{/if}
	</div>
	<AlbumPagination {totalCount} {pageSize} bind:requestPage />
</div>

{#snippet AlbumCard(album: Album)}
	<a class="inline-block" href={`/albums/${album.id}`}>
		<Card.Root
			class="w-full hover:border-primary transition-colors"
		>
			<Card.Content>
				<img
					class="rounded-md w-full aspect-square object-cover"
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
