import type { IAudioBackend, PlayState } from "../interfaces/IAudioBackend";
import type { IAudioSource } from "../interfaces/IAudioSource";
import type { ISong } from "../types";

/**
 * Web Audio API based audio backend implementation.
 * Uses AudioContext and AudioBufferSourceNode for playback,
 * which provides better control over audio and enables true gapless playback.
 */
export class WebAudioBackend implements IAudioBackend
{
	private _volume = 1.0;
	private audioContext: AudioContext | null = null;
	private gainNode: GainNode | null = null;

	// Current source for playback
	private currentSource: AudioBufferSourceNode | null = null;
	private currentBuffer: AudioBuffer | null = null;
	private currentSongId: string | null = null;

	// Prefetched buffer for gapless playback
	private prefetchedBuffer: AudioBuffer | null = null;
	private prefetchedSongId: string | null = null;

	// Playback state
	private isPaused = false;
	private pausedAt = 0;
	private startedAt = 0;
	private _playState: PlayState = "paused";

	// Prevents duplicate play calls and race conditions
	private currentSongStartTime = 0;
	private isLoading = false;

	private readyCallbacks: Array<() => void> = [];
	private songEndCallbacks: Array<(endedSongId: string) => void> = [];
	private positionUpdateCallbacks: Array<(positionSeconds: number) => void> = [];
	private durationChangeCallbacks: Array<(durationSeconds: number) => void> = [];
	private playStateChangeCallbacks: Array<(state: PlayState) => void> = [];

	private positionInterval: ReturnType<typeof setInterval> | null = null;
	private lastReportedSecond = -1;

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

	get duration(): number | null
	{
		return this.currentBuffer ? this.currentBuffer.duration * 1000 : null;
	}

	get playState(): PlayState
	{
		return this._playState;
	}

	get position(): number
	{
		if (!this.audioContext) return 0;
		if (this.isPaused) return this.pausedAt * 1000;
		return Math.max(0, (this.audioContext.currentTime - this.startedAt) * 1000);
	}

