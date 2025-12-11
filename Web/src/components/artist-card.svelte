<script lang="ts">
	import type { components } from "~/api";
	import * as Card from "~/lib/components/ui/card-plain";
	import { page } from "$app/state";

	type Artist = components["schemas"]["ArtistDto"];

	let { artist }: { artist: Artist } = $props();
	const roomId = page.params.roomId;
</script>

<a class="inline-block touch-action-manipulation [-webkit-tap-highlight-color:transparent]" href={`/${roomId}/artists/${artist.id}`}>
	<Card.Root
		class="w-full hover:bg-glass-bg-hover hover:border-glass-border-hover transition-all duration-300 relative overflow-hidden"
	>
		<Card.Header class="relative z-10">
			<Card.Title class="font-display truncate text-center py-8">
				{artist.name}
			</Card.Title>
		</Card.Header>
	</Card.Root>
</a>
