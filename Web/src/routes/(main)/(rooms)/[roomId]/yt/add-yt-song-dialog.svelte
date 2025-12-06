<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { useAddYtSong } from "./queries";
	import { Plus, Loader2 } from "lucide-svelte";

	let open = $state(false);
	let url = $state("");
	let errorMessage = $state<string | null>(null);

	const addYtSongMutation = useAddYtSong();

	async function handleSubmit(e: Event)
	{
		e.preventDefault();
		errorMessage = null;

		if (!url.trim())
		{
			errorMessage = "Please enter a YouTube URL";
			return;
		}

		try
		{
			await $addYtSongMutation.mutateAsync(url);
			url = "";
			open = false;
		}
		catch (error)
		{
			errorMessage = (error as { message: string }).message;
		}
	}

	function handleOpenChange(newOpen: boolean)
	{
		open = newOpen;
		if (!newOpen)
		{
			url = "";
			errorMessage = null;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} class="gap-2">
				<Plus class="w-4 h-4" />
				Add YouTube Song
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add YouTube Song</Dialog.Title>
			<Dialog.Description>
				Enter a YouTube URL to add a song to your library
			</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={handleSubmit}>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="url">YouTube URL</Label>
					<Input
						id="url"
						bind:value={url}
						placeholder="https://www.youtube.com/watch?v=..."
						disabled={$addYtSongMutation.isPending}
					/>
					{#if errorMessage}
						<p class="text-sm text-destructive">{errorMessage}</p>
					{/if}
				</div>
			</div>
			<Dialog.Footer>
				<Button
					type="submit"
					disabled={$addYtSongMutation.isPending}
					class="gap-2"
				>
					{#if $addYtSongMutation.isPending}
						<Loader2 class="w-4 h-4 animate-spin" />
						Adding...
					{:else}
						Add Song
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
