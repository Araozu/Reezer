<script lang="ts">
	import { onMount } from "svelte";

	let { colors, weights = [] }: { colors: string[]; weights?: number[] } = $props();

	interface Blob {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
	}

	const BLOB_SIZE_MIN = 200;
	const BLOB_SIZE_MAX = 500;
	const SPEED_MIN = 0.05;
	const SPEED_MAX = 0.25;

	let blobs = $state<Blob[]>([]);
	let containerRef = $state<HTMLDivElement | null>(null);
	let animationId: number;

	function randomInRange(min: number, max: number): number
	{
		return (Math.random() * (max - min)) + min;
	}

	function initBlobs()
	{
		blobs = colors.map((_, i) =>
		{
			const weight = weights[i] ?? 0.5;
			const sizeRange = BLOB_SIZE_MAX - BLOB_SIZE_MIN;
			const baseSize = BLOB_SIZE_MIN + (sizeRange * weight);
			const sizeVariation = randomInRange(-50, 50);

			return {
				x: Math.random() * 100,
				y: Math.random() * 100,
				vx: randomInRange(SPEED_MIN, SPEED_MAX) * (Math.random() > 0.5 ? 1 : -1),
				vy: randomInRange(SPEED_MIN, SPEED_MAX) * (Math.random() > 0.5 ? 1 : -1),
				size: Math.max(BLOB_SIZE_MIN, baseSize + sizeVariation),
			};
		});
	}

	function animate()
	{
		blobs = blobs.map((blob) =>
		{
			let { x, y, vx, vy } = blob;

			x += vx;
			y += vy;

			if (x < -50) x = 150;
			if (x > 150) x = -50;
			if (y < -50) y = 150;
			if (y > 150) y = -50;

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
	class="absolute inset-0 overflow-hidden pointer-events-none -z-10 rounded-2xl"
>
	{#each blobs as blob, i (i)}
		<div
			class="absolute rounded-full blur-3xl opacity-75 transition-colors duration-1000"
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
