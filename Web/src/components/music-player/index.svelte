<script lang="ts">
import { MediaQuery } from "svelte/reactivity";
import { onMount } from "svelte";
import PlayerRootMobile from "./player-root-mobile.svelte";
import PlayerRootDesktop from "./player-root-desktop.svelte";
import { GetPlayerManagerContext } from "~/context/music-player-context";

let { collapsed = $bindable() }: { collapsed: boolean } = $props();

const isDesktop = new MediaQuery("(min-width: 48rem)");
const playerManager = GetPlayerManagerContext();

const VOLUME_STORAGE_KEY = "reezer-volume";

onMount(() =>
{
	const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
	if (savedVolume !== null)
	{
		const volume = parseFloat(savedVolume);
		if (!isNaN(volume) && volume >= 0 && volume <= 1)
		{
			playerManager.SetVolume(volume);
		}
	}
});
</script>

{#if isDesktop.current}
	<PlayerRootDesktop bind:collapsed />
{:else}
	<PlayerRootMobile bind:collapsed />
{/if}
