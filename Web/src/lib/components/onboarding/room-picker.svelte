<script lang="ts">
import * as Card from "$lib/components/ui/card";
import Button from "$lib/components/ui/button/button.svelte";
import { Plus, Users } from "lucide-svelte";
import { useCreateRoom, useRooms } from "./queries";

const rooms = useRooms();
const createRoom = useCreateRoom();

const handleCreateRoom = () =>
{
	$createRoom.mutate();
};
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>Join a room</Card.Title>
		<Card.Description
		>Select a room from the list or create a new one</Card.Description
		>
	</Card.Header>
	<Card.Content class="space-y-4">
		<Button
			onclick={handleCreateRoom}
			disabled={$createRoom.isPending}
			class="w-full"
			variant="default"
		>
			<Plus class="mr-2 size-4" />
			{$createRoom.isPending
				? "Creating..."
				: "Create New Room"}
		</Button>

		{#if $rooms.isLoading}
			<div class="text-muted-foreground text-center py-8">
				Loading rooms...
			</div>
		{:else if $rooms.error}
			<div class="text-destructive text-center py-8">
				Failed to load rooms: {$rooms.error.detail}
			</div>
		{:else if $rooms.data && Array.isArray($rooms.data) && $rooms.data.length > 0}
			<div class="space-y-2">
				<p class="text-sm text-muted-foreground">
					Available rooms:
				</p>
				<div class="space-y-2">
					{#each $rooms.data as room (room.id)}
						<Button
							variant="outline"
							class="w-full justify-between"
							href="/{room.roomCode}"
						>
							<span
								class="font-mono font-semibold"
							>{room.roomCode}</span
							>
							<span
								class="text-muted-foreground flex items-center gap-1"
							>
								<Users
									class="size-4"
								/>
								{room.connectedUsers}
							</span>
						</Button>
					{/each}
				</div>
			</div>
		{:else}
			<div class="text-muted-foreground text-center py-8">
				No active rooms. Create one to get started!
			</div>
		{/if}
	</Card.Content>
</Card.Root>
