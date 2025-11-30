<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
    import { onMount } from "svelte";
	import { GetPlayerContext } from "~/player2/context/player-store";

	let player = GetPlayerContext();

	let duration = $state(player.duration ?? 0);
	let currentTime = $state(0);

	onMount(() =>
	{
		player.OnDurationChange((newDuration) =>
		{
			duration = newDuration;
		});

		player.OnPositionUpdate((newTime) =>
		{
			currentTime = newTime;
		});
	});

	let positionValue = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	function HandleSliderClick(event: MouseEvent)
	{
		const progressBar = event.currentTarget as HTMLElement;
		const rect = progressBar.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const percentage = clickX / rect.width;
		const seekTime = percentage * duration;

		player.Seek(seekTime);
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
