<script lang="ts">
	import { CreatePlayerContext } from "../../player2/index.svelte";

	let { children } = $props();
	CreatePlayerContext();
</script>

{@render children()}
