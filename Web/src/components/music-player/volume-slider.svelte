<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
	import { GetCurrentPlayer } from "../../player/index.svelte";
	import { sliderToVolume, volumeToSlider } from "./volume-constants";

	let { collapsed }: { collapsed: boolean } = $props();

	let player = GetCurrentPlayer();
	let rawVolume = player.volume;

	// Map between the slider values & the actual
	// volume level: Math.pow(volume / 100, 2);
	let sliderVolume = $derived(volumeToSlider($rawVolume));

	// Given a number from 0-100, it sets the volume of the audio
	// to a mapped value of it
	function UpdateRawVolume(sliderNumber: number)
	{
		let value = sliderToVolume[Math.round(sliderNumber)] ?? 0;

		player.SetVolume(value);
	}
</script>

<Slider
	type="single"
	orientation={collapsed ? "vertical" : "horizontal"}
	value={sliderVolume}
	min={0}
	max={100}
	step={1}
	onValueChange={UpdateRawVolume}
/>
