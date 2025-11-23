<script lang="ts">
    import { onDestroy, setContext } from "svelte";
    import { MusicHub } from "~/lib/MusicHub.svelte";
    import SyncData from "./sync-data.svelte";
    import { useCurrentUser } from "./queries";
    import { goto } from "$app/navigation";

    let { children } = $props();

    const userQuery = useCurrentUser();

    const tyme_sync = new MusicHub();
    const sync_promise = tyme_sync
        .connect()
        .then(() => tyme_sync.synchronize());

    setContext("musicHub", tyme_sync);

    onDestroy(() => tyme_sync.disconnect());

    $inspect($userQuery.error);
    $effect(() => {
        if (
            $userQuery.error?.status === 401 ||
            $userQuery.error?.status === 403
        ) {
            goto("/login");
        }
    });
</script>

<div>
    {#if $userQuery.isPending}
        <div
            class="fixed top-0 w-screen bg-blue-600/50 text-white text-xs text-center"
        >
            Loading user...
        </div>
    {:else if $userQuery.isSuccess}
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
    {:else if $userQuery.isError}
        <div
            class="fixed top-0 w-screen bg-red-600/50 text-white text-xs text-center"
        >
            Error loading user: {$userQuery.error.detail}
        </div>
    {/if}
</div>
