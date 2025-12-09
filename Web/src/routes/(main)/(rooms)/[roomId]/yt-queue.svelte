<script lang="ts">
import { Input } from "$lib/components/ui/input";
import { Button } from "$lib/components/ui/button";
import { Label } from "$lib/components/ui/label";
import * as Dialog from "$lib/components/ui/dialog";
import * as Card from "$lib/components/ui/card";

let open = true;
let url = $state("");
let errorMessage = $state<string | null>(null);

let downloadCount = 0;
let queuedDownloads = $state<Array<[number, string]>>([]);

async function handleSubmit(e: Event)
{
	e.preventDefault();
	errorMessage = null;

	if (!url.trim())
	{
		errorMessage = "Please enter a YouTube URL";
		return;
	}

	queuedDownloads.push([downloadCount, url]);
	downloadCount += 1;
	url = "";
}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>YouTube Downloads</Dialog.Title>

			<form onsubmit={handleSubmit} class="grid grid-cols-[auto_7rem] items-end">
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="url">YouTube URL</Label>
						<Input
							id="url"
							bind:value={url}
							placeholder="https://www.youtube.com/watch?v=..."
						/>
						{#if errorMessage}
							<p class="text-sm text-destructive">{errorMessage}</p>
						{/if}
					</div>
				</div>
				<Dialog.Footer class="py-4">
					<Button
						type="submit"
						class="gap-2"
					>
						Add Song
					</Button>
				</Dialog.Footer>
			</form>

			<Card.Root>
				<Card.Header>
					<Card.Title>Ongoing downloads</Card.Title>
				</Card.Header>
				<Card.Content>
					{#each queuedDownloads as [id, downloadUrl] (id)}
						<p class="mb-2">[{id}] {downloadUrl}</p>
					{/each}
				</Card.Content>
			</Card.Root>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
