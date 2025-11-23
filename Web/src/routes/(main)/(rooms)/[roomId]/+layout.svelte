<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { toStore } from "svelte/store";
	import MusicPlayer from "~/components/music-player/index.svelte";
	import { CreatePlayerContext } from "~/player/index.svelte";
	import type { MusicRoomHub } from "~/lib/MusicRoomHub.svelte";
	import ClickTrap from "./click-trap.svelte";

	let { children } = $props();
	let audioTag = $state<HTMLAudioElement | null>(null);

	const musicHub = getContext<MusicRoomHub>("musicHub");

	// Audio bindings
	let aPaused = $state(false);
	let aVolume = $state(0.5);
	let aCurrentTime = $state(0);
	let aDuration = $state(0);

	let player = CreatePlayerContext(
		musicHub,
		toStore(
			() => aPaused,
			(v) => (aPaused = v),
		),
		toStore(
			() => aVolume,
			(v) => (aVolume = v),
		),
		toStore(
			() => aCurrentTime,
			(v) => (aCurrentTime = v),
		),
		toStore(() => aDuration),
	);
	let audioTagSetup = $derived(player.audioReady);

	onMount(() => {
		player.OverrideTag(audioTag!);
	});



	let playerCollapsed = $state(true);
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
	<audio
		src="/_.opus"
		bind:this={audioTag}
		bind:volume={aVolume}
		bind:paused={aPaused}
		bind:currentTime={aCurrentTime}
		bind:duration={aDuration}
	>
	</audio>
</div>
