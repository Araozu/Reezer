import type { ISong } from "../types";

export type PlayState = "playing" | "paused" | "buffering";

/**
 * Contract for audio backend implementations.
 * Receives a `IAudioSource` as dependency to fetch audio data from.
 */
export interface IAudioBackend {
	/**
	 * Raw volume between 0.0 and 1.0.
	 * The caller is responsible for mapping this to a logarithmic scale if needed.
	 */
	get volume(): number ;
	set volume(value: number)

	get duration(): number | null;

	/**
	 * Plays the audio track with the given id.
	 */
	Play(track: ISong): Promise<void>

	/**
	 * Pauses or resumes playback.
	 */
	TogglePlayPause(): void
	Seek(position: number): void

	Prefetch(track: ISong): Promise<void>
	ClearPrefetch(): void;

	/**
	 * Initializes the audio backend.
	 *
	 * This method **MUST** be called by a organic click event,
	 * to allow audio playback in browsers.
	 */
	Init(): void;

	/**
	 * Registers a callback to be called when the backend is ready to play audio.
	 */
	OnReady(callback: () => void): void;

	/**
	 * Registers a callback to be called when a song finishes playing.
	 * Multiple callbacks can be registered.
	 */
	OnSongEnd(callback: (endedSongId: string) => void): void;

	/**
	 * Registers a callback to be called when the current position updates (second precision).
	 * Position is in seconds.
	 */
	OnPositionUpdate(callback: (positionSeconds: number) => void): void;

	/**
	 * Registers a callback to be called when the current song's duration is known.
	 * Duration is in seconds.
	 */
	OnDurationChange(callback: (durationSeconds: number) => void): void;

	/**
	 * Registers a callback to be called when the play state changes.
	 */
	OnPlayStateChange(callback: (state: PlayState) => void): void;

	/**
	 * Deinitializes the audio backend, releasing any resources held.
	 */
	Deinit(): void;
}

