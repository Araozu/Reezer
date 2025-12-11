import * as SignalR from "@microsoft/signalr";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

interface ChatMessage {
	userId: string;
	userName: string;
	message: string;
	timestamp: number;
}

/** Client wrapper for MusicRoomHub that mirrors C# hub methods and events */
export class MusicRoomHubClient {
	private connection: SignalR.HubConnection;
	public status: ConnectionStatus = $state("disconnected");

	private messageReceivedHandlers: Array<(user: unknown, message: unknown) => void> = [];
	private chatMessageHandlers: Array<(message: ChatMessage) => void> = [];

	constructor(roomId?: string) {
		this.status = "connecting";
		const url = `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/hub/MusicRoom${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`;
		
		this.connection = new SignalR.HubConnectionBuilder()
			.withUrl(url)
			.withAutomaticReconnect()
			.build();

		// Register SignalR event handlers
		this.connection.on("MessageReceived", (user, message) => {
			this.messageReceivedHandlers.forEach(handler => handler(user, message));
		});

		this.connection.on("ChatMessage", (message: ChatMessage) => {
			this.chatMessageHandlers.forEach(handler => handler(message));
		});

		this.connection.onreconnected(() => {
			this.status = "connected";
		});

		this.connection.onreconnecting(() => {
			this.status = "reconnecting";
		});

		this.connection.onclose(() => {
			this.status = "disconnected";
		});

		this.connection.start()
			.then(() => {
				this.status = "connected";
			})
			.catch((error) => {
				console.error("Connection failed:", error);
				this.status = "disconnected";
			});
	}

	/** Subscribe to MessageReceived events from the server */
	public OnMessageReceived(handler: (user: unknown, message: unknown) => void): () => void {
		this.messageReceivedHandlers.push(handler);
		// Return unsubscribe function
		return () => {
			const index = this.messageReceivedHandlers.indexOf(handler);
			if (index > -1) {
				this.messageReceivedHandlers.splice(index, 1);
			}
		};
	}

	/** Subscribe to ChatMessage events from the server */
	public OnChatMessage(handler: (message: ChatMessage) => void): () => void {
		this.chatMessageHandlers.push(handler);
		// Return unsubscribe function
		return () => {
			const index = this.chatMessageHandlers.indexOf(handler);
			if (index > -1) {
				this.chatMessageHandlers.splice(index, 1);
			}
		};
	}

	/** Call Hello method on the hub */
	public async Hello(name: string): Promise<void> {
		await this.connection.invoke("Hello", name);
	}

	/** Call SyncClock method on the hub - returns server timestamp in milliseconds */
	public async SyncClock(): Promise<number> {
		return await this.connection.invoke<number>("SyncClock");
	}

	/** Send a chat message to the room */
	public async SendMessage(message: string): Promise<void> {
		await this.connection.invoke("SendMessage", message);
	}

	/** Stop the connection and cleanup */
	public async destroy(): Promise<void> {
		await this.connection.stop();
		this.messageReceivedHandlers = [];
		this.chatMessageHandlers = [];
		this.status = "disconnected";
	}
}
