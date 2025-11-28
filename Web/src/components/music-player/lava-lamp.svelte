<script lang="ts">
	let { colors, isDark }: { colors: string[]; isDark: boolean } = $props();

	const bgColor = $derived(isDark ? "#ffffff" : "#000000");

	const blobs = [
		{ id: 0, size: 180, duration: 25 },
		{ id: 1, size: 150, duration: 20 },
		{ id: 2, size: 200, duration: 30 },
		{ id: 3, size: 120, duration: 22 },
		{ id: 4, size: 160, duration: 28 },
		{ id: 5, size: 140, duration: 18 },
	];
</script>

<div
	class="absolute inset-0 overflow-hidden rounded-2xl"
	style:background-color={bgColor}
>
	{#each blobs as blob}
		{@const colorIndex = blob.id % colors.length}
		{@const delayOffset = blob.id * 3}
		<div
			class="absolute rounded-full blur-3xl opacity-60"
			style:width="{blob.size}px"
			style:height="{blob.size}px"
			style:background-color={colors[colorIndex]}
			style:animation="lavaFloat{blob.id % 3} {blob.duration}s ease-in-out infinite"
			style:animation-delay="-{delayOffset}s"
		></div>
	{/each}
</div>

<style>
	@keyframes lavaFloat0 {
		0%, 100% {
			transform: translate(10%, 10%);
		}
		25% {
			transform: translate(60%, 30%);
		}
		50% {
			transform: translate(40%, 70%);
		}
		75% {
			transform: translate(20%, 50%);
		}
	}

	@keyframes lavaFloat1 {
		0%, 100% {
			transform: translate(70%, 20%);
		}
		25% {
			transform: translate(30%, 60%);
		}
		50% {
			transform: translate(80%, 80%);
		}
		75% {
			transform: translate(50%, 30%);
		}
	}

	@keyframes lavaFloat2 {
		0%, 100% {
			transform: translate(40%, 80%);
		}
		25% {
			transform: translate(10%, 40%);
		}
		50% {
			transform: translate(60%, 10%);
		}
		75% {
			transform: translate(80%, 50%);
		}
	}
</style>
