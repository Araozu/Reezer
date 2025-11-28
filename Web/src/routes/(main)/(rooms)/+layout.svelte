<script lang="ts">
    import * as SignalR from "@microsoft/signalr";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { useCurrentUser } from "../queries";

    let { children } = $props();

    const userQuery = useCurrentUser();

    $effect(() =>
    {
    	if (
    		$userQuery.error?.status === 401 ||
            $userQuery.error?.status === 403
    	)
    	{
    		goto("/");
    	}
    });

    onMount(async() =>
    {
    	const connection = new SignalR.HubConnectionBuilder()
    		.withUrl(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/hub/MusicRoom`)
    		.withAutomaticReconnect()
    		.build();

    	connection.on("MessageReceived", (user, message) =>
    	{
    		console.log("Received from SignalR:");
    		console.log(`${JSON.stringify(user)}: ${message}`);
    	});

    	await connection.start();
    	connection.send("Hello", "Pablito");
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
        <div
            class="fixed top-0 w-screen bg-orange-600/50 text-white text-xs text-center"
        >
            Syncronizing...
        </div>

        {@render children()}
    {:else if $userQuery.isError}
        <div
            class="fixed top-0 w-screen bg-red-600/50 text-white text-xs text-center"
        >
            Error loading user: {$userQuery.error.detail}
        </div>
    {/if}
</div>
