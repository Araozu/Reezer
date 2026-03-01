<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Send } from "lucide-svelte";
	import { GetSyncRoomManagerContext } from "~/context/music-player-context";

	const playerManager = GetSyncRoomManagerContext();

	let newMessage = $state("");
	let chatContainer: HTMLDivElement;

	const messages = $derived(playerManager.messages);
	const status = $derived(playerManager.status);

	$effect(() =>
	{
		if (messages.length > 0)
		{
			scrollToBottom();
		}
	});

	function scrollToBottom()
	{
		if (chatContainer)
		{
			setTimeout(() =>
			{
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}, 0);
		}
	}

	async function sendMessage()
	{
		if (!newMessage.trim()) return;

		try
		{
			await playerManager.sendChatMessage(newMessage);
			newMessage = "";
		}
		catch (e)
		{
			console.error("Failed to send message", e);
		}
	}

	function handleKeydown(e: KeyboardEvent)
	{
		if (e.key === "Enter" && !e.shiftKey)
		{
			e.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="flex h-full w-full flex-col">
	<!-- Messages -->
	<div bind:this={chatContainer} class="p-4 space-y-4 min-h-0 flex-1 overflow-y-auto">
		{#each messages as msg}
			<div class="gap-1 animate-in fade-in slide-in-from-bottom-2 flex flex-col duration-300">
				<div class="gap-2 flex items-baseline">
					<span class="font-medium text-sm text-primary">{msg.userName}</span>
					<span class="text-xs text-muted-foreground opacity-70">
						{new Date(msg.timestamp).toLocaleTimeString()}
					</span>
				</div>
				<p class="text-sm bg-white/5 p-2 rounded-lg rounded-tl-none break-words">
					{msg.message}
				</p>
			</div>
		{/each}
		{#if messages.length === 0}
			<div class="text-muted-foreground text-sm flex h-full items-center justify-center italic">
				No messages yet. Say hello!
			</div>
		{/if}
	</div>

	<!-- Input -->
	<div class="p-4 border-glass-border bg-black/5 border-t">
		<div class="gap-2 flex">
			<Input
				bind:value={newMessage}
				onkeydown={handleKeydown}
				placeholder="Type a message..."
				class="bg-glass-bg border-glass-border focus-visible:ring-primary/50"
			/>
			<Button
				onclick={sendMessage}
				size="icon"
				variant="ghost"
				class="hover:bg-primary/20 hover:text-primary"
				disabled={status !== "connected"}
			>
				<Send class="h-4 w-4" />
			</Button>
		</div>
	</div>
</div>
