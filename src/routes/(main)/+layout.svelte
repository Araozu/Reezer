<script lang="ts">
	import { CreatePlayerContext } from "../../player/index.svelte";

	let { children } = $props();
	CreatePlayerContext();
</script>

{@render children()}
