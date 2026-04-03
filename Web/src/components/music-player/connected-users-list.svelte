<script lang="ts">
	import { Users, User } from "lucide-svelte";
	import { GetSyncRoomManagerContext } from "~/context/music-player-context";

	const playerManager = GetSyncRoomManagerContext();
	const connectedUsers = $derived(playerManager.connectedUsers);
</script>

<div class="gap-3 p-4 flex flex-col">
	<div class="gap-2 text-sm font-medium text-muted-foreground flex items-center">
		<Users class="h-4 w-4" />
		<span>Connected ({connectedUsers.length})</span>
	</div>

	{#if connectedUsers.length > 0}
		<div class="gap-2 flex flex-col">
			{#each connectedUsers as user}
				<div
					class="gap-2 p-2 rounded-lg bg-glass-bg hover:bg-glass-bg-hover border-glass-border flex items-center border transition-colors duration-200"
				>
					<div class="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full">
						<User class="h-4 w-4 text-primary" />
					</div>
					<span class="text-sm font-medium truncate">{user.userName}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-xs text-muted-foreground py-4 text-center italic">No one else is here yet</div>
	{/if}
</div>
