<script lang="ts">
    import { onDestroy } from "svelte";
    import { MusicHub } from "~/lib/sync";

    let { children } = $props();

    const tyme_sync = new MusicHub();
    const sync_promise = tyme_sync.connect()
    	.then(() => tyme_sync.synchronize());

    onDestroy(() =>
    {
    	try
    	{
    		tyme_sync.disconnect();
    	}
    	finally
    	{
    		//
    	}
    });
</script>

<div>
    {#await sync_promise}
        <div class="fixed top-0 w-screen bg-orange-600/50 text-white text-xs text-center">Syncronizing...</div>
    {:then _}
        <div>{JSON.stringify(_)}!</div>
    {/await}

    {@render children()}
</div>

