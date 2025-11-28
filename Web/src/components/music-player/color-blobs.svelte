<script lang="ts">
	import { onMount } from "svelte";

	let { colors }: { colors: string[] } = $props();

	interface Blob {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
	}

	const BLOB_SIZE_MIN = 180;
	const BLOB_SIZE_MAX = 280;
	const SPEED_MIN = 0.15;
	const SPEED_MAX = 0.35;

	let blobs = $state<Blob[]>([]);
	let containerRef = $state<HTMLDivElement | null>(null);
	let animationId: number;

	function randomInRange(min: number, max: number): number
	{
		return Math.random() * (max - min) + min;
	}

	function initBlobs()
	{
		blobs = colors.map(() => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			vx: randomInRange(SPEED_MIN, SPEED_MAX) * (Math.random() > 0.5 ? 1 : -1),
			vy: randomInRange(SPEED_MIN, SPEED_MAX) * (Math.random() > 0.5 ? 1 : -1),
			size: randomInRange(BLOB_SIZE_MIN, BLOB_SIZE_MAX),
		}));
	}

	function animate()
	{
		blobs = blobs.map((blob) =>
		{
			let { x, y, vx, vy } = blob;

			x += vx;
			y += vy;

			if (x < -20) x = 120;
			if (x > 120) x = -20;
			if (y < -20) y = 120;
			if (y > 120) y = -20;

			return { ...blob, x, y };
		});

		animationId = requestAnimationFrame(animate);
	}

	onMount(() =>
	{
		initBlobs();
		animate();

		return () =>
		{
			if (animationId)
			{
				cancelAnimationFrame(animationId);
			}
		};
	});

	$effect(() =>
	{
		if (colors.length > 0 && blobs.length !== colors.length)
		{
			initBlobs();
		}
	});
</script>

<div
	bind:this={containerRef}
	class="absolute inset-0 overflow-hidden pointer-events-none -z-10"
>
	{#each blobs as blob, i}
		<div
			class="absolute rounded-full blur-3xl opacity-50 transition-colors duration-1000"
			style="
				left: {blob.x}%;
				top: {blob.y}%;
				width: {blob.size}px;
				height: {blob.size}px;
				background-color: {colors[i] ?? "#888"};
				transform: translate(-50%, -50%);
			"
		></div>
	{/each}
</div>
