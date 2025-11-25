export interface ISyncService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  joinRoom(roomId: string): Promise<void>;
  leaveRoom(): Promise<void>;
  createRoom(): Promise<string>;

  sendPlaybackState(state: SyncPlaybackState): Promise<void>;
  onPlaybackStateReceived(handler: (state: SyncPlaybackState) => void): void;

  synchronizeTime(): Promise<TimeSyncResult>;
  getCurrentSyncedTime(): number;

  on(event: SyncEvent, handler: SyncEventHandler): void;
  off(event: SyncEvent, handler: SyncEventHandler): void;
}

export interface SyncPlaybackState {
  songId: string;
  position: number;
  isPlaying: boolean;
  timestamp: number;
  initiatorId: string;
}

export interface TimeSyncResult {
  roundTripTime: number;
  clockOffset: number;
  serverTime: number;
  accuracy: "high" | "medium" | "low";
}

export type SyncEventHandler = (...args: unknown[]) => void;

export enum SyncEvent {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ROOM_JOINED = "room-joined",
  ROOM_LEFT = "room-left",
  PEER_JOINED = "peer-joined",
  PEER_LEFT = "peer-left",
  STATE_RECEIVED = "state-received",
  SYNC_ERROR = "sync-error",
}
