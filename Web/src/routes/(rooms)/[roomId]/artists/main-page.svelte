<script lang="ts">
	import { useArtists } from "../queries";
	import { toStore } from "svelte/store";
	import ArtistPagination from "./artist_pagination.svelte";
	import { Input } from "$lib/components/ui/input";
	import { page } from "$app/state";
	import ArtistCard from "~/components/artist-card.svelte";
	import ArtistCardSkeleton from "~/components/artist-card-skeleton.svelte";
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

	const artistsQuery = useArtists(
		toStore(() => requestPage),
		toStore(() => requestPageSize),
		toStore(() => debouncedSearchTerm || undefined),
	);

	$effect(() =>
	{
		if ($artistsQuery.data)
		{
			cachedTotalCount = $artistsQuery.data.totalCount as number;
			cachedPageSize = $artistsQuery.data.pageSize as number;
		}
	});

	const totalCount = $derived(($artistsQuery.data?.totalCount as number | undefined) ?? cachedTotalCount);
	const pageSize = $derived(($artistsQuery.data?.pageSize as number | undefined) ?? cachedPageSize);

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
			let query = page.url.searchParams;
			query.set("search", searchTerm);
			goto(`?${query.toString()}`);

			debouncedSearchTerm = searchTerm;
			requestPage = 1;
		}, 300);
	}
</script>

<div class="px-4">
	<div class="mb-4">
		<Input
			type="text"
			placeholder="Search artists..."
			value={searchTerm}
			oninput={handleSearchInput}
			class="max-w-md"
		/>
	</div>
	<ArtistPagination {totalCount} {pageSize} bind:requestPage />
	<div class="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-2">
		{#if $artistsQuery.data}
			{#each $artistsQuery.data.items as artist (artist.id)}
				<ArtistCard {artist} />
			{/each}
		{:else}
			{#each new Array(20).fill(null) as _, idx (idx)}
				<ArtistCardSkeleton />
			{/each}
		{/if}
	</div>
	<ArtistPagination {totalCount} {pageSize} bind:requestPage />
</div>
