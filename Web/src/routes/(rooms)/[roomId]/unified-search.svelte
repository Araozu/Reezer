<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import { api, type components } from "~/api";
	import { Search, Music, Disc3, User, Youtube, Loader2 } from "lucide-svelte";
	import Input from "~/lib/components/ui/input/input.svelte";
	import Button from "~/lib/components/ui/button/button.svelte";
	import { page } from "$app/state";
	import AlbumCover from "~/components/album-cover.svelte";
	import type { ISong } from "~/audio-engine/types";
	import YoutubeSearchDialog from "./youtube-search-dialog.svelte";
	import { derived, writable } from "svelte/store";
	import { GetSvelteManagerContext } from "~/context/music-player-context";

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
	const svManager = GetSvelteManagerContext();

	let searchInput = $state("");
	const searchQuery = writable<string | null>(null);
	let youtubeDialogOpen = $state(false);

	const searchResults = createQuery<UnifiedSearchResult>(derived(searchQuery, ($searchQuery) => ({
		queryKey: ["unifiedSearch", $searchQuery],
		queryFn: async() =>
		{
			if (!$searchQuery) return { songs: [], ytSongs: [], albums: [], artists: [] };
			const res = await api.GET("/api/Search" as any, {
				params: { query: { q: $searchQuery, limit: 10 } },
			});
			if (res.error) throw res.error;
			return res.data as UnifiedSearchResult;
		},
		enabled: !!$searchQuery,
	})));

	function handleSearch(e: Event)
	{
		e.preventDefault();
		if (searchInput.trim())
		{
			searchQuery.set(searchInput.trim());
		}
	}

	function handleKeydown(e: KeyboardEvent)
	{
		if (e.key === "Enter")
		{
			handleSearch(e);
		}
	}

	function playSong(song: SongDto)
	{
		const queueSong: ISong = {
			id: song.id,
			name: song.name,
			type: "regular",
			artist: song.artist,
			album: song.album,
			albumId: song.albumId,
			duration: Number(song.duration),
		};
		svManager.imanager.PlaySong(queueSong);
	}

	function playYtSong(song: YtSongDto)
	{
		const queueSong: ISong = {
			id: song.ytId,
			name: song.name,
			type: "youtube",
			duration: Number(song.duration),
		};
		svManager.imanager.PlaySong(queueSong);
	}

	const hasResults = $derived($searchResults.data &&
			($searchResults.data.songs.length > 0 ||
				$searchResults.data.ytSongs.length > 0 ||
				$searchResults.data.albums.length > 0 ||
				$searchResults.data.artists.length > 0));

	const currentSearchQuery = $derived($searchQuery);
	const noResults = $derived(currentSearchQuery && !$searchResults.isLoading && !hasResults);
</script>

<div class="space-y-6">
	<form onsubmit={handleSearch} class="gap-3 flex">
		<div class="relative flex-1">
			<Search class="left-4 size-5 text-muted-foreground absolute top-1/2 -translate-y-1/2" />
			<Input
				type="text"
				placeholder="Search songs, albums, artists..."
				class="pl-12 h-12 text-base"
				bind:value={searchInput}
				onkeydown={handleKeydown}
			/>
		</div>
		<Button type="submit" size="lg" class="px-6">Search</Button>
	</form>

	{#if $searchResults.isLoading}
		<div class="py-12 flex items-center justify-center">
			<Loader2 class="size-8 animate-spin text-muted-foreground" />
		</div>
	{:else if noResults}
		<div class="py-12 text-muted-foreground text-center">
			<p>No results found for "{currentSearchQuery}"</p>
		</div>
	{:else if $searchResults.data && hasResults}
		<div class="space-y-8">
			{#if $searchResults.data.songs.length > 0}
				<section>
					<h2 class="text-xl font-semibold mb-4 gap-2 flex items-center">
						<Music class="size-5" />
						Songs
					</h2>
					<div class="space-y-1">
						{#each $searchResults.data.songs as song (song.id)}
							<button
								class="px-4 py-3 rounded-xl hover:bg-glass-bg-hover hover:backdrop-blur-lg gap-4 group touch-action-manipulation flex w-full items-center text-left transition-all duration-300 [-webkit-tap-highlight-color:transparent]"
								onclick={() => playSong(song)}
							>
								<div class="w-10 h-10 rounded-lg bg-glass-bg shrink-0 overflow-hidden">
									<img
										src="/api/Albums/{song.albumId}/cover"
										alt={song.album}
										class="h-full w-full object-cover"
									/>
								</div>
								<div class="min-w-0 flex-1">
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
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-xl font-semibold gap-2 flex items-center">
							<Youtube class="size-5" />
							YouTube Songs
						</h2>
						<Button variant="outline" size="sm" onclick={() => (youtubeDialogOpen = true)}>
							Search on YouTube
						</Button>
					</div>
					<div class="md:grid-cols-4 gap-4 grid grid-cols-2">
						{#each $searchResults.data.ytSongs as song (song.ytId)}
							<button
								class="rounded-xl bg-glass-bg hover:bg-glass-bg-hover border-glass-border hover:border-glass-border-hover backdrop-blur-xl touch-action-manipulation w-full overflow-hidden border text-left transition-all duration-300 [-webkit-tap-highlight-color:transparent]"
								onclick={() => playYtSong(song)}
							>
								<div class="aspect-video bg-glass-bg-hover w-full">
									<img
										src="/api/Yt/{song.ytId}/thumbnail"
										alt={song.name}
										class="h-full w-full object-cover"
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
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-xl font-semibold gap-2 flex items-center">
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
					<h2 class="text-xl font-semibold mb-4 gap-2 flex items-center">
						<Disc3 class="size-5" />
						Albums
					</h2>
					<div class="md:grid-cols-4 lg:grid-cols-6 gap-4 grid grid-cols-2">
						{#each $searchResults.data.albums as album (album.id)}
							<a
								href="/{roomId}/albums/{album.id}"
								class="rounded-xl bg-glass-bg hover:bg-glass-bg-hover border-glass-border hover:border-glass-border-hover backdrop-blur-xl touch-action-manipulation block overflow-hidden border transition-all duration-300 [-webkit-tap-highlight-color:transparent]"
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
					<h2 class="text-xl font-semibold mb-4 gap-2 flex items-center">
						<User class="size-5" />
						Artists
					</h2>
					<div class="md:grid-cols-3 lg:grid-cols-4 gap-4 grid grid-cols-2">
						{#each $searchResults.data.artists as artist (artist.id)}
							<a
								href="/{roomId}/artists/{artist.id}"
								class="px-4 py-4 rounded-xl bg-glass-bg hover:bg-glass-bg-hover border-glass-border hover:border-glass-border-hover backdrop-blur-xl touch-action-manipulation block border transition-all duration-300 [-webkit-tap-highlight-color:transparent]"
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
		<div class="py-12 text-muted-foreground text-center">
			<Search class="size-12 mb-4 mx-auto opacity-50" />
			<p>Enter a search term and press Enter to search</p>
		</div>
	{/if}
</div>

<YoutubeSearchDialog bind:open={youtubeDialogOpen} searchTerm={currentSearchQuery ?? searchInput} />
