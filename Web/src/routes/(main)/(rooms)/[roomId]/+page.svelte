<script lang="ts">
	import { useRecentAlbums } from "./queries";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Disc3, User } from "lucide-svelte";
	import {page} from "$app/state";
	import AlbumCard from "~/components/album-card.svelte";

	const roomId = page.params.roomId;
	const albumsQuery = useRecentAlbums(6);

	const recentAlbums = $derived($albumsQuery.data?.items ?? []);
</script>

<svelte:head>
	<title>Reezer</title>
</svelte:head>

<div class="px-6 py-8 space-y-12">
	<section>
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-4xl font-bold font-display">
				Welcome to Reezer
			</h1>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<a href={`/${roomId}/albums`}>
				<Card.Root
					class="hover:border-primary transition-colors cursor-pointer group"
				>
					<Card.Content
						class="flex items-center gap-4 p-6"
					>
						<div
							class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
						>
							<Disc3
								class="w-6 h-6 text-primary"
							/>
						</div>
						<div>
							<Card.Title
								class="text-lg"
							>
								Albums
							</Card.Title >
							<Card.Description>
								Browse your collection
							</Card.Description>
						</div>
					</Card.Content>
				</Card.Root>
			</a>

			<a href={`/${roomId}/artists`}>
				<Card.Root
					class="hover:border-primary transition-colors cursor-pointer group"
				>
					<Card.Content
						class="flex items-center gap-4 p-6"
					>
						<div
							class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
						>
							<User
								class="w-6 h-6 text-primary"
							/>
						</div>
						<div>
							<Card.Title
								class="text-lg"
							>
								Artists
							</Card.Title>
							<Card.Description
								>Discover by
								artist</Card.Description
							>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		</div>
	</section>

	{#if $albumsQuery.isLoading}
		<section>
			<h2 class="text-2xl font-semibold mb-4 font-display">
				Loading...
			</h2>
		</section>
	{:else if $albumsQuery.error}
		<section>
			<Card.Root class="border-destructive">
				<Card.Content class="p-6">
					<p class="text-destructive">
						Error loading albums: {$albumsQuery
							.error.message}
					</p>
				</Card.Content>
			</Card.Root>
		</section>
	{:else if recentAlbums.length > 0}
		<section>
			<h2 class="text-2xl font-semibold mb-4 font-display">
				Recent Albums
			</h2>
			<div
				class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
			>
				{#each recentAlbums as album (album.id)}
					<AlbumCard {album} />
				{/each}
			</div>
		</section>
	{/if}
</div>
