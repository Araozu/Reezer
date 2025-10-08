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
	let imgOpacity = $state(0);
	let currentSong = {
		name: "",
		album: "",
		artist: "",
		album_id: "",
		artist_id: "",
	};
	let roomName = "";
	let songBy = "foo";

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
		<div
			class="absolute top-0 left-0 w-[30rem] overflow-hidden h-full grid grid-rows-[auto_6rem_2rem]"
		>
			<div class="relative min-w-full">
				<img
					alt=""
					class={`rounded w-full inline-block transition-opacity ${imgOpacity}`}
					src={imgUrl.data}
					onload={() => {}}
				/>
			</div>

			<div
				class="px-4 transition-colors text-white w-[29rem]"
			>
				<p
					class="font-display font-bold text-3xl mb-2 whitespace-nowrap overflow-hidden text-ellipsis"
					title="hello"
				>
					{currentSong?.name ?? "-"}&nbsp;
				</p>
				<p
					class="opacity-90 my-1 font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
					title={currentSong?.album ?? ""}
				>
					{#if !!currentSong?.album_id && !!currentSong?.album}
						<a
							href={`/collab/${roomName}/albums/${currentSong?.album_id}`}
							class="hover:underline"
							title={currentSong?.album}
						>
							{currentSong?.album}
						</a>
					{:else if !currentSong?.album_id || !currentSong?.album}
						{currentSong?.album ?? "-"}
					{/if}
				</p>
				<p
					class="text-sm opacity-75 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
					title={currentSong?.artist ?? ""}
				>
					{#if !!currentSong?.artist_id && !!currentSong?.artist}
						<a
							href={`/collab/${roomName}/artists/${currentSong?.artist_id}`}
							class="hover:underline"
							title={currentSong?.artist}
						>
							{currentSong?.artist}
						</a>&nbsp;
					{:else if !currentSong?.artist_id || !currentSong?.artist}
						{currentSong?.artist ??
							"-"}&nbsp;
					{:else if !!songBy}
						<span
							class="opacity-50 select-none"
						>
							· by {songBy}
						</span>
					{/if}
				</p>
			</div>
		</div>
	</div>
</div>
