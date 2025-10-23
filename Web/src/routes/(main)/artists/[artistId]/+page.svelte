<script lang="ts">
	import { page } from "$app/state";
	import { toStore } from "svelte/store";
	import { useArtistByIdQuery } from "./queries";
	import type { components } from "../../../../api";
	import * as Card from "$lib/components/ui/card/index.js";

	type AlbumDto = components["schemas"]["AlbumDto"];

	let artistId = toStore(() => page.params.artistId ?? "-");
	let artistQuery = useArtistByIdQuery(artistId);

	let artistName = $derived($artistQuery.data?.name ?? "");
	let albums = $derived($artistQuery.data?.albums ?? []);
</script>

<svelte:head>
	<title>Reezer - {artistName}</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4">
	<span class="font-medium">{artistName}</span>
</h1>

<div class="px-4">
	<h2 class="text-2xl font-semibold mb-4">Albums</h2>
	<div class="grid grid-cols-5 gap-2">
		{#if $artistQuery.data}
			{#each albums as album (album.id)}
				{@render AlbumCard(album)}
			{/each}
		{:else}
			{#each new Array(5).fill(null) as _, idx (idx)}
				<div class="h-64 bg-muted animate-pulse rounded-md"></div>
			{/each}
		{/if}
	</div>
</div>

{#snippet AlbumCard(album: AlbumDto)}
	<a class="inline-block" href={`/albums/${album.id}`}>
		<Card.Root class="w-full hover:border-primary transition-colors">
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
				<Card.Description class="truncate">
					<span>{album.artistName}</span>
				</Card.Description>
			</Card.Header>
		</Card.Root>
	</a>
{/snippet}
