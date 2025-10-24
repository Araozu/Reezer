<script lang="ts">
    import { TimeSynchronizer } from "$lib/sync";

    let { children } = $props();

    const tyme_sync = new TimeSynchronizer();
    const sync_promise = tyme_sync.connect()
    	.then(() => tyme_sync.synchronize());
</script>

<div>
    {#await sync_promise}
        <div class="fixed top-0 w-screen bg-orange-600/50 text-white text-xs text-center">Syncronizing...</div>
    {:then _}
        <div>{JSON.stringify(_)}</div>
    {/await}

    {@render children()}
</div>

