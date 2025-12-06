<script lang="ts">
	import type { components } from "~/api";
	import * as Card from "$lib/components/ui/card/index.js";
	import AlbumCover from "./album-cover.svelte";
	import ColorBlobs from "./music-player/color-blobs.svelte";
	import { page } from "$app/state";
	import { extractColorsFromImage } from "$lib/color-extractor";

	type Album = components["schemas"]["AlbumDto"];

	let { album }: { album: Album } = $props();
	const roomId = page.params.roomId;

	let isHovered = $state(false);
	let extractedColors = $state<string[]>([]);
	let colorWeights = $state<number[]>([]);

	const coverUrl = `/api/Albums/${album.id}/cover`;

	$effect(() =>
	{
		if (isHovered && extractedColors.length === 0)
		{
			extractColorsFromImage(coverUrl, 4).then((result) =>
			{
				extractedColors = result.colors;
				colorWeights = result.weights;
			});
		}
	});
</script>

<a class="inline-block touch-action-manipulation [-webkit-tap-highlight-color:transparent]" href={`/${roomId}/albums/${album.id}`}>
	<Card.Root
		class="w-full hover:bg-glass-bg-hover hover:border-glass-border-hover transition-all duration-300 relative overflow-hidden"
		onmouseenter={() => isHovered = true}
		onmouseleave={() => isHovered = false}
	>
		<div
			class="absolute inset-0 transition-opacity duration-1000"
		    style:opacity={isHovered && extractedColors.length > 0 ? 0.5 : 0}
		>
			{#if extractedColors.length > 0}
				<ColorBlobs colors={extractedColors} weights={colorWeights}
				/>
			{/if}
		</div>
		<Card.Content class="relative z-10">
			<AlbumCover albumId={album.id} albumName={album.name} />
		</Card.Content>
		<Card.Header class="relative z-10">
			<Card.Title class="font-display truncate">
				{album.name}
			</Card.Title>
			<a
				href={`/${roomId}/artists/${album.artistId}`}
				class="touch-action-manipulation [-webkit-tap-highlight-color:transparent]"
			>
				<Card.Description class="truncate hover:text-foreground transition-colors">
					<span>{album.artistName}</span>
				</Card.Description>
			</a>
		</Card.Header>
	</Card.Root>
</a>
