<script lang="ts">
	import { GetSyncPlayerManagerContext } from "~/context/music-player-context";
	import { cn } from "$lib/utils";
	import RoomChat from "./room-chat.svelte";
	import ConnectedUsersList from "./connected-users-list.svelte";
	import { Users, MessageCircle } from "lucide-svelte";

	const playerManager = GetSyncPlayerManagerContext();

	const status = $derived(playerManager.status);
	const connectedUsers = $derived(playerManager.connectedUsers);

	let activeTab = $state<"chat" | "users">("chat");
</script>

<div class="flex flex-col h-full w-full bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden shadow-[0_4px_24px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]">
	<!-- Header -->
	<div class="p-4 border-b border-glass-border">
		<div class="flex items-center justify-between mb-3">
			<h3 class="font-semibold text-lg">Room</h3>
			<div class="flex items-center gap-2">
				<div class={cn("w-2 h-2 rounded-full", {
					"bg-green-500": status === "connected",
					"bg-yellow-500": status === "connecting" || status === "reconnecting" || status === "clock_sync",
					"bg-red-500": status === "disconnected",
				})}></div>
				<span class="text-xs text-muted-foreground capitalize">{status.replace("_", " ")}</span>
			</div>
		</div>

		<!-- Tabs -->
		<div class="flex gap-1 bg-black/10 p-1 rounded-lg">
			<button
				onclick={() => activeTab = "chat"}
				class={cn(
					"flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200",
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
				onclick={() => activeTab = "users"}
				class={cn(
					"flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200",
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
		<div class="flex-1 overflow-y-auto min-h-0">
			<ConnectedUsersList />
		</div>
	{/if}
</div>
