<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { toStore } from "svelte/store";
	import MusicPlayer from "~/components/music-player/index.svelte";
	import MobilePlayer from "~/components/music-player/mobile-player.svelte";
	import { CreatePlayerContext } from "../../../player/index.svelte";
	import type { MusicHub } from "~/lib/MusicHub.svelte";
	import ClickTrap from "./click-trap.svelte";

	let { children } = $props();
	let audioTag = $state<HTMLAudioElement | null>(null);

	const musicHub = getContext<MusicHub>("musicHub");

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

	onMount(() =>
	{
		player.OverrideTag(audioTag!);
	});

	$effect(() =>
	{
		if (audioTag === null) return;
		if (!audioTagSetup) return;
		if (!musicHub.connected) return;

		musicHub.getPlayerState().then((state) =>
		{
			if (state.currentSongId)
			{
				player.PlaySongById(state.currentSongId);
			}
		});
	});

	let playerCollapsed = $state(true);
</script>

<div
	class={[
		"flex flex-col md:grid",
		playerCollapsed
			? "md:grid-cols-[auto_6rem]"
			: "md:grid-cols-[auto_6rem] lg:grid-cols-[auto_30rem]",
	]}
>
	<div class="flex-1 pb-20 md:pb-0">
		{#if audioTagSetup}
			{@render children()}
		{:else}
			<ClickTrap />
		{/if}
	</div>
	<audio
		src="/_.opus"
		bind:this={audioTag}
		bind:volume={aVolume}
		bind:paused={aPaused}
		bind:currentTime={aCurrentTime}
		bind:duration={aDuration}
	>
	</audio>
	{#if audioTagSetup}
		<!-- Desktop player (hidden on mobile) -->
		<div class="hidden md:block">
			<MusicPlayer bind:collapsed={playerCollapsed} />
		</div>
		<!-- Mobile player (shown only on mobile) -->
		<div class="fixed bottom-0 left-0 right-0 z-50 md:hidden">
			<MobilePlayer />
		</div>
	{/if}
</div>
