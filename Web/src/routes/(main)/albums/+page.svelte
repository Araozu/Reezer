<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import AlbumPagination from "./album_pagination.svelte";
	import MainPage from "./main-page.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>Reezer - Albums</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4">Albums</h1>

{#await data.albumsData}
	<div class="px-4">
		<AlbumPagination totalCount={1} pageSize={20} requestPage={1} />
		<div class="grid grid-cols-5 gap-2">
			{#each new Array(20).fill(null) as _}
				{@render AlbumCardSkeleton()}
			{/each}
		</div>
		<AlbumPagination totalCount={1} pageSize={20} requestPage={1} />
	</div>
{:then albumsData}
	<MainPage {albumsData} />
{/await}

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
