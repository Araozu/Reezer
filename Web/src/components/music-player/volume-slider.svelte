<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
	import { sliderToVolume, volumeToSlider } from "./volume-constants";
	import { GetPlayerContext } from "~/player2/context/player-store";

	let { collapsed }: { collapsed: boolean } = $props();

	let player = GetPlayerContext();
	let rawVolume = player.volume;

	// Map between the slider values & the actual
	// volume level: Math.pow(volume / 100, 2);
	let sliderVolume = $derived(volumeToSlider(rawVolume));

	// Given a number from 0-100, it sets the volume of the audio
	// to a mapped value of it
	function UpdateRawVolume(sliderNumber: number)
	{
		let value = sliderToVolume[Math.round(sliderNumber)] ?? 0;

		player.volume = value;
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
