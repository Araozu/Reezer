import type { Result } from "neverthrow";
import type { ISong, LoopMode } from "../types";

/**
 * Abstracts over the player operations.
 *
 * This interface is aware of the fact that certain operations may fail due to permission issues.
 *
 * Implementors are supposed to use IQueueManager & IAudioBackend to fulfill the operations.
 */
export interface IPlayerManager {
	Init(): Promise<Result<void, unknown>>;
	Deinit(): Promise<void>

	/**
	 * Checks if the current user has permission to perform the given action.
	 *
	 * On a sync player this involves talking to the remote server to check permissions.
	 * On a local player this may always return true.
	 */
	HasPermission(action: Action): boolean;

	/** Plays a single song. May fail if the current user doesn't have permission to do so. */
	PlaySong(song: ISong): Promise<Result<void, unknown>>;

	/**
	 * Plays many songs. May fail if the current user doesn't have permission to do so.
	 *
	 * Clears the remaining queue, adds the list at the end,
	 * and plays from the first element of that newly added list
	 */
	PlaySongList(songs: Array<ISong>): Promise<Result<void, unknown>>;

	/** Adds a song to the end of the queue. May fail if no permission. */
	AddLastSong(song: ISong): Promise<Result<void, unknown>>;

	/** Adds a list of songs to the end of the queue. May fail if no permission. */
	AddLastSongList(songs: Array<ISong>): Promise<Result<void, unknown>>;

	/** Adds a song next to the queue. May fail if no permission. */
	AddNextSong(song: ISong): Promise<Result<void, unknown>>;

	/** Adds a list of songs next to the queue. May fail if no permission. */
	AddNextSongList(songs: Array<ISong>): Promise<Result<void, unknown>>;

	/** Plays the next song in the queue. May fail if no permission. */
	Next(): Promise<Result<void, unknown>>;

	/** Plays the previous song in the queue. May fail if no permission. */
	Prev(): Promise<Result<void, unknown>>;

	/** Plays the song at index `idx` of the queue. May fail if no permission. */
	PlayAt(idx: number): Promise<Result<void, unknown>>;

	/** Clears the entire queue. May fail if no permission. */
	ClearQueue(): Promise<Result<void, unknown>>;

	/** Removes the song at index `idx`. May fail if no permission. */
	RemoveAt(idx: number): Promise<Result<void, unknown>>;

	/** Replaces the entire queue and sets the current index. May fail if no permission. */
	SetQueue(newQueue: Array<ISong>, newCurrentIdx: number): Promise<Result<void, unknown>>;

	/** Sets the loop mode. May fail if no permission. */
	SetLoopMode(mode: LoopMode): Promise<Result<void, unknown>>;

	/**
	 * Sets the volume, as a value between 0 and 1.
	 *
	 * Always allowed, the volume is local only.
	 */
	SetVolume(volume: number): void
	/** Gets the current volume, as a value between 0 and 1. */
	GetVolume(): number;

	GetCurrentSong(): ISong | null;
	GetQueue(): Readonly<Array<ISong>>;
	GetCurrentIdx(): number;
	GetLoopMode(): LoopMode;

	OnQueueChanged(callback: () => void): void;
}

export type Action = "PlaySong"
                   | "PlaySongList"
                   | "AddLastSong"
                   | "AddLastSongList"
                   | "AddNextSong"
                   | "AddNextSongList"
                   | "Next"
                   | "Prev"
                   | "PlayAt"
                   | "ClearQueue"
                   | "RemoveAt"
                   | "SetQueue"
                   | "SetLoopMode"
                   | "TogglePlayPause"

