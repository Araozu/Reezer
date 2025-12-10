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
import {page} from "$app/state";
import YtQueue from "./yt-queue.svelte";
import SyncDialog from "~/components/room/sync-dialog.svelte";

let { children } = $props();

const roomId = page.params.roomId;
let syncDialogOpen = $state(false);

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
	<div>
		{#if audioTagSetup}
			<div class="fixed top-0 z-10 w-full">
				<Menubar.Root>
					<a href={`/${roomId}/`} class="font-display font-bold px-6 py-2">Reezer</a>
					<Menubar.Menu>
						<a href={`/${roomId}/albums`} class="px-4 py-2 rounded-md hover:bg-glass-bg-hover transition-colors">
							Albums
						</a>
						<a href={`/${roomId}/artists`} class="px-4 py-2 rounded-md hover:bg-glass-bg-hover transition-colors">
							Artists
						</a>
						<a href={`/${roomId}/yt`} class="px-4 py-2 rounded-md hover:bg-glass-bg-hover transition-colors">
							YouTube
						</a>
						<button
							class="px-4 py-2 rounded-md hover:bg-glass-bg-hover transition-colors"
							onclick={() => (syncDialogOpen = true)}
						>
							Sync
						</button>
					</Menubar.Menu>
				</Menubar.Root>
			</div>
			<div class="pt-8">
				{@render children()}
				<YtQueue />
			</div>
		{:else}
			<ClickTrap />
		{/if}
	</div>
	{#if audioTagSetup}
		<MusicPlayer bind:collapsed={playerCollapsed} />
	{/if}
</div>

<SyncDialog bind:open={syncDialogOpen} />

