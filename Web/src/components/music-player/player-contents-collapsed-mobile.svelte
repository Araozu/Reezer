<script lang="ts">
	import { GetPlayerContext } from "~/player2/context/player-store";
	import type { ISong } from "../../providers";
	import { Play, Pause, LoaderCircle } from "lucide-svelte";

	let {
		coverUrl = $bindable(),
		song = $bindable(),
		expand,
	}: {
		coverUrl: string;
		song: ISong | undefined;
		expand: () => void;
	} = $props();

	let player = GetPlayerContext();

	let isPaused = player.isPaused;
	let isBuffering = $derived(player.isBuffering);
</script>

<div class="grid grid-cols-[3rem_auto_3rem] items-center gap-4">
	<div>
		<img
			class={["shadow-lg aspect-square object-cover", "rounded-xl"]}
			src={coverUrl}
			alt="Album portrait"
		/>
	</div>
	<button class="inline-block w-full text-left" onclick={expand}>
		<p class="font-medium truncate">{song?.name ?? "-"}</p>
		<p class="text-sm text-muted-foreground truncate">{song?.artist ?? "-"}</p>
	</button>
	<div>
		<button
			class="hover:bg-glass-bg-hover rounded-full cursor-pointer transition-all duration-300 active:scale-95"
			onclick={() => player.TogglePlayPause()}
		>
			{#if isBuffering}
				<LoaderCircle
					class="m-2 animate-spin"
					size={32}
				/>
			{:else if $isPaused}
				<Play class="m-2" size={32} />
			{:else}
				<Pause class="m-2" size={32} />
			{/if}
		</button>
	</div>
</div>
