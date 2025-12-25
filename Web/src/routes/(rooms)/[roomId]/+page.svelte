<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Disc3, User, Shuffle } from "lucide-svelte";
	import {page} from "$app/state";
	import UnifiedSearch from "./unified-search.svelte";

	const roomId = page.params.roomId;
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

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

			<a href={`/${roomId}/random`}>
				<Card.Root
					class="hover:border-primary transition-colors cursor-pointer group"
				>
					<Card.Content
						class="flex items-center gap-4 p-6"
					>
						<div
							class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
						>
							<Shuffle
								class="w-6 h-6 text-primary"
							/>
						</div>
						<div>
							<Card.Title
								class="text-lg"
							>
								Random Albums
							</Card.Title>
							<Card.Description
								>Discover something new</Card.Description
							>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-semibold mb-4 font-display">
			Search
		</h2>
		<UnifiedSearch />
	</section>
</div>
