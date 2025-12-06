<script lang="ts">
	import MusicPlayer from "~/components/music-player/index.svelte";
	import ClickTrap from "./click-trap.svelte";
	import { UrlAudioSource } from "~/player2/audio-sources/UrlAudioSource";
	import type { IAudioBackend } from "~/player2/interfaces/IAudioBackend";
	import { SetPlayerContext, SetQueueContext } from "~/player2/context/player-store";
	import { GeneralPurposeQueue } from "~/player2/queues/GeneralPurposeQueue";
	import type { IQueue } from "~/player2/interfaces/IQueue";
	import { WebAudioBackend } from "~/player2/backends/WebAudioBackend";
	import * as Menubar from "$lib/components/ui/menubar/index.js";

	let { children } = $props();

	// Setup music player
	// FIXME: Remove context for audio backend, should use the IQueue instead
	const audioBackend: IAudioBackend = new WebAudioBackend(new UrlAudioSource());
	SetPlayerContext(audioBackend);

	const queue: IQueue = new GeneralPurposeQueue(audioBackend);
	SetQueueContext(queue);

	let audioTagSetup = $state(false);
	let playerCollapsed = $state(true);

	audioBackend.OnReady(() => (audioTagSetup = true));
</script>

<div
	class={[
		"grid",
		playerCollapsed
			? "md:grid-cols-[auto_6rem]"
			: "md:grid-cols-[auto_30rem]",
	]}
>
	<div class="pb-12">
		{#if audioTagSetup}
			<div>
				<Menubar.Root>
					<Menubar.Menu>
						<Menubar.Trigger>File</Menubar.Trigger>
						<Menubar.Content>
							<Menubar.Item>
								New Tab
							<Menubar.Shortcut>⌘T</Menubar.Shortcut>
							</Menubar.Item>
							<Menubar.Item>New Window</Menubar.Item>
							<Menubar.Separator />
							<Menubar.Item>Share</Menubar.Item>
							<Menubar.Separator />
							<Menubar.Item>Print</Menubar.Item>
						</Menubar.Content>
					</Menubar.Menu>
				</Menubar.Root>
			</div>
			{@render children()}
		{:else}
			<ClickTrap />
		{/if}
	</div>
	{#if audioTagSetup}
		<MusicPlayer bind:collapsed={playerCollapsed} />
	{/if}
</div>
