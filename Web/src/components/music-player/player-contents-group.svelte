<script lang="ts">
	import { GetSyncPlayerManagerContext } from "~/context/music-player-context";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Send } from "lucide-svelte";
	import { cn } from "$lib/utils";

	const playerManager = GetSyncPlayerManagerContext();
	
	let newMessage = $state("");
	let chatContainer: HTMLDivElement;

	// Use derived to react to changes in the manager's messages array
	const messages = $derived(playerManager.messages);
	const status = $derived(playerManager.status);

	$effect(() => {
		// Auto-scroll when messages change
		if (messages.length > 0) {
			scrollToBottom();
		}
	});

	function scrollToBottom() {
		if (chatContainer) {
			setTimeout(() => {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}, 0);
		}
	}

	async function sendMessage() {
		if (!newMessage.trim()) return;
		
		try {
			await playerManager.sendChatMessage(newMessage);
			newMessage = "";
		} catch (e) {
			console.error("Failed to send message", e);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="flex flex-col h-full w-full bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden shadow-[0_4px_24px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]">
	<!-- Header -->
	<div class="p-4 border-b border-glass-border flex justify-between items-center">
		<h3 class="font-semibold text-lg">Room Chat</h3>
		<div class="flex items-center gap-2">
			<div class={cn("w-2 h-2 rounded-full", {
				"bg-green-500": status === "connected",
				"bg-yellow-500": status === "connecting" || status === "reconnecting" || status === "clock_sync",
				"bg-red-500": status === "disconnected"
			})}></div>
			<span class="text-xs text-muted-foreground capitalize">{status.replace('_', ' ')}</span>
		</div>
	</div>

	<!-- Messages -->
	<div 
		bind:this={chatContainer}
		class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
	>
		{#each messages as msg}
			<div class="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
				<div class="flex items-baseline gap-2">
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
			<div class="h-full flex items-center justify-center text-muted-foreground text-sm italic">
				No messages yet. Say hello!
			</div>
		{/if}
	</div>

	<!-- Input -->
	<div class="p-4 border-t border-glass-border bg-black/5">
		<div class="flex gap-2">
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
