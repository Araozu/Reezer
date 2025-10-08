<script lang="ts">
	import { useSongs } from "./queries";

	const songsQuery = useSongs();
</script>

{#if $songsQuery.isLoading}
	<p>Loading songs...</p>
{:else if $songsQuery.error}
	<p>Error loading songs: {$songsQuery.error.message}</p>
{:else if $songsQuery.data}
	<ul class="space-y-2">
		{#each $songsQuery.data as song (song.id)}
			<li class="p-4 border rounded-lg">
				<h3 class="font-medium">{song.name}</h3>
				<p class="text-sm text-gray-600">{song.id}</p>
			</li>
		{/each}
	</ul>
{:else}
	<p>No songs found.</p>
{/if}
