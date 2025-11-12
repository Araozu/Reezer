<script lang="ts">
	import { useAlbums } from "../queries";
	import * as Card from "$lib/components/ui/card/index.js";
	import type { components } from "~/api";
	import { toStore } from "svelte/store";
	import AlbumPagination from "./album_pagination.svelte";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { Input } from "$lib/components/ui/input";
	import { page } from "$app/state";
	import AlbumCover from "~/components/album-cover.svelte";

	type Album = components["schemas"]["AlbumDto"];

	const pageNumberQuery = Number.parseInt(page.url.searchParams.get("page") ?? "1", 10);
	const searchQuery = page.url.searchParams.get("search") ?? "";

	let requestPage = $state(pageNumberQuery);
	let requestPageSize = $state(20);
	let searchTerm = $state(searchQuery);
	let debouncedSearchTerm = $state(searchQuery);
	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	const albumsQuery = useAlbums(
		toStore(() => requestPage),
		toStore(() => requestPageSize),
		toStore(() => debouncedSearchTerm || undefined),
	);
	const totalCount = $derived(($albumsQuery.data?.totalCount as number) ?? 1);
	const pageSize = $derived(($albumsQuery.data?.pageSize as number) ?? 20);

	function handleSearchInput(event: Event)
	{
		const target = event.target as HTMLInputElement;
		searchTerm = target.value;

		if (debounceTimeout)
		{
			clearTimeout(debounceTimeout);
		}

		debounceTimeout = setTimeout(() =>
		{
			debouncedSearchTerm = searchTerm;
			requestPage = 1;
		}, 300);
	}
</script>

<div class="px-4">
	<div class="mb-4">
		<Input
			type="text"
			placeholder="Search albums..."
			value={searchTerm}
			oninput={handleSearchInput}
			class="max-w-md"
		/>
	</div>
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
				<AlbumCover albumId={album.id} albumName={album.name} />
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
