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

	let showGlow = $derived(isHovered && extractedColors.length > 0);

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

<a
	class="touch-action-manipulation inline-block [-webkit-tap-highlight-color:transparent]"
	href={`/${roomId}/albums/${album.id}`}
>
	<Card.Root
		class="relative w-full overflow-hidden transition-all duration-300"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<div
			class="inset-0 absolute transition-opacity {showGlow ? "duration-500" : "duration-250"}"
			style:opacity={showGlow ? 1 : 0}
		>
			{#if extractedColors.length > 0}
				<div
					class="blur-3xl absolute -top-[20%] -left-[20%] h-[70%] w-[70%] rounded-full opacity-50"
					style:background-color={extractedColors[0]}
				></div>
				{#if extractedColors[1]}
					<div
						class="blur-3xl absolute -right-[20%] -bottom-[20%] h-[70%] w-[70%] rounded-full opacity-50"
						style:background-color={extractedColors[1]}
					></div>
				{/if}
				{#if extractedColors[2]}
					<div
						class="blur-3xl absolute -top-[20%] -right-[20%] h-[50%] w-[50%] rounded-full opacity-50"
						style:background-color={extractedColors[2]}
					></div>
				{/if}
				{#if extractedColors[3]}
					<div
						class="blur-3xl absolute -bottom-[20%] -left-[10%] h-[50%] w-[50%] rounded-full opacity-50"
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
				<Card.Description class="hover:text-foreground truncate transition-colors">
					<span>{album.artistName}</span>
				</Card.Description>
			</a>
		</Card.Header>
	</Card.Root>
</a>
