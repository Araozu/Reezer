<script lang="ts">
	import { useAlbums } from "../queries";
	import * as Card from "$lib/components/ui/card/index.js";
	import type { components } from "~/api";
	import { toStore } from "svelte/store";
	import AlbumPagination from "./album_pagination.svelte";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { page } from "$app/state";

	type Album = components["schemas"]["AlbumDto"];

	// Not reactive, because we only care about the initial state
	const pageNumberQuery = Number.parseInt(page.url.searchParams.get("page") ?? "1", 10);

	let requestPage = $state(pageNumberQuery);
	let requestPageSize = $state(20);

	const albumsQuery = useAlbums(
		toStore(() => requestPage),
		toStore(() => requestPageSize),
	);
	const totalCount = $derived(($albumsQuery.data?.totalCount as number) ?? 1);
	const pageSize = $derived(($albumsQuery.data?.pageSize as number) ?? 20);
</script>

<div class="px-4">
	<AlbumPagination {totalCount} {pageSize} bind:requestPage />
	<div class="grid grid-cols-5 gap-2">
		{#if $albumsQuery.data}
			{#each $albumsQuery.data.items as album (album.id)}
				{@render AlbumCard(album)}
			{/each}
		{:else}
			{#each new Array(20).fill(null) as _, idx (idx)}
				{@render AlbumCardSkeleton()}
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
				<Card.Title class="font-display truncate">
					{album.name}
				</Card.Title>
				<a
					href={`/artists/${album.artistId}`}
				>
					<Card.Description class="truncate underline hover:text-primary transition-colors">
						<span>{album.artistName}</span>
					</Card.Description>
				</a>
			</Card.Header>
		</Card.Root>
	</a>
{/snippet}

{#snippet AlbumCardSkeleton()}
	<Card.Root class="w-full hover:border-primary transition-colors">
		<Card.Content>
			<Skeleton
				class="rounded-md w-full aspect-square object-cover"
			/>
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
