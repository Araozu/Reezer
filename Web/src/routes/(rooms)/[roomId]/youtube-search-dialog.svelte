<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import Input from "~/lib/components/ui/input/input.svelte";
	import Button from "~/lib/components/ui/button/button.svelte";
	import { useAddYtSong } from "./yt/queries";
	import { Loader2, ExternalLink, HelpCircle } from "lucide-svelte";
	import { toast } from "svelte-sonner";

	interface Props {
		open: boolean;
		searchTerm?: string;
	}

	let { open = $bindable(), searchTerm = "" }: Props = $props();

	const addYtSongMutation = useAddYtSong();

	let ytUrl = $state("");

	const youtubeSearchUrl = $derived(
		`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm || "")}`
	);

	async function handleAddSong() {
		if (!ytUrl.trim()) return;

		try {
			await $addYtSongMutation.mutateAsync(ytUrl.trim());
			toast.success("YouTube song added successfully!");
			ytUrl = "";
			open = false;
		} catch (e: any) {
			toast.error(e?.detail ?? "Failed to add YouTube song");
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && ytUrl.trim()) {
			handleAddSong();
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-4xl max-h-[90vh] flex flex-col">
		<Dialog.Header>
			<Dialog.Title>Search on YouTube</Dialog.Title>
			<Dialog.Description>
				Find a song on YouTube and paste its URL below to add it to your library.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex-1 min-h-0 space-y-4 overflow-hidden">
			<div class="aspect-video w-full rounded-xl overflow-hidden bg-glass-bg border border-glass-border">
				<iframe
					src={youtubeSearchUrl}
					title="YouTube Search"
					class="w-full h-full"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>

			<div class="space-y-3">
				<div class="flex items-start gap-2 p-3 rounded-xl bg-glass-bg border border-glass-border">
					<HelpCircle class="size-5 text-muted-foreground shrink-0 mt-0.5" />
					<div class="text-sm text-muted-foreground">
						<p class="font-medium text-foreground mb-1">How to add a YouTube song:</p>
						<ol class="list-decimal list-inside space-y-1">
							<li>Search for the song in the YouTube player above</li>
							<li>Click on the video you want</li>
							<li>Copy the URL from your browser's address bar</li>
							<li>Paste it below and click "Add Song"</li>
						</ol>
					</div>
				</div>

				<div class="flex gap-3">
					<Input
						type="url"
						placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
						bind:value={ytUrl}
						onkeydown={handleKeydown}
						class="flex-1"
					/>
					<Button
						onclick={handleAddSong}
						disabled={!ytUrl.trim() || $addYtSongMutation.isPending}
					>
						{#if $addYtSongMutation.isPending}
							<Loader2 class="size-4 animate-spin" />
						{:else}
							Add Song
						{/if}
					</Button>
				</div>

				<div class="flex justify-end">
					<a
						href={youtubeSearchUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
					>
						Open in new tab
						<ExternalLink class="size-3" />
					</a>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>
				Close
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
