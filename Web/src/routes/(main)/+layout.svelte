<script lang="ts">
    import { onDestroy, setContext } from "svelte";
    import { MusicHub } from "~/lib/MusicHub.svelte";
    import SyncData from "./sync-data.svelte";

    let { children } = $props();

    const tyme_sync = new MusicHub();
    const sync_promise = tyme_sync
    	.connect()
    	.then(() => tyme_sync.synchronize());

    setContext("musicHub", tyme_sync);

    onDestroy(() => tyme_sync.disconnect());
</script>

<div>
    {#await sync_promise}
        <div
            class="fixed top-0 w-screen bg-orange-600/50 text-white text-xs text-center"
        >
            Syncronizing...
        </div>
    {:then syncResult}
        <div class="fixed top-0 w-screen text-xs">
            <SyncData {syncResult} />
        </div>
    {/await}

    {@render children()}
</div>
