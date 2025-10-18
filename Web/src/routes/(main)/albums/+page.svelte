<script lang="ts">
	import { useAlbums } from "../queries";
	import * as Card from "$lib/components/ui/card/index.js";
	import type { components } from "../../../api";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import { toStore } from "svelte/store";

	type Album = components["schemas"]["AlbumDto"];

	let requestPage = $state(1);
	let requestPageSize = $state(20);

	const albumsQuery = useAlbums(
		toStore(() => requestPage),
		toStore(() => requestPageSize),
	);
	const totalCount = ($albumsQuery.data?.totalCount as number) ?? 1;
	const pageSize = ($albumsQuery.data?.pageSize as number) ?? 20;
</script>

<svelte:head>
	<title>Reezer - Albums</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4">Albums</h1>

<div class="px-4">
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

		<Pagination.Root count={totalCount} perPage={pageSize}>
			{#snippet children({ pages, currentPage })}
				<Pagination.Content>
					<Pagination.Item>
						<Pagination.PrevButton />
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === "ellipsis"}
							<Pagination.Item>
								<Pagination.Ellipsis
								/>
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link
									{page}
									isActive={currentPage ===
										page.value}
									onclick={() =>
										(requestPage =
											page.value)}
								>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton />
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
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
