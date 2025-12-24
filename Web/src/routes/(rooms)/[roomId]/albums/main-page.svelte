<script lang="ts">
	import { useAlbums } from "../queries";
	import { toStore } from "svelte/store";
	import AlbumPagination from "./album_pagination.svelte";
	import { Input } from "$lib/components/ui/input";
	import { page } from "$app/state";
	import AlbumCard from "~/components/album-card.svelte";
	import AlbumCardSkeleton from "~/components/album-card-skeleton.svelte";
	import { goto } from "$app/navigation";

	const pageNumberQuery = Number.parseInt(page.url.searchParams.get("page") ?? "1", 10);
	const searchQuery = page.url.searchParams.get("search") ?? "";

	let requestPage = $state(pageNumberQuery);
	let requestPageSize = $state(20);
	let searchTerm = $state(searchQuery);
	let debouncedSearchTerm = $state(searchQuery);
	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	let cachedTotalCount = $state(1);
	let cachedPageSize = $state(20);

	const albumsQuery = useAlbums(
		toStore(() => requestPage),
		toStore(() => requestPageSize),
		toStore(() => debouncedSearchTerm || undefined),
	);

	$effect(() =>
	{
		if ($albumsQuery.data)
		{
			cachedTotalCount = $albumsQuery.data.totalCount as number;
			cachedPageSize = $albumsQuery.data.pageSize as number;
		}
	});

	const totalCount = $derived(($albumsQuery.data?.totalCount as number | undefined) ?? cachedTotalCount);
	const pageSize = $derived(($albumsQuery.data?.pageSize as number | undefined) ?? cachedPageSize);

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
			const query = new URLSearchParams(page.url.searchParams);
			if (searchTerm)
			{
				query.set("search", searchTerm);
			}
			else
			{
				query.delete("search");
			}

			goto(`?${query.toString()}`,
			{
				replaceState: true,
				noScroll: true,
				keepFocus: true,
			});

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
	<div class="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-2">
		{#if $albumsQuery.data}
			{#each $albumsQuery.data.items as album (album.id)}
				<AlbumCard {album} />
			{/each}
		{:else}
			{#each new Array(20).fill(null) as _, idx (idx)}
				<AlbumCardSkeleton />
			{/each}
		{/if}
	</div>
	<AlbumPagination {totalCount} {pageSize} bind:requestPage />
</div>
