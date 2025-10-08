<script lang="ts">
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import { Button } from "$lib/components/ui/button";
	import { backend_url } from "../../env";

	const player = GetCurrentPlayer();
	const isPlaying = $derived(!player.paused);

	$effect(() => {
		if (!player.ready) return;

		const src =
			backend_url +
			"/api/music_data/NewJeans/NewJeans 2nd EP 'Get Up'/01 - New Jeans.opus";
		player.SetSong(src);
	});

	function Play() {
		player.TogglePlayPause();
	}
</script>

<p>hello!</p>
<p>(jellyous!)</p>

<div>
	<Button onclick={Play}>
		{#if isPlaying}
			Pause
		{:else}
			Play! (set song?)
		{/if}
	</Button>
</div>
