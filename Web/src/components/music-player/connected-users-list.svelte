<script lang="ts">
	import { GetSyncPlayerManagerContext } from "~/context/music-player-context";
	import { Users, User } from "lucide-svelte";

	const playerManager = GetSyncPlayerManagerContext();
	const connectedUsers = $derived(playerManager.connectedUsers);
</script>

<div class="flex flex-col gap-3 p-4">
	<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
		<Users class="h-4 w-4" />
		<span>Connected ({connectedUsers.length})</span>
	</div>

	{#if connectedUsers.length > 0}
		<div class="flex flex-col gap-2">
			{#each connectedUsers as user}
				<div
					class="flex items-center gap-2 p-2 rounded-lg bg-glass-bg hover:bg-glass-bg-hover border border-glass-border transition-colors duration-200"
				>
					<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
						<User class="h-4 w-4 text-primary" />
					</div>
					<span class="text-sm font-medium truncate">{user.userName}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-xs text-muted-foreground italic text-center py-4">
			No one else is here yet
		</div>
	{/if}
</div>
