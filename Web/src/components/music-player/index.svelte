<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { ChevronsRight } from "lucide-svelte";
	import { GetCurrentPlayer } from "../../player/index.svelte";

	let player = GetCurrentPlayer();
	let song = $derived(player.currentSong);
	let coverUrl = $derived(
		song ? `/api/Albums/${song.albumId}/cover` : "/vinyl.jpg",
	);

	let imgLink =
		"https://navidrome.araozu.dev/rest/getCoverArt?u=fernando&t=ff0cd713cc6f438348e32123b893c4c6&s=20c44f&f=json&v=1.8.0&c=NavidromeUI&id=al-4BVGFEYgyFyJE6eDPH3QK1&_=2025-08-16T21%3A49%3A22.9279453Z";
</script>

<div class="p-1 h-screen sticky top-0">
	<Card.Root class="h-full border-primary">
		<Card.Header>
			<Card.Title
				class="font-display flex justify-between items-center gap-2"
			>
				<span>Now playing</span>

				<button
					class="hover:bg-zinc-200 rounded-sm cursor-pointer transition-colors"
				>
					<ChevronsRight />
				</button>
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<img
				class="shadow rounded-xl"
				src={coverUrl}
				alt="Album portrait"
			/>
			<div class="py-2">
				<p class="font-bold font-display text-xl">
					{song?.name ?? "-"}
				</p>
				<p class="font-medium text-foreground/80">
					<span class="underline">
						{song?.artist ?? "-"}
					</span>
					• {song?.album ?? "-"}
				</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
