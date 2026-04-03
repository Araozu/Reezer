<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Disc3, User, Shuffle } from "lucide-svelte";
	import { page } from "$app/state";
	import UnifiedSearch from "./unified-search.svelte";

	const roomId = page.params.roomId;
</script>

<svelte:head>
	<title>Reezer</title>
</svelte:head>

<div class="px-6 py-8 space-y-12">
	<section>
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-4xl font-bold font-display">Welcome to Reezer</h1>
		</div>

		<div class="md:grid-cols-3 gap-4 grid grid-cols-1">
			<a href={`/${roomId}/albums`}>
				<Card.Root class="hover:border-primary group cursor-pointer transition-colors">
					<Card.Content class="gap-4 p-6 flex items-center">
						<div
							class="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors"
						>
							<Disc3 class="w-6 h-6 text-primary" />
						</div>
						<div>
							<Card.Title class="text-lg">Albums</Card.Title>
							<Card.Description>Browse your collection</Card.Description>
						</div>
					</Card.Content>
				</Card.Root>
			</a>

			<a href={`/${roomId}/artists`}>
				<Card.Root class="hover:border-primary group cursor-pointer transition-colors">
					<Card.Content class="gap-4 p-6 flex items-center">
						<div
							class="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors"
						>
							<User class="w-6 h-6 text-primary" />
						</div>
						<div>
							<Card.Title class="text-lg">Artists</Card.Title>
							<Card.Description>Discover by artist</Card.Description>
						</div>
					</Card.Content>
				</Card.Root>
			</a>

			<a href={`/${roomId}/random`}>
				<Card.Root class="hover:border-primary group cursor-pointer transition-colors">
					<Card.Content class="gap-4 p-6 flex items-center">
						<div
							class="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors"
						>
							<Shuffle class="w-6 h-6 text-primary" />
						</div>
						<div>
							<Card.Title class="text-lg">Random Albums</Card.Title>
							<Card.Description>Discover something new</Card.Description>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-semibold mb-4 font-display">Search</h2>
		<UnifiedSearch />
	</section>
</div>
