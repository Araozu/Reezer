<script lang="ts">
	import MusicPlayer from "../../components/music-player/index.svelte";
	import { CreatePlayerContext } from "../../player/index.svelte";

	let { children } = $props();
	CreatePlayerContext();
</script>

<div class="grid grid-cols-[auto_30rem]">
	<div>
		{@render children()}
	</div>
	<MusicPlayer />
</div>
