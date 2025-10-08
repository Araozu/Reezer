<script lang="ts">
	import { GetCurrentPlayer } from "../../player/index.svelte";

	let audioRef: HTMLAudioElement | null = $state(null);

	const player = GetCurrentPlayer();

	$effect(() => {
		if (audioRef) {
			player.InitializeAudioTag(audioRef);

			const onclick = () => {
				document.removeEventListener("click", onclick);
				player.SetupOnClick();
			};
			document.addEventListener("click", onclick);
		}
	});
</script>

<div>My music player</div>

<audio bind:this={audioRef} bind:paused={player.paused}></audio>
