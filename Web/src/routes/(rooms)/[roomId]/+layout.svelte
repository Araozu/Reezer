<script lang="ts">
import MusicPlayer from "~/components/music-player/index.svelte";
import { SetPlayerContext, SetQueueContext } from "~/context/music-player-context";
import * as Menubar from "$lib/components/ui/menubar/index.js";
import {page} from "$app/state";
import YtQueue from "./yt-queue.svelte";
import SyncDialog from "~/components/room/sync-dialog.svelte";
import type { IAudioBackend } from "~/audio-engine/interfaces/IAudioBackend";
import { WebAudioBackend } from "~/audio-engine/backends/WebAudioBackend";
import { UrlAudioSource } from "~/audio-engine/audio-sources/UrlAudioSource";
import type { IQueue } from "~/audio-engine/interfaces/IQueue";
import { GeneralPurposeQueue } from "~/audio-engine/queues/GeneralPurposeQueue";
import { BrowserMediaSession } from "~/audio-engine/backends/BrowserMediaSession";

let { children } = $props();

const roomId = page.params.roomId;
let syncDialogOpen = $state(false);

// Setup music player
// FIXME: Remove context for audio backend, should use the IQueue instead
const audioBackend: IAudioBackend = new WebAudioBackend(new UrlAudioSource());
SetPlayerContext(audioBackend);

const queue: IQueue = new GeneralPurposeQueue(audioBackend);
SetQueueContext(queue);

const mediaSession = new BrowserMediaSession(queue, audioBackend);
mediaSession.Init();

let playerCollapsed = $state(true);

$effect(() =>
{
	return () =>
	{
		console.log("[roomId layout] Cleanup called - cleaning up audio components");
		mediaSession.Deinit();
		queue.Deinit();
		audioBackend.Deinit();
	};
});
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
		<div class="fixed top-0 z-20 w-full">
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
	</div>
	<MusicPlayer bind:collapsed={playerCollapsed} />
</div>

<SyncDialog bind:open={syncDialogOpen} />

