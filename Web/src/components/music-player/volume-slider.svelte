<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
	import { sliderToVolume, volumeToSlider } from "./volume-constants";
	import { GetPlayerContext } from "~/player2/context/player-store";

	let { collapsed }: { collapsed: boolean } = $props();

	let player = GetPlayerContext();
	let rawVolume = $state(player.volume);

	let sliderVolume = $derived(volumeToSlider(rawVolume));

	function UpdateRawVolume(sliderNumber: number)
	{
		let value = sliderToVolume[Math.round(sliderNumber)] ?? 0;
		rawVolume = value;
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
