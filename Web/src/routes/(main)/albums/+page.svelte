<script lang="ts">
	import { useAlbums } from "../queries";
	import * as Card from "$lib/components/ui/card/index.js";

	const albumsQuery = useAlbums();
</script>

<svelte:head>
	<title>Reezer - Albums</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4">Albums</h1>

<div class="px-4">
	<div class="flex gap-2">
		{#if $albumsQuery.data}
			{#each $albumsQuery.data.items as album}
				<a
					class="inline-block"
					href={`/albums/${album.id}`}
				>
					<Card.Root
						class="w-full max-w-sm hover:border-primary transition-colors"
					>
						<Card.Content>
							<img
								class="rounded-md"
								src={`/api/Albums/${album.id}/cover`}
								alt=""
							/>
						</Card.Content>
						<Card.Header>
							<Card.Title
								class="font-display"
							>
								{album.name}
							</Card.Title>
							<Card.Description>
								<span
									>{album.artistName}</span
								>
							</Card.Description>
						</Card.Header>
					</Card.Root>
				</a>
			{/each}
		{/if}
	</div>
</div>
