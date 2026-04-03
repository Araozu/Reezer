<script lang="ts">
	import type { components } from "~/api";
	import * as Card from "~/lib/components/ui/card-plain";
	import { page } from "$app/state";

	type Artist = components["schemas"]["ArtistDto"];

	let { artist }: { artist: Artist } = $props();
	const roomId = page.params.roomId;
</script>

<a
	class="touch-action-manipulation inline-block [-webkit-tap-highlight-color:transparent]"
	href={`/${roomId}/artists/${artist.id}`}
>
	<Card.Root
		class="hover:bg-glass-bg-hover hover:border-glass-border-hover relative w-full overflow-hidden transition-all duration-300"
	>
		<Card.Header class="relative z-10">
			<Card.Title class="font-display py-8 truncate text-center">
				{artist.name}
			</Card.Title>
		</Card.Header>
	</Card.Root>
</a>