	async Play(track: ISong): Promise<void>
	{
		this.ensureInitialized();

		const id = track.id;
		if (!this.audioContext || !this.gainNode)
		{
			console.error("WebAudioBackend not initialized");
			return;
		}

		const timeSinceSongStart = Date.now() - this.currentSongStartTime;

		// Ignore duplicate play calls within 1 second of the same song starting
		if (this.currentSongId === id && timeSinceSongStart < 1000)
		{
			return;
		}

		// Prevent concurrent loading
		if (this.isLoading)
		{
			return;
		}

		// Check if we have this song prefetched
		if (this.prefetchedSongId === id && this.prefetchedBuffer)
		{
			this.stopCurrentSource();
			this.currentBuffer = this.prefetchedBuffer;
			this.currentSongId = id;
			this.currentSongStartTime = Date.now();
			this.pausedAt = 0;
			this.isPaused = false;
			this.playBuffer(this.prefetchedBuffer, 0);
			this.ClearPrefetch();
			this.notifyDurationChange(this.currentBuffer.duration * 1000);
			this.notifyPlayStateChange("playing");
			this.startPositionTracking();
			return;
		}

		this.isLoading = true;
		this.stopCurrentSource();
		this.notifyPlayStateChange("buffering");

		try
		{
			await this.ensureAudioContextResumed();

			const mediaUrlResult = await this.audioSource.GetTrack(track);
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
						this.notifyDurationChange(buffer.duration * 1000);
						this.notifyPlayStateChange("playing");
						this.startPositionTracking();
					}
					else
					{
						this.notifyPlayStateChange("paused");
					}
				},
				(e) =>
				{
					console.error("Error fetching track:", e);
					this.notifyPlayStateChange("paused");
				},
			);
		}
		finally
		{
			this.isLoading = false;
		}
	}

	TogglePlayPause(): void
	{
		if (this.isPaused)
		{
			this.Resume();
		}
		else
		{
			this.Pause();
		}
	}

	Pause(): void
	{
		if (!this.audioContext || !this.currentBuffer || this.isPaused)
		{
			return;
		}

		this.isPaused = true;
		this.pausedAt = this.audioContext.currentTime - this.startedAt;
		this.stopCurrentSource();
		this.notifyPlayStateChange("paused");
		this.stopPositionTracking();
	}

	Resume(): void
	{
		this.ensureInitialized();

		if (!this.audioContext || !this.currentBuffer || !this.isPaused)
		{
			return;
		}

		this.ensureAudioContextResumed();
		this.isPaused = false;
		this.playBuffer(this.currentBuffer, this.pausedAt);
		this.notifyPlayStateChange("playing");
		this.startPositionTracking();
	}

	Seek(position: number): void
	{
		if (!this.currentBuffer || !this.audioContext)
		{
			return;
		}

		const positionSeconds = position / 1000;
		const clampedPosition = Math.max(0, Math.min(positionSeconds, this.currentBuffer.duration));

		this.stopCurrentSource();
		this.pausedAt = clampedPosition;

		if (!this.isPaused)
		{
			this.playBuffer(this.currentBuffer, clampedPosition);
		}
	}

	async LoadCurrentSong(track: ISong): Promise<void>
	{
		this.ensureInitialized();

		const id = track.id;
		if (!this.audioContext)
		{
			return;
		}

		this.isLoading = true;
		this.stopCurrentSource();
		this.notifyPlayStateChange("buffering");

		try
		{
			const mediaUrlResult = await this.audioSource.GetTrack(track);
			await mediaUrlResult.match(
				async(mediaUrl) =>
				{
					const buffer = await this.fetchAndDecodeAudio(mediaUrl);
					if (buffer)
					{
						this.currentBuffer = buffer;
						this.currentSongId = id;
						this.pausedAt = 0;
						this.isPaused = true;
						this.notifyDurationChange(buffer.duration * 1000);
						this.notifyPlayStateChange("paused");
					}
					else
					{
						this.notifyPlayStateChange("paused");
					}
				},
				(e) =>
				{
					console.error("Error loading track:", e);
					this.notifyPlayStateChange("paused");
				},
			);
		}
		finally
		{
			this.isLoading = false;
		}
	}

	async Prefetch(track: ISong): Promise<void>
	{
		this.ensureInitialized();

		const id = track.id;
		if (!this.audioContext)
		{
			return;
		}

		// Don't prefetch the same song that's playing or already prefetched
		if (id === this.currentSongId || id === this.prefetchedSongId)
		{
			return;
		}

		const mediaUrlResult = await this.audioSource.GetTrack(track);
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
		this.ensureInitialized();
	}

	OnReady(callback: () => void): void
	{
		this.readyCallbacks.push(callback);
	}

	OnSongEnd(callback: (endedSongId: string) => void): void
	{
		this.songEndCallbacks.push(callback);
	}

	OnPositionUpdate(callback: (positionMs: number) => void): void
	{
		this.positionUpdateCallbacks.push(callback);
	}

	OnDurationChange(callback: (durationMs: number) => void): void
	{
		this.durationChangeCallbacks.push(callback);
	}

	OnPlayStateChange(callback: (state: PlayState) => void): void
	{
		this.playStateChangeCallbacks.push(callback);
	}

	Deinit(): void
	{
		console.log("[WebAudioBackend] Deinit called");
		this.stopPositionTracking();
		this.stopCurrentSource();
		this.ClearPrefetch();
		this.currentBuffer = null;
		this.currentSongId = null;

		if (this.audioContext)
		{
			this.audioContext.close();
			this.audioContext = null;
			this.gainNode = null;
		}

		this.readyCallbacks = [];
		this.songEndCallbacks = [];
		this.positionUpdateCallbacks = [];
		this.durationChangeCallbacks = [];
		this.playStateChangeCallbacks = [];
	}

	private ensureInitialized(): void
	{
		if (!this.audioContext)
		{
			this.audioContext = new AudioContext();
			this.gainNode = this.audioContext.createGain();
			this.gainNode.gain.value = this._volume;
			this.gainNode.connect(this.audioContext.destination);
			this.readyCallbacks.forEach((callback) => callback());
		}
	}

	private async ensureAudioContextResumed(): Promise<void>
	{
		if (this.audioContext && this.audioContext.state === "suspended")
		{
			await this.audioContext.resume();
		}
	}

	private async fetchAndDecodeAudio(url: string): Promise<AudioBuffer | null>
	{
		if (!this.audioContext)
		{
			return null;
		}

		try
		{
			const response = await fetch(url, {
				credentials: "include",
			});
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

	private playBuffer(buffer: AudioBuffer, offset: number): void
	{
		if (!this.audioContext || !this.gainNode)
		{
			return;
		}

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

	private stopCurrentSource(): void
	{
		if (this.currentSource)
		{
			try
			{
				this.currentSource.onended = null;
				this.currentSource.stop();
			}
			catch
			{
				// Source may already be stopped
			}
			this.currentSource = null;
		}
	}

	private handleSongEnded(): void
	{
		const endedSongId = this.currentSongId;
		this.stopPositionTracking();

		if (this.prefetchedBuffer && this.prefetchedSongId)
		{
			// Gapless transition to prefetched track
			this.currentBuffer = this.prefetchedBuffer;
			this.currentSongId = this.prefetchedSongId;
			this.currentSongStartTime = Date.now();
			this.pausedAt = 0;
			this.playBuffer(this.prefetchedBuffer, 0);
			this.notifyDurationChange(this.currentBuffer.duration * 1000);
			this.notifyPlayStateChange("playing");
			this.startPositionTracking();

			this.prefetchedBuffer = null;
			this.prefetchedSongId = null;
		}
		else
		{
			this.currentSource = null;
			this.currentBuffer = null;
			this.currentSongId = null;
			this.notifyPlayStateChange("paused");
		}

		if (endedSongId)
		{
			this.songEndCallbacks.forEach((callback) => callback(endedSongId));
		}
	}

	private startPositionTracking(): void
	{
		this.stopPositionTracking();
		this.lastReportedSecond = -1;

		this.positionInterval = setInterval(() =>
		{
			if (!this.audioContext || this.isPaused)
			{
				return;
			}

			const currentPosition = (this.audioContext.currentTime - this.startedAt) * 1000;
			const currentSecond = Math.floor(currentPosition / 1000);

			if (currentSecond !== this.lastReportedSecond)
			{
				this.lastReportedSecond = currentSecond;
				this.positionUpdateCallbacks.forEach((cb) => cb(currentPosition));
			}
		}, 250);
	}

	private stopPositionTracking(): void
	{
		if (this.positionInterval)
		{
			clearInterval(this.positionInterval);
			this.positionInterval = null;
		}
	}

	private notifyDurationChange(duration: number): void
	{
		this.durationChangeCallbacks.forEach((cb) => cb(duration));
	}

	private notifyPlayStateChange(state: PlayState): void
	{
		this._playState = state;
		this.playStateChangeCallbacks.forEach((cb) => cb(state));
	}
}
