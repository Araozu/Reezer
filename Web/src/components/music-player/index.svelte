<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { ChevronsRight, ChevronsLeft } from "lucide-svelte";
	import { GetCurrentPlayer } from "../../player/index.svelte";

	let { collapsed = $bindable() }: { collapsed: boolean } = $props();

	let player = GetCurrentPlayer();
	let song = $derived(player.currentSong);
	let coverUrl = $derived(
		song ? `/api/Albums/${song.albumId}/cover` : "/vinyl.jpg",
	);
</script>

<div class="p-1 h-screen sticky top-0">
	<Card.Root class="h-full border-primary">
		<Card.Header class={collapsed ? "px-0" : ""}>
			<Card.Title
				class={[
					"font-display flex items-center gap-2",
					collapsed
						? "justify-center"
						: "justify-between",
				]}
			>
				{#if !collapsed}
					<span>Now playing</span>
				{/if}

				<button
					class={[
						"hover:bg-zinc-200 rounded-sm cursor-pointer transition-colors",
						!collapsed && "mr-2",
					]}
					onclick={() => {
						collapsed = !collapsed;
					}}
				>
					{#if collapsed}
						<ChevronsLeft />
					{:else}
						<ChevronsRight />
					{/if}
				</button>
			</Card.Title>
		</Card.Header>
		<Card.Content class={collapsed ? "px-2" : ""}>
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
