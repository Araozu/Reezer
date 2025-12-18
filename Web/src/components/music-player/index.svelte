<script lang="ts">
import { MediaQuery } from "svelte/reactivity";
import { onMount } from "svelte";
import PlayerRootMobile from "./player-root-mobile.svelte";
import PlayerRootDesktop from "./player-root-desktop.svelte";

let { collapsed = $bindable() }: { collapsed: boolean } = $props();

const isDesktop = new MediaQuery("(min-width: 48rem)");
const player = GetPlayerContext();

const VOLUME_STORAGE_KEY = "reezer-volume";

onMount(() =>
{
	const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
	if (savedVolume !== null)
	{
		const volume = parseFloat(savedVolume);
		if (!isNaN(volume) && volume >= 0 && volume <= 1)
		{
			player.volume = volume;
		}
	}
});
</script>

{#if isDesktop.current}
	<PlayerRootDesktop bind:collapsed />
{:else}
	<PlayerRootMobile bind:collapsed />
{/if}
