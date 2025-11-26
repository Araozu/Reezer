
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

	/**
	 * Plays the audio track with the given id.
	 */
	Play(id: string): void;
	Pause(): void
	Seek(position: number): void

	Prefetch(id: string): void;
	ClearPrefetch(): void;

	Init(): void;
	Deinit(): void;
}

