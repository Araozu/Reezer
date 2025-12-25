<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import { api, sv, type components } from "~/api";
	import { Search, Music, Disc3, User, Youtube, Loader2 } from "lucide-svelte";
	import Input from "~/lib/components/ui/input/input.svelte";
	import Button from "~/lib/components/ui/button/button.svelte";
	import { page } from "$app/state";
	import AlbumCover from "~/components/album-cover.svelte";
	import { GetQueueContext } from "~/context/music-player-context";
	import type { ISong } from "~/audio-engine/types";
	import YoutubeSearchDialog from "./youtube-search-dialog.svelte";
	import { derived, writable } from "svelte/store";

	type SongDto = components["schemas"]["SongDto"];
	type YtSongDto = components["schemas"]["YtSongDto"];
	type AlbumDto = components["schemas"]["AlbumDto"];
	type ArtistDto = components["schemas"]["ArtistDto"];

	type UnifiedSearchResult = {
		songs: SongDto[];
		ytSongs: YtSongDto[];
		albums: AlbumDto[];
		artists: ArtistDto[];
	};

	const roomId = page.params.roomId;
	const queue = GetQueueContext();

	let searchInput = $state("");
	const searchQuery = writable<string | null>(null);
	let youtubeDialogOpen = $state(false);

	const searchResults = createQuery<UnifiedSearchResult>(
		derived(searchQuery, ($searchQuery) => ({
			queryKey: ["unifiedSearch", $searchQuery],
			queryFn: async () => {
				if (!$searchQuery) return { songs: [], ytSongs: [], albums: [], artists: [] };
				const res = await api.GET("/api/Search" as any, {
					params: { query: { q: $searchQuery, limit: 10 } },
				});
				if (res.error) throw res.error;
				return res.data as UnifiedSearchResult;
			},
			enabled: !!$searchQuery,
		}))
	);

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchInput.trim()) {
			searchQuery.set(searchInput.trim());
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			handleSearch(e);
		}
	}

	function playSong(song: SongDto) {
		const queueSong: ISong = {
			id: song.id,
			name: song.name,
			type: "regular",
			artist: song.artist,
			album: song.album,
			albumId: song.albumId,
		};
		queue.PlaySong(queueSong);
	}

	function playYtSong(song: YtSongDto) {
		const queueSong: ISong = {
			id: song.ytId,
			name: song.name,
			type: "youtube",
		};
		queue.PlaySong(queueSong);
	}

	const hasResults = $derived(
		$searchResults.data &&
			($searchResults.data.songs.length > 0 ||
				$searchResults.data.ytSongs.length > 0 ||
				$searchResults.data.albums.length > 0 ||
				$searchResults.data.artists.length > 0)
	);

	const currentSearchQuery = $derived($searchQuery);
	const noResults = $derived(
		currentSearchQuery && !$searchResults.isLoading && !hasResults
	);
</script>

