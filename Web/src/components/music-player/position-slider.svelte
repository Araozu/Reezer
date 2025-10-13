<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
	import { GetCurrentPlayer } from "../../player/index.svelte";

	let player = GetCurrentPlayer();
	let duration = player.duration;
	let currentTime = player.currentTime;

	let positionValue = $derived(
		$duration > 0 ? ($currentTime / $duration) * 100 : 0,
	);

	function HandleSliderClick(event: MouseEvent) {
		const progressBar = event.currentTarget as HTMLElement;
		const rect = progressBar.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const percentage = clickX / rect.width;
		const seekTime = percentage * $duration;

		player.SetCurrentTime(seekTime);
	}
</script>

<Slider
	type="single"
	orientation="horizontal"
	value={positionValue}
	min={0}
	max={100}
	step={0.1}
	onclick={HandleSliderClick}
/>
