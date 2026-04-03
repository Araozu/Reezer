<script lang="ts">
	import { cn } from "$lib/utils";
	import RoomChat from "./room-chat.svelte";
	import ConnectedUsersList from "./connected-users-list.svelte";
	import { Users, MessageCircle } from "lucide-svelte";
	import { GetSyncRoomManagerContext } from "~/context/music-player-context";

	const playerManager = GetSyncRoomManagerContext();

	const status = $derived(playerManager.status);
	const connectedUsers = $derived(playerManager.connectedUsers);

	let activeTab = $state<"chat" | "users">("chat");
</script>

<div
	class="bg-glass-bg backdrop-blur-xl border-glass-border rounded-2xl flex h-full w-full flex-col overflow-hidden border shadow-[0_4px_24px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]"
>
	<!-- Header -->
	<div class="p-4 border-glass-border border-b">
		<div class="mb-3 flex items-center justify-between">
			<h3 class="font-semibold text-lg">Room</h3>
			<div class="gap-2 flex items-center">
				<div
					class={cn("w-2 h-2 rounded-full", {
						"bg-green-500": status === "connected",
						"bg-yellow-500":
							status === "connecting" || status === "reconnecting" || status === "clock_sync",
						"bg-red-500": status === "disconnected",
					})}
				></div>
				<span class="text-xs text-muted-foreground capitalize">{status.replace("_", " ")}</span>
			</div>
		</div>

		<!-- Tabs -->
		<div class="gap-1 bg-black/10 p-1 rounded-lg flex">
			<button
				onclick={() => (activeTab = "chat")}
				class={cn(
					"gap-2 py-2 px-3 rounded-md text-sm font-medium flex flex-1 items-center justify-center transition-all duration-200",
					"touch-action-manipulation [-webkit-tap-highlight-color:transparent]",
					activeTab === "chat"
						? "bg-glass-bg text-primary shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
				data-slot="button"
			>
				<MessageCircle class="h-4 w-4" />
				<span>Chat</span>
			</button>
			<button
				onclick={() => (activeTab = "users")}
				class={cn(
					"gap-2 py-2 px-3 rounded-md text-sm font-medium flex flex-1 items-center justify-center transition-all duration-200",
					"touch-action-manipulation [-webkit-tap-highlight-color:transparent]",
					activeTab === "users"
						? "bg-glass-bg text-primary shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
				data-slot="button"
			>
				<Users class="h-4 w-4" />
				<span>{connectedUsers.length}</span>
			</button>
		</div>
	</div>

	<!-- Content -->
	{#if activeTab === "chat"}
		<RoomChat />
	{:else}
		<div class="min-h-0 flex-1 overflow-y-auto">
			<ConnectedUsersList />
		</div>
	{/if}
</div>
