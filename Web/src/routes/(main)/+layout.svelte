<script lang="ts">
	import { toStore } from "svelte/store";
	import MusicPlayer from "../../components/music-player/index.svelte";
	import {
		CreatePlayerContext,
		GetCurrentPlayer,
	} from "../../player/index.svelte";

	let { children } = $props();
	let audioTag = $state<HTMLAudioElement | null>(null);
	let audioTagSetup = $state(false);

	// Audio bindings
	let aPaused = $state(false);
	let aVolume = $state(0.5);

	CreatePlayerContext(
		toStore(
			() => aPaused,
			(v) => (aPaused = v),
		),
		toStore(
			() => aVolume,
			(v) => (aVolume = v),
		),
	);
	let player = GetCurrentPlayer();

	$effect(() => {
		if (audioTag === null) return;

		player.OverrideTag(audioTag);
		audioTagSetup = true;
	});

	let playerCollapsed = $state(true);
</script>

<div
	class={[
		"grid",
		playerCollapsed
			? "grid-cols-[auto_6rem]"
			: "grid-cols-[auto_30rem]",
	]}
>
	<div>
		{#if audioTagSetup}
			{@render children()}
		{/if}
	</div>
	<audio
		src="/_.opus"
		bind:this={audioTag}
		bind:volume={aVolume}
		bind:paused={aPaused}
	>
	</audio>
	<MusicPlayer bind:collapsed={playerCollapsed} />
</div>
