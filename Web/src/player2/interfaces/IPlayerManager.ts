import type { Result } from "neverthrow";
import type { ISong } from "~/providers";

/** Abstracts over the player operations. */
export interface IPlayerManager {
	/** Plays a song. May fail if the current user doesn't have permission to do so. */
	PlaySong(song: ISong): Promise<Result<void, unknown>>;
}

export type Action = "play";
