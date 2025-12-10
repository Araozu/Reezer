<script lang="ts">
import * as Item from "$lib/components/ui/item";
import { onMount } from "svelte";
import { useAddYtSong } from "./yt/queries";
import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-svelte";

const {ytUrl}: {ytUrl: string} = $props();

const addYtSong = useAddYtSong();
const mutationStatus = $derived.by(() =>
{
	if ($addYtSong.isError)
	{
		return "error";
	}
	else if ($addYtSong.isPending)
	{
		return "loading";
	}
	else if ($addYtSong.isSuccess)
	{
		return "success";
	}
	else
	{
		return "idle";
	}
});
const errorMessage = $derived.by(() =>
{
	if ($addYtSong.isError)
	{
		return $addYtSong.error.detail ?? "An unknown error occurred";
	}
	return null;
});

onMount(() =>
{
	$addYtSong.mutate(ytUrl);
});
</script>

<Item.Root class="max-w-full">
	<Item.Media>
		{#if $addYtSong.isError}
			<TriangleAlert class="text-red-400" />
		{:else if $addYtSong.isPending}
			<LoaderCircle class="animate-spin" />
		{:else if $addYtSong.isSuccess}
			<CircleCheck class="text-green-600" />
		{/if}
	</Item.Media>
	<Item.Content class="min-w-0">
		<Item.Title class="flex-1 min-w-0 truncate max-w-80">{ytUrl}</Item.Title>
		<Item.Description>
			{#if errorMessage}
				<Item.Description class="text-destructive">Error: {errorMessage}</Item.Description>
			{:else}
				{mutationStatus}
			{/if}
		</Item.Description>
	</Item.Content>
	<Item.Actions />
</Item.Root>
