<script lang="ts">
	import type { components } from "~/api";
	import * as Card from "$lib/components/ui/card/index.js";
	import AlbumCover from "./album-cover.svelte";
	import {page} from "$app/state";

	type Album = components["schemas"]["AlbumDto"];

	let { album }: { album: Album } = $props();
	const roomId = page.params.roomId;
</script>

<a class="inline-block" href={`/${roomId}/albums/${album.id}`}>
	<Card.Root
		class="w-full hover:border-primary transition-colors"
	>
		<Card.Content>
			<AlbumCover albumId={album.id} albumName={album.name} />
		</Card.Content>
		<Card.Header>
			<Card.Title class="font-display truncate">
				{album.name}
			</Card.Title>
			<a
				href={`/${roomId}/artists/${album.artistId}`}
			>
				<Card.Description class="truncate underline hover:text-primary transition-colors">
					<span>{album.artistName}</span>
				</Card.Description>
			</a>
		</Card.Header>
	</Card.Root>
</a>
