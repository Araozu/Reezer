<script lang="ts">
	import { setContext } from "svelte";
	import MusicPlayer from "~/components/music-player/index.svelte";
	import ClickTrap from "./click-trap.svelte";
	import { UrlAudioSource } from "~/player2/audio-sources/UrlAudioSource";
	import { GaplessBackend } from "~/player2/backends/GaplessBackend";
	import type { IAudioBackend } from "~/player2/interfaces/IAudioBackend";

	let { children } = $props();

	// Setup music player
	const audioBackend: IAudioBackend = new GaplessBackend(
		new UrlAudioSource(),
	);
	setContext("audio", audioBackend);

	let audioTagSetup = $state(false);
	let playerCollapsed = $state(true);

	audioBackend.OnReady(() => (audioTagSetup = true));
</script>

<div
	class={[
		"grid",
		playerCollapsed
			? "md:grid-cols-[auto_6rem]"
			: "md:grid-cols-[auto_30rem]",
	]}
>
	<div class="pb-12">
		{#if audioTagSetup}
			{@render children()}
		{:else}
			<ClickTrap />
		{/if}
	</div>
	{#if audioTagSetup}
		<MusicPlayer bind:collapsed={playerCollapsed} />
	{/if}
</div>
