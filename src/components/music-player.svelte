<script lang="ts">
	import Play from "lucide-svelte/icons/play";
	import Pause from "lucide-svelte/icons/pause";
	import LoaderCircle from "lucide-svelte/icons/loader-circle";
	import SkipBack from "lucide-svelte/icons/skip-back";
	import SkipForward from "lucide-svelte/icons/skip-forward";
	import Volume2 from "lucide-svelte/icons/volume-2";
	import Volume1 from "lucide-svelte/icons/volume-1";
	import Volume0 from "lucide-svelte/icons/volume";
	import VolumeOff from "lucide-svelte/icons/volume-off";
	import ListMusic from "lucide-svelte/icons/list-music";
	import AudioLines from "lucide-svelte/icons/audio-lines";
	import X from "lucide-svelte/icons/x";

	let imgUrl = $state({ data: "#" });
	let showQueue = $state(false);
	function setShowQueue(v: boolean) {
		showQueue = v;
	}
</script>

<div class="py-3 px-2 overflow-hidden sticky top-9">
	<div
		class="w-full h-[calc(100vh-4rem)] rounded relative overflow-hidden"
		style="box-shadow: 0 -1px 5px 1px hsl(240, 4%, 46%)"
	>
		<div
			class="absolute top-0 left-0 w-full h-full -z-2"
			style="background-color: black"
		></div>
		<div
			class={"absolute top-0 left-0 w-full h-screen -z-1 bg-cover bg-center opacity-75"}
			style={`
				background-image: \`url("${imgUrl.data ?? ""}")\`;
				filter: blur(40px);
			`}
		></div>

		<div
			class="absolute top-0 right-0 z-50 flex gap-2 justify-end px-2 py-1"
		>
			<button
				class={`rounded transition-colors ${showQueue ? "bg-zinc-400" : ""} bg-opacity-40 hover:bg-zinc-400 hover:bg-opacity-40`}
				onclick={() => setShowQueue(true)}
			>
				<ListMusic
					class="text-white opacity-75 p-1"
					size={32}
				/>
			</button>
			<button
				class={`rounded transition-colors ${!showQueue ? "bg-zinc-400" : ""} bg-opacity-40 hover:bg-zinc-400  hover:bg-opacity-40`}
				onclick={() => setShowQueue(false)}
			>
				<AudioLines
					class="text-white opacity-75 p-1"
					size={32}
				/>
			</button>
		</div>
	</div>
</div>
