<script lang="ts">
import MusicPlayer from "~/components/music-player/index.svelte";
import * as Menubar from "$lib/components/ui/menubar/index.js";
import {page} from "$app/state";
import YtQueue from "./yt-queue.svelte";
import YtCookiesDialog from "./yt-cookies-dialog.svelte";
import SyncDialog from "~/components/room/sync-dialog.svelte";

let { children } = $props();

const roomId = page.params.roomId;
let syncDialogOpen = $state(false);

let playerCollapsed = $state(true);
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
			<YtCookiesDialog />
		</div>
	</div>
	<MusicPlayer bind:collapsed={playerCollapsed} />
</div>

<SyncDialog bind:open={syncDialogOpen} />

