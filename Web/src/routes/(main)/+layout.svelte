<script lang="ts">
	import MusicPlayer from "../../components/music-player/index.svelte";
	import { CreatePlayerContext } from "../../player/index.svelte";

	let { children } = $props();
	CreatePlayerContext();

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
		{@render children()}
	</div>
	<MusicPlayer bind:collapsed={playerCollapsed} />
</div>
