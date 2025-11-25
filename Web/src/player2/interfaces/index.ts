export type { IAudioBackend, AudioEventHandler } from "./IAudioBackend";
export { AudioEvent } from "./IAudioBackend";

export type { IMusicPlayer, PlayerState } from "./IMusicPlayer";
export { PlaybackStrategy, RepeatMode } from "./IMusicPlayer";

export type { IPlaybackStrategy, PlaybackState, PlaybackEventHandler } from "./IPlaybackStrategy";
export { PlaybackEvent } from "./IPlaybackStrategy";

export type { IQueueManager, QueueEventHandler } from "./IQueueManager";
export { QueueEvent } from "./IQueueManager";

export type { IPrefetcher, PrefetchOptions } from "./IPrefetcher";

export type { IStreamProvider, SongMetadata } from "./IStreamProvider";

export type {
	ISyncService,
	SyncPlaybackState,
	TimeSyncResult,
	SyncEventHandler,
} from "./ISyncService";
export { SyncEvent } from "./ISyncService";