<div class="space-y-6">
	<form onsubmit={handleSearch} class="flex gap-3">
		<div class="relative flex-1">
			<Search class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
			<Input
				type="text"
				placeholder="Search songs, albums, artists..."
				class="pl-12 h-12 text-base"
				bind:value={searchInput}
				onkeydown={handleKeydown}
			/>
		</div>
		<Button type="submit" size="lg" class="px-6">
			Search
		</Button>
	</form>

	{#if $searchResults.isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="size-8 animate-spin text-muted-foreground" />
		</div>
	{:else if noResults}
		<div class="text-center py-12 text-muted-foreground">
			<p>No results found for "{currentSearchQuery}"</p>
		</div>
	{:else if $searchResults.data && hasResults}
		<div class="space-y-8">
			{#if $searchResults.data.songs.length > 0}
				<section>
					<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
						<Music class="size-5" />
						Songs
					</h2>
					<div class="space-y-1">
						{#each $searchResults.data.songs as song (song.id)}
							<button
								class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 hover:bg-glass-bg-hover hover:backdrop-blur-lg flex items-center gap-4 group touch-action-manipulation [-webkit-tap-highlight-color:transparent]"
								onclick={() => playSong(song)}
							>
								<div class="w-10 h-10 rounded-lg overflow-hidden bg-glass-bg shrink-0">
									<img
										src="/api/Albums/{song.albumId}/cover"
										alt={song.album}
										class="w-full h-full object-cover"
									/>
								</div>
								<div class="flex-1 min-w-0">
									<p class="font-medium truncate">{song.name}</p>
									<p class="text-sm text-muted-foreground truncate">
										{song.artist} · {song.album}
									</p>
								</div>
							</button>
						{/each}
					</div>
				</section>
			{/if}

			{#if $searchResults.data.ytSongs.length > 0}
				<section>
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-xl font-semibold flex items-center gap-2">
							<Youtube class="size-5" />
							YouTube Songs
						</h2>
						<Button variant="outline" size="sm" onclick={() => (youtubeDialogOpen = true)}>
							Search on YouTube
						</Button>
					</div>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
						{#each $searchResults.data.ytSongs as song (song.ytId)}
							<button
								class="w-full text-left rounded-xl transition-all duration-300 bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover backdrop-blur-xl overflow-hidden touch-action-manipulation [-webkit-tap-highlight-color:transparent]"
								onclick={() => playYtSong(song)}
							>
								<div class="aspect-video w-full bg-glass-bg-hover">
									<img
										src="/api/Yt/{song.ytId}/thumbnail"
										alt={song.name}
										class="w-full h-full object-cover"
									/>
								</div>
								<div class="p-3">
									<p class="font-medium line-clamp-2">{song.name}</p>
								</div>
							</button>
						{/each}
					</div>
				</section>
			{:else if currentSearchQuery}
				<section>
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-xl font-semibold flex items-center gap-2">
							<Youtube class="size-5" />
							YouTube Songs
						</h2>
						<Button variant="outline" size="sm" onclick={() => (youtubeDialogOpen = true)}>
							Search on YouTube
						</Button>
					</div>
					<p class="text-muted-foreground text-sm">
						No YouTube songs found. Try searching on YouTube directly.
					</p>
				</section>
			{/if}

			{#if $searchResults.data.albums.length > 0}
				<section>
					<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
						<Disc3 class="size-5" />
						Albums
					</h2>
					<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{#each $searchResults.data.albums as album (album.id)}
							<a
								href="/{roomId}/albums/{album.id}"
								class="block rounded-xl transition-all duration-300 bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover backdrop-blur-xl overflow-hidden touch-action-manipulation [-webkit-tap-highlight-color:transparent]"
							>
								<div class="p-3">
									<AlbumCover albumId={album.id} albumName={album.name} />
								</div>
								<div class="px-3 pb-3">
									<p class="font-medium truncate">{album.name}</p>
									<p class="text-sm text-muted-foreground truncate">{album.artistName}</p>
								</div>
							</a>
						{/each}
					</div>
				</section>
			{/if}

			{#if $searchResults.data.artists.length > 0}
				<section>
					<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
						<User class="size-5" />
						Artists
					</h2>
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{#each $searchResults.data.artists as artist (artist.id)}
							<a
								href="/{roomId}/artists/{artist.id}"
								class="block px-4 py-4 rounded-xl transition-all duration-300 bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover backdrop-blur-xl touch-action-manipulation [-webkit-tap-highlight-color:transparent]"
							>
								<p class="font-medium">{artist.name}</p>
								<p class="text-sm text-muted-foreground">
									{artist.albums?.length ?? 0} album{(artist.albums?.length ?? 0) !== 1 ? "s" : ""}
								</p>
							</a>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{:else if !currentSearchQuery}
		<div class="text-center py-12 text-muted-foreground">
			<Search class="size-12 mx-auto mb-4 opacity-50" />
			<p>Enter a search term and press Enter to search</p>
		</div>
	{/if}
</div>

<YoutubeSearchDialog bind:open={youtubeDialogOpen} searchTerm={currentSearchQuery ?? searchInput} />
