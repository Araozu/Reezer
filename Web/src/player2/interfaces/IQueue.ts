import type { ISong } from "~/providers";

/**
 * A queue interface for the Headless Music Player component
 *
 * The queue owns a IAudioBackend to play audio,
 * and manages the playback queue through this interface
 */
export interface IQueue
{
	queueState: Array<ISong>;

	/**
	 * Immediately play a single song.
	 *
	 * Clears the remaining queue, adds `song` at the end,
	 * and plays
	 */
	PlaySong(song: ISong): void;

	/**
	 * Immediately play a list of songs.
	 *
	 * Clears the remaining queue, adds the list at the end,
	 * and plays from the first element of that newly added list
	 */
	PlaySongList(songs: Array<ISong>): void;

	/**
	 * Adds a song to the end of the queue
	 */
	AddLastSong(song: ISong): void;

	/**
	 * Adds a list of songs to the end of the queue
	 */
	AddLastSongList(song: Array<ISong>): void;

	/**
	 * Adds a song next to the queue
	 */
	AddNextSong(song: ISong): void;

	/**
	 * Adds a list of songs next to the queue
	 */
	AddNextSongList(song: Array<ISong>): void;

	/**
	 * Plays the next song in the queue
	 */
	Next(): void;

	/**
	 * Plays the previous song in the queue
	 */
	Prev(): void;

	/**
	 * Plays the song at index `idx` of the queue
	 */
	PlayIdx(idx: number): void;

	/**
	 * Clears the entire queue
	 */
	ClearQueue(): void;

	RemoveIdx(idx: number): void;
}
