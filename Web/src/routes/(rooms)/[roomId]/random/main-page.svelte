<script lang="ts">
	import { useRandomAlbums } from "../queries";
	import { toStore } from "svelte/store";
	import AlbumPagination from "../albums/album_pagination.svelte";
	import { Button } from "$lib/components/ui/button";
	import { page } from "$app/state";
	import AlbumCard from "~/components/album-card.svelte";
	import AlbumCardSkeleton from "~/components/album-card-skeleton.svelte";
	import { goto } from "$app/navigation";
	import { Shuffle } from "lucide-svelte";

	const pageNumberQuery = Number.parseInt(page.url.searchParams.get("page") ?? "1", 10);
	const seedQuery = page.url.searchParams.get("seed") ? Number.parseInt(page.url.searchParams.get("seed")!, 10) : undefined;

	let requestPage = $state(pageNumberQuery);
	let requestPageSize = $state(20);
	let seed = $state(seedQuery);

	let cachedTotalCount = $state(1);
	let cachedPageSize = $state(20);

	const albumsQuery = useRandomAlbums(
		toStore(() => requestPage),
		toStore(() => requestPageSize),
		toStore(() => seed),
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

	function handleShuffle()
	{
		const newSeed = Math.floor(Math.random() * 1000000);
		seed = newSeed;
		requestPage = 1;

		let query = page.url.searchParams;
		query.set("seed", newSeed.toString());
		query.set("page", "1");
		goto(`?${query.toString()}`);
	}
</script>

<div class="px-4">
	<div class="mb-4">
		<Button onclick={handleShuffle} variant="outline" class="gap-2">
			<Shuffle class="w-4 h-4" />
			Shuffle
		</Button>
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
