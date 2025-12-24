<script lang="ts">
	import type { components } from "~/api";
	import * as Card from "~/lib/components/ui/card-plain";
	import AlbumCover from "./album-cover.svelte";
	import { page } from "$app/state";
	import { extractColorsFromImage } from "$lib/color-extractor";

	type Album = components["schemas"]["AlbumDto"];

	let { album }: { album: Album } = $props();
	const roomId = page.params.roomId;

	let isHovered = $state(false);
	let extractedColors = $state<string[]>([]);
	let hasTriedExtraction = $state(false);

	const coverUrl = `/api/Albums/${album.id}/cover`;

	$effect(() =>
	{
		if (isHovered && extractedColors.length === 0 && !hasTriedExtraction)
		{
			hasTriedExtraction = true;
			extractColorsFromImage(coverUrl, 4).then((result) =>
			{
				extractedColors = result.colors;
			});
		}
	});
</script>

<a class="inline-block touch-action-manipulation [-webkit-tap-highlight-color:transparent]" href={`/${roomId}/albums/${album.id}`}>
	<Card.Root
		class="w-full hover:bg-glass-bg-hover hover:border-glass-border-hover transition-all duration-300 relative overflow-hidden"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<div
			class="absolute inset-0 transition-opacity {isHovered ? 'duration-1000' : 'duration-[250ms]'}"
			style:opacity={isHovered && extractedColors.length > 0 ? 1 : 0}
		>
			{#if extractedColors.length > 0}
				<div
					class="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full blur-3xl opacity-50"
					style:background-color={extractedColors[0]}
				></div>
				{#if extractedColors[1]}
					<div
						class="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] rounded-full blur-3xl opacity-50"
						style:background-color={extractedColors[1]}
					></div>
				{/if}
				{#if extractedColors[2]}
					<div
						class="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-50"
						style:background-color={extractedColors[2]}
					></div>
				{/if}
				{#if extractedColors[3]}
					<div
						class="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-50"
						style:background-color={extractedColors[3]}
					></div>
				{/if}
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
