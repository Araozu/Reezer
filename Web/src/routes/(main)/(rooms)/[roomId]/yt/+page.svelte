<script lang="ts">
	import { useYtSongs } from "./queries";
	import { toStore } from "svelte/store";
	import YtPagination from "./yt-pagination.svelte";
	import { page } from "$app/state";
	import YtSongRow from "./yt-song-row.svelte";
	import YtSongRowSkeleton from "./yt-song-row-skeleton.svelte";
	import BackButton from "$lib/components/back-button.svelte";
	import AddYtSongDialog from "./add-yt-song-dialog.svelte";
    import type { ISong } from "~/providers";

	const pageNumberQuery = Number.parseInt(page.url.searchParams.get("page") ?? "1", 10);

	let requestPage = $state(pageNumberQuery);
	let requestPageSize = $state(20);

	let cachedTotalCount = $state(1);
	let cachedPageSize = $state(20);

	const ytSongsQuery = useYtSongs(
		toStore(() => requestPage),
		toStore(() => requestPageSize),
	);
	const annotatedYtSongsQuery = $derived($ytSongsQuery.data ? $ytSongsQuery.data.items.map((t): ISong => ({...t, id: t.ytId, type: "youtube"})) : null);

	$effect(() =>
	{
		if ($ytSongsQuery.data)
		{
			cachedTotalCount = $ytSongsQuery.data.totalCount as number;
			cachedPageSize = $ytSongsQuery.data.pageSize as number;
		}
	});

	const totalCount = $derived(($ytSongsQuery.data?.totalCount as number | undefined) ?? cachedTotalCount);
	const pageSize = $derived(($ytSongsQuery.data?.pageSize as number | undefined) ?? cachedPageSize);
</script>

<svelte:head>
	<title>Reezer - YouTube Songs</title>
</svelte:head>

<div class="flex items-center justify-between py-8 px-4">
	<h1 class="font-display text-4xl font-semibold flex items-center gap-3">
		<BackButton />
		YouTube Songs
	</h1>
	<AddYtSongDialog />
</div>

<div class="px-4">
	<YtPagination {totalCount} {pageSize} bind:requestPage />

	<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
		{#if annotatedYtSongsQuery}
			{#each annotatedYtSongsQuery as song (song.id)}
				<YtSongRow {song} />
			{/each}
		{:else}
			{#each new Array(20).fill(null) as _, idx (idx)}
				<YtSongRowSkeleton />
			{/each}
		{/if}
	</div>

	<YtPagination {totalCount} {pageSize} bind:requestPage />
</div>
