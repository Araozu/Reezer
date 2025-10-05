<script lang="ts">
	import { onMount } from "svelte";
	import { GetCurrentPlayer } from "../../player2/index.svelte";

	const player = GetCurrentPlayer();

	onMount(() => {
		console.log("Current Player:", player);
		player.DoSomething();
	});
</script>

<p>hello!</p>
<p>(jellyous!)</p>
