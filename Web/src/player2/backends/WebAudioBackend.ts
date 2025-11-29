import type { IAudioBackend } from "../interfaces/IAudioBackend";
import type { IAudioSource } from "../interfaces/IAudioSource";

/**
 * Web Audio API based audio backend implementation.
 * Uses AudioContext and AudioBufferSourceNode for playback,
 * which provides better control over audio and enables true gapless playback.
 */
export class WebAudioBackend implements IAudioBackend
{
	private _volume = 1.0;
	private audioContext: AudioContext = null!;
	private gainNode: GainNode = null!;

	// Current and next buffer sources for gapless playback
	private currentSource: AudioBufferSourceNode | null = null;
	private prefetchedBuffer: AudioBuffer | null = null;

	// Track IDs
	private currentSongId: string | null = null;
	private prefetchedSongId: string | null = null;

	// Playback state
	private isPaused = false;
	private pausedAt = 0;
	private startedAt = 0;
	private currentBuffer: AudioBuffer | null = null;

	// Timestamp when the current song started playing (for duplicate play detection)
	private currentSongStartTime = 0;

	private readyCallbacks: Array<() => void> = [];
	private songEndCallbacks: Array<(endedSongId: string) => void> = [];

	constructor(private audioSource: IAudioSource)
	{}

	get volume(): number
	{
		return this._volume;
	}

	set volume(value: number)
	{
		if (value < 0.0 || value > 1.0)
		{
			throw new RangeError("Volume must be between 0.0 and 1.0");
		}

		this._volume = value;
		if (this.gainNode)
		{
			this.gainNode.gain.value = value;
		}
	}

	async Play(id: string): Promise<void>
	{
		const timeSinceSongStart = Date.now() - this.currentSongStartTime;

		// Ignore duplicate play calls within 1 second of the same song starting
		if (this.currentSongId === id && timeSinceSongStart < 1000)
		{
			return;
		}

		// Stop any currently playing source
		this.stopCurrentSource();

		const mediaUrlResult = await this.audioSource.GetTrack(id);
		await mediaUrlResult.match(
			async(mediaUrl) =>
			{
				const buffer = await this.fetchAndDecodeAudio(mediaUrl);
				if (buffer)
				{
					this.currentBuffer = buffer;
					this.currentSongId = id;
					this.currentSongStartTime = Date.now();
					this.pausedAt = 0;
					this.isPaused = false;
					this.playBuffer(buffer, 0);
				}
			},
			(e) =>
			{
				console.error("Error fetching track:", e);
			},
		);
	}

	TogglePlayPause(): void
	{
		if (!this.audioContext || !this.currentBuffer)
		{
			return;
		}

		if (this.isPaused)
		{
			// Resume playback
			this.isPaused = false;
			this.playBuffer(this.currentBuffer, this.pausedAt);
		}
		else
		{
			// Pause playback
			this.isPaused = true;
			this.pausedAt = this.audioContext.currentTime - this.startedAt;
			this.stopCurrentSource();
		}
	}

	Seek(position: number): void
	{
		if (!this.currentBuffer || !this.audioContext)
		{
			return;
		}

		// Clamp position to valid range
		const clampedPosition = Math.max(0, Math.min(position, this.currentBuffer.duration));

		this.stopCurrentSource();
		this.pausedAt = clampedPosition;

		if (!this.isPaused)
		{
			this.playBuffer(this.currentBuffer, clampedPosition);
		}
	}

	async Prefetch(id: string): Promise<void>
	{
		const mediaUrlResult = await this.audioSource.GetTrack(id);
		await mediaUrlResult.match(
			async(mediaUrl) =>
			{
				const buffer = await this.fetchAndDecodeAudio(mediaUrl);
				if (buffer)
				{
					this.prefetchedBuffer = buffer;
					this.prefetchedSongId = id;
				}
			},
			(e) =>
			{
				console.error("Error prefetching track:", e);
			},
		);
	}

	ClearPrefetch(): void
	{
		this.prefetchedBuffer = null;
		this.prefetchedSongId = null;
	}

	Init(): void
	{
		this.audioContext = new AudioContext();
		this.gainNode = this.audioContext.createGain();
		this.gainNode.gain.value = this._volume;
		this.gainNode.connect(this.audioContext.destination);

		this.readyCallbacks.forEach((callback) => callback());
	}

	OnReady(callback: () => void): void
	{
		this.readyCallbacks.push(callback);
	}

	OnSongEnd(callback: (endedSongId: string) => void): void
	{
		this.songEndCallbacks.push(callback);
	}

	Deinit(): void
	{
		this.stopCurrentSource();
		if (this.audioContext)
		{
			this.audioContext.close();
		}
		console.log("Deinitializing WebAudioBackend");
	}

	/**
	 * Fetches audio data from URL and decodes it into an AudioBuffer.
	 */
	private async fetchAndDecodeAudio(url: string): Promise<AudioBuffer | null>
	{
		try
		{
			const response = await fetch(url);
			if (!response.ok)
			{
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			const arrayBuffer = await response.arrayBuffer();
			return await this.audioContext.decodeAudioData(arrayBuffer);
		}
		catch (error: unknown)
		{
			console.error("Error fetching/decoding audio:", error);
			return null;
		}
	}

	/**
	 * Creates and plays an AudioBufferSourceNode from the given buffer.
	 */
	private playBuffer(buffer: AudioBuffer, offset: number): void
	{
		const source = this.audioContext.createBufferSource();
		source.buffer = buffer;
		source.connect(this.gainNode);

		source.onended = () =>
		{
			// Only handle song end if this source is still the current one
			// and we weren't paused (which also triggers onended)
			if (source === this.currentSource && !this.isPaused)
			{
				this.handleSongEnded();
			}
		};

		this.currentSource = source;
		this.startedAt = this.audioContext.currentTime - offset;
		source.start(0, offset);
	}

	/**
	 * Stops the currently playing source node.
	 */
	private stopCurrentSource(): void
	{
		if (this.currentSource)
		{
			try
			{
				this.currentSource.onended = null;
				this.currentSource.stop();
			}
			catch (_error: unknown)
			{
				// Source may already be stopped
			}
			this.currentSource = null;
		}
	}

	/**
	 * Handles the end of a song, transitioning to prefetched content if available.
	 */
	private handleSongEnded(): void
	{
		const endedSongId = this.currentSongId;

		if (this.prefetchedBuffer && this.prefetchedSongId)
		{
			// Gapless transition to prefetched track
			this.currentBuffer = this.prefetchedBuffer;
			this.currentSongId = this.prefetchedSongId;
			this.currentSongStartTime = Date.now();
			this.pausedAt = 0;
			this.playBuffer(this.prefetchedBuffer, 0);

			this.prefetchedBuffer = null;
			this.prefetchedSongId = null;
		}
		else
		{
			this.currentSource = null;
			this.currentBuffer = null;
		}

		// Notify listeners that the song ended
		if (endedSongId)
		{
			this.songEndCallbacks.forEach((callback) => callback(endedSongId));
		}
	}
}
