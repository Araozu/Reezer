<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
	import { GetSvelteManagerContext } from "~/context/music-player-context";

	const svManager = GetSvelteManagerContext();

	let duration = $derived(svManager.duration ?? 0);
	let currentTime = $derived(svManager.position);

	let positionValue = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	function FormatTime(milliseconds: number): string
	{
		const seconds = Math.floor(milliseconds / 1000);
		if (!isFinite(seconds) || seconds < 0) return "0:00";

		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	function HandleSliderClick(event: MouseEvent)
	{
		const progressBar = event.currentTarget as HTMLElement;
		const rect = progressBar.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const percentage = clickX / rect.width;
		const seekTime = percentage * duration;

		svManager.imanager.Seek(seekTime);
	}

	function HandleValueCommit(newValue: number[] | number)
	{
		let percentage = 0;
		if (Array.isArray(newValue))
		{
			if (newValue.length > 0) percentage = newValue[0]!;
		}
		else
		{
			percentage = newValue;
		}

		const seekTime = (percentage / 100) * duration;
		svManager.imanager.Seek(seekTime);
	}
</script>

<div class="w-full">
	<Slider
		type="single"
		orientation="horizontal"
		value={positionValue}
		min={0}
		max={100}
		step={0.1}
		onclick={HandleSliderClick}
		onValueCommit={HandleValueCommit}
	/>
	<div class="mt-1 text-xs text-muted-foreground flex justify-between">
		<span>{FormatTime(currentTime)}</span>
		<span>{FormatTime(duration)}</span>
	</div>
</div>
