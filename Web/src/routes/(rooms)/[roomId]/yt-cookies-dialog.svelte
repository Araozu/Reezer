<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Textarea } from "$lib/components/ui/textarea";
	import { ytCookiesOpenState } from "./yt-cookies-dialog.impl.svelte";
	import { useSetYtCookies } from "./yt/queries";

	let cookiesText = $state("");
	let errorMessage = $state<string | null>(null);

	const setYtCookiesMutation = useSetYtCookies();

	async function handleSubmit(e: Event)
	{
		e.preventDefault();
		errorMessage = null;

		if (!cookiesText.trim())
		{
			errorMessage = "Please enter cookies content";
			return;
		}

		try
		{
			await $setYtCookiesMutation.mutateAsync(cookiesText);
			ytCookiesOpenState.open = false;
			cookiesText = "";
		}
		catch (error: unknown)
		{
			if (error && typeof error === "object" && "detail" in error)
			{
				errorMessage = String(error.detail);
			}
			else
			{
				errorMessage = "Failed to save cookies";
			}
		}
	}
</script>

<Dialog.Root bind:open={ytCookiesOpenState.open}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Set YouTube Cookies</Dialog.Title>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="gap-4 py-4 grid">
			<div class="gap-2 grid">
				<Label for="cookies">
					Use extension "Get cookies.txt locally" for Chrome or "cookies.txt" for Firefox
				</Label>
				<Textarea
					id="cookies"
					bind:value={cookiesText}
					placeholder="Paste cookies.txt content here..."
					rows={10}
					class="font-mono text-xs"
				/>
				{#if errorMessage}
					<p class="text-sm text-destructive">{errorMessage}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={$setYtCookiesMutation.isPending}>
					{$setYtCookiesMutation.isPending ? "Saving..." : "Submit"}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
