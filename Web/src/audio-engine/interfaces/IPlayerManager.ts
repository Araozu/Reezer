import type { Result } from "neverthrow";
import type { ISong } from "../types";

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

	/** Plays a song. May fail if the current user doesn't have permission to do so. */
	PlaySong(song: ISong): Promise<Result<void, unknown>>;
}

export type Action = "play";
