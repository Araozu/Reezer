<script lang="ts">
	import { useSongs } from "./queries";
	import { GetCurrentPlayer } from "../../player/index.svelte";

	const songsQuery = useSongs();
	const player = GetCurrentPlayer();

	let currentlyPlayingId = $state<string | null>(null);

	function PlaySong(songId: string) {
		// Start new playback
		currentlyPlayingId = songId;
		player.PlaySong(`/api/Songs/${songId}/stream`);
	}
</script>

{#if $songsQuery.isLoading}
	<p>Loading songs...</p>
{:else if $songsQuery.error}
	<p>Error loading songs: {$songsQuery.error.message}</p>
{:else if $songsQuery.data}
	<ul class="space-y-2">
		{#each $songsQuery.data as song (song.id)}
			<button onclick={() => PlaySong(song.id)}>
				<li
					class="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
					class:bg-blue-50={currentlyPlayingId ===
						song.id}
				>
					<div class="flex items-center gap-3">
						<div
							class="w-8 h-8 flex items-center justify-center"
						>
							{#if currentlyPlayingId === song.id && !player.paused}
								<span
									class="text-blue-600"
								>
									▶️</span
								>
							{:else if currentlyPlayingId === song.id && player.paused}
								<span
									class="text-blue-400"
								>
									⏸️</span
								>
							{:else}
								<span
									class="text-gray-400"
								>
									⏸️</span
								>
							{/if}
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
