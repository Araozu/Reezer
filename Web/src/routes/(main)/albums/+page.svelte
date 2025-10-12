<script lang="ts">
	import { useAlbums } from "../queries";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button";

	const albumsQuery = useAlbums();
</script>

<h1 class="font-display text-4xl font-semibold py-8 px-4">Albums</h1>

<div class="px-4">
	<div class="flex gap-2">
		{#if $albumsQuery.data}
			{#each $albumsQuery.data.items as album}
				<Card.Root class="w-full max-w-sm">
					<Card.Content>
						<img
							class="rounded-md"
							src={`/api/Albums/${album.id}/cover`}
							alt=""
						/>
					</Card.Content>
					<Card.Header>
						<Card.Title>
							{album.name}
						</Card.Title>
						<Card.Description>
							<span
								>{album.artistName}</span
							>
						</Card.Description>
					</Card.Header>
				</Card.Root>
			{/each}
		{/if}
	</div>
</div>
