<script lang="ts">
	import { useSongs } from "./queries";

	const songsQuery = useSongs();

	let currentlyPlayingId: string | null = null;
	let audioElement: HTMLAudioElement | null = null;

	function playSong(songId: string) {
		// Stop current playback if any
		if (audioElement) {
			audioElement.pause();
			audioElement = null;
		}

		// If clicking the same song, just stop
		if (currentlyPlayingId === songId) {
			currentlyPlayingId = null;
			return;
		}

		// Start new playback
		currentlyPlayingId = songId;
		audioElement = new Audio(`/api/Songs/${songId}/stream`);
		audioElement.volume = 0.3;

		audioElement.addEventListener('ended', () => {
			currentlyPlayingId = null;
			audioElement = null;
		});

		audioElement.addEventListener('error', () => {
			currentlyPlayingId = null;
			audioElement = null;
			console.error('Error playing song');
		});

		audioElement.play().catch(console.error);
	}
</script>

{#if $songsQuery.isLoading}
	<p>Loading songs...</p>
{:else if $songsQuery.error}
	<p>Error loading songs: {$songsQuery.error.message}</p>
{:else if $songsQuery.data}
	<ul class="space-y-2">
		{#each $songsQuery.data as song (song.id)}
		 <button
onclick={() => playSong(song.id)}
		 >
			<li class="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
				class:bg-blue-50={currentlyPlayingId === song.id}
				>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 flex items-center justify-center">
						{#if currentlyPlayingId === song.id}
							<span class="text-blue-600">▶️</span>
						{:else}
							<span class="text-gray-400">⏸️</span>
						{/if}
					</div>
					<div>
						<h3 class="font-medium">{song.name}</h3>
						<p class="text-sm text-gray-600">{song.id}</p>
					</div>
				</div>
			</li>
		 </button>
		{/each}
	</ul>
{:else}
	<p>No songs found.</p>
{/if}
