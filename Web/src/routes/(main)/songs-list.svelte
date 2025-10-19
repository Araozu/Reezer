<script lang="ts">
	import { useSongs } from "./queries";
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import type { ISong } from "../../providers";

	const songsQuery = useSongs();
	const player = GetCurrentPlayer();

	let currentlyPlayingId = $state<string | null>(null);

	function PlaySong(song: ISong)
	{
		// Start new playback
		currentlyPlayingId = song.id;
		player.PlaySong(song);
	}
</script>

{#if $songsQuery.isLoading}
	<p>Loading songs...</p>
{:else if $songsQuery.error}
	<p>Error loading songs: {$songsQuery.error.message}</p>
{:else if $songsQuery.data}
	<ul class="space-y-2">
		{#each $songsQuery.data as song (song.id)}
			<button onclick={() => PlaySong(song)}>
				<li
					class={[
						"p-4 border rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors",
						currentlyPlayingId == song.id &&
							"bg-blue-50 dark:bg-primary/50",
					]}
				>
					<div class="flex items-center gap-3">
						<div
							class="w-8 h-8 flex items-center justify-center"
						>
							<span
								class="text-blue-600"
							>
								▶️</span
							>
						</div>
						<div>
							<h3 class="font-medium">
								{song.name}
							</h3>
							<p
								class="text-sm text-gray-600"
							>
								{song.id}
							</p>
						</div>
					</div>
				</li>
			</button>
		{/each}
	</ul>
{:else}
	<p>No songs found.</p>
{/if}
