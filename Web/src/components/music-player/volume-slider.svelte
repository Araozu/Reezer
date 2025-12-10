<script lang="ts">
import { Slider } from "$lib/components/ui/slider";
import { GetPlayerContext } from "~/context/music-player-context";
import { sliderToVolume, volumeToSlider } from "./volume-constants";

let { collapsed }: { collapsed: boolean } = $props();

let player = GetPlayerContext();
let rawVolume = $state(player.volume);

let sliderVolume = $derived(volumeToSlider(rawVolume));

const VOLUME_STORAGE_KEY = "reezer-volume";

function UpdateRawVolume(sliderNumber: number)
{
	let value = sliderToVolume[Math.round(sliderNumber)] ?? 0;
	rawVolume = value;
	player.volume = value;
	localStorage.setItem(VOLUME_STORAGE_KEY, String(value));
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
