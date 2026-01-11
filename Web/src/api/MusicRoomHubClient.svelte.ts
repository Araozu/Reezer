import * as SignalR from "@microsoft/signalr";
import type { ISong } from "../audio-engine/types/song";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface ChatMessage {
	userId: string;
	userName: string;
	message: string;
	timestamp: number;
}

export interface ConnectedUser {
	userId: string;
	userName: string;
}

/** Client wrapper for MusicRoomHub that mirrors C# hub methods and events */
export class MusicRoomHubClient
{
	private connection: SignalR.HubConnection;
	public status: ConnectionStatus = $state("disconnected");

	private messageReceivedHandlers: Array<(user: unknown, message: unknown) => void> = [];
	private chatMessageHandlers: Array<(message: ChatMessage) => void> = [];
	private connectedUsersChangedHandlers: Array<(users: ConnectedUser[]) => void> = [];
	private queueChangedHandlers: Array<(queue: ISong[], currentIndex: number) => void> = [];

	constructor(roomId?: string)
	{
		const url = `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/hub/MusicRoom${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`;

		this.connection = new SignalR.HubConnectionBuilder()
			.withUrl(url)
			.withAutomaticReconnect()
			.build();

		// Register SignalR event handlers
		this.connection.on("MessageReceived", (user, message) =>
		{
			this.messageReceivedHandlers.forEach((handler) => handler(user, message));
		});

		this.connection.on("ChatMessage", (message: ChatMessage) =>
		{
			this.chatMessageHandlers.forEach((handler) => handler(message));
		});

		this.connection.on("ConnectedUsersChanged", (users: ConnectedUser[]) =>
		{
			this.connectedUsersChangedHandlers.forEach((handler) => handler(users));
		});

		this.connection.on("QueueChanged", (queue: ISong[], currentIndex: number) =>
		{
			console.log("[MusicRoomHubClient] -> Received QueueChanged event", queue, currentIndex);
			this.queueChangedHandlers.forEach((handler) => handler(queue, currentIndex));
		});

		this.connection.onreconnected(() =>
		{
			this.status = "connected";
		});

		this.connection.onreconnecting(() =>
		{
			this.status = "reconnecting";
		});

		this.connection.onclose(() =>
		{
			this.status = "disconnected";
		});
	}

	/** Start the connection */
	public async start(): Promise<void>
	{
		if (this.status !== "disconnected") return;

		this.status = "connecting";
		try
		{
			await this.connection.start();
			this.status = "connected";
		}
		catch (error)
		{
			console.error("Connection failed:", error);
			this.status = "disconnected";
			throw error;
		}
	}

	/** Subscribe to MessageReceived events from the server */
	public OnMessageReceived(handler: (user: unknown, message: unknown) => void): () => void
	{
		this.messageReceivedHandlers.push(handler);
		// Return unsubscribe function
		return () =>
		{
			const index = this.messageReceivedHandlers.indexOf(handler);
			if (index > -1)
			{
				this.messageReceivedHandlers.splice(index, 1);
			}
		};
	}

	/** Subscribe to ChatMessage events from the server */
	public OnChatMessage(handler: (message: ChatMessage) => void): () => void
	{
		this.chatMessageHandlers.push(handler);
		// Return unsubscribe function
		return () =>
		{
			const index = this.chatMessageHandlers.indexOf(handler);
			if (index > -1)
			{
				this.chatMessageHandlers.splice(index, 1);
			}
		};
	}

	/** Subscribe to ConnectedUsersChanged events from the server */
	public OnConnectedUsersChanged(handler: (users: ConnectedUser[]) => void): () => void
	{
		this.connectedUsersChangedHandlers.push(handler);
		// Return unsubscribe function
		return () =>
		{
			const index = this.connectedUsersChangedHandlers.indexOf(handler);
			if (index > -1)
			{
				this.connectedUsersChangedHandlers.splice(index, 1);
			}
		};
	}

	/** Call SyncClock method on the hub - returns server timestamp in milliseconds */
	public async SyncClock(): Promise<number>
	{
		return await this.connection.invoke<number>("SyncClock");
	}

	/** Send a chat message to the room */
	public async SendMessage(message: string): Promise<void>
	{
		await this.connection.invoke("SendMessage", message);
	}

	/** Set the room queue */
	public async SetQueue(queue: ISong[], currentIndex: number): Promise<void>
	{
		await this.connection.invoke("SetQueue", queue, currentIndex);
	}

	/** Subscribe to QueueChanged events from the server */
	public OnQueueChanged(handler: (queue: ISong[], currentIndex: number) => void): () => void
	{
		this.queueChangedHandlers.push(handler);
		return () =>
		{
			const index = this.queueChangedHandlers.indexOf(handler);
			if (index > -1)
			{
				this.queueChangedHandlers.splice(index, 1);
			}
		};
	}

	public async PlaySongList(songs: ISong[]): Promise<void>
	{
		await this.connection.invoke("PlaySongList", songs);
	}

	/** Stop the connection and cleanup */
	public async destroy(): Promise<void>
	{
		await this.connection.stop();
		this.messageReceivedHandlers = [];
		this.chatMessageHandlers = [];
		this.connectedUsersChangedHandlers = [];
		this.queueChangedHandlers = [];
		this.status = "disconnected";
	}
}
