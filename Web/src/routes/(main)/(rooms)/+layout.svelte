<script lang="ts">
    import { onDestroy, setContext } from "svelte";
    import { MusicRoomHub } from "~/lib/MusicRoomHub.svelte";
    import SyncData from "./sync-data.svelte";
    import { goto } from "$app/navigation";
    import { useCurrentUser } from "../queries";
    import { page } from "$app/stores";

    let { children } = $props();

    const userQuery = useCurrentUser();
    const roomId = $derived($page.params.roomId ?? "default");
    const username = $derived($userQuery.data?.userName ?? $userQuery.data?.name ?? "User");

    const tyme_sync = new MusicRoomHub();
    let sync_promise = $state<Promise<any> | null>(null);

    $effect(() => {
        if ($userQuery.isSuccess && roomId && username) {
            sync_promise = tyme_sync
                .connect(roomId, username)
                .then(() => tyme_sync.synchronize());
        }
    });

    setContext("musicHub", tyme_sync);

    onDestroy(() => tyme_sync.disconnect());

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
