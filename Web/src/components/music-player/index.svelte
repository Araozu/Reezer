<script lang="ts">
	import { MediaQuery } from "svelte/reactivity";
	import PlayerRootMobile from "./player-root-mobile.svelte";
	import PlayerRootDesktop from "./player-root-desktop.svelte";

	let { collapsed = $bindable() }: { collapsed: boolean } = $props();

	const isDesktop = new MediaQuery("(min-width: 48rem)");
</script>

{#if isDesktop.current}
	<PlayerRootDesktop bind:collapsed />
{:else}
	<PlayerRootMobile bind:collapsed />
{/if}
