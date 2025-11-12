//! Interfaces for the Headless Music Player component
import type { ISong } from "~/providers";

export interface IMusicPlayer<Extras> {
	/**
	 * Immediately play a single song.
	 *
	 * Clears the remaining queue, adds `song` at the end,
	 * and plays
	 */
	PlaySong(song: ISong, extra?: Extras): void;

	/**
	 * Immediately play a list of songs.
	 *
	 * Clears the remaining queue, adds the list at the end,
	 * and plays from the first element of that newly added list
	 */
	PlaySongList(songs: Array<ISong>, extra?: Extras): void;

	/**
	 * Adds a song to the end of the queue
	 */
	AddLastSong(song: ISong, extra?: Extras): void;

	/**
	 * Adds a list of songs to the end of the queue
	 */
	AddLastSongList(song: Array<ISong>, extra?: Extras): void;

	/**
	 * Adds a song next to the queue
	 */
	AddNextSong(song: ISong, extra?: Extras): void;

	/**
	 * Adds a list of songs next to the queue
	 */
	AddNextSongList(song: Array<ISong>, extra?: Extras): void;

	/**
	 * Plays the next song in the queue
	 */
	Next(extra?: Extras): void;

	/**
	 * Plays the previous song in the queue
	 */
	Prev(extra?: Extras): void;

	/**
	 * Plays the song at index `idx` of the queue
	 */
	PlayIdx(idx: number, extra?: Extras): void;
}
