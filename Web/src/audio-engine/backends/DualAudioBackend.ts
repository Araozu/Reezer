import type { IAudioBackend, PlayState } from "../interfaces/IAudioBackend";
import type { IAudioSource } from "../interfaces/IAudioSource";
import type { ISong } from "../types";

export class DualAudioBackend implements IAudioBackend
{
	private _volume = 1.0;
	private player1: HTMLAudioElement = null!;
	private player2: HTMLAudioElement = null!;

	// Keeps track of which player is currently active
	private currentPlayer: 1 | 2 = 1;
	private hasPrefetch = false;

	// Song ID associated with each player
	private player1SongId: string | null = null;
	private player2SongId: string | null = null;

	// Timestamp when the current song started playing (for duplicate play detection)
	private currentSongStartTime: number = 0;

	private readyCallbacks: Array<() => void> = [];
	private songEndCallbacks: Array<(endedSongId: string) => void> = [];
	private positionUpdateCallbacks: Array<(positionSeconds: number) => void> = [];
	private durationChangeCallbacks: Array<(durationSeconds: number) => void> = [];
	private playStateChangeCallbacks: Array<(state: PlayState) => void> = [];

	private positionInterval: ReturnType<typeof setInterval> | null = null;
	private lastReportedSecond = -1;

	constructor(private audioSource: IAudioSource)
	{}
	get duration(): number | null
	{
		const player = this.GetCurrentPlayer();
		return player && !isNaN(player.duration) ? player.duration : null;
	}

	get position(): number
	{
		const player = this.GetCurrentPlayer();
		return player ? player.currentTime : 0;
	}

	get volume(): number
	{
		return this._volume;
	}
	set volume(value: number)
	{
		if (value < 0.0 || value > 1.0)
		{
			alert("Volume must be between 0.0 and 1.0");
			throw new RangeError("Volume must be between 0.0 and 1.0");
		}

		this._volume = value;
	}

	async Play(track: ISong): Promise<void>
	{
		const id = track.id;
		const currentSongId = this.GetCurrentSongId();
		const timeSinceSongStart = Date.now() - this.currentSongStartTime;

		// Ignore duplicate play calls within 1 second of the same song starting
		// This happens when the queue calls Play after OnSongEnd, but gapless already transitioned
		if (currentSongId === id && timeSinceSongStart < 1000)
		{
			return;
		}

		const player = this.GetCurrentPlayer();
		player.pause();
		this.notifyPlayStateChange("buffering");

		const mediaUrlResult = await this.audioSource.GetTrack(track);
		mediaUrlResult.match(
			(mediaUrl) =>
			{
				player.src = mediaUrl;
				this.SetCurrentSongId(id);
				this.currentSongStartTime = Date.now();
				player.play();
				this.notifyPlayStateChange("playing");
				this.startPositionTracking();
			},
			(e) =>
			{
				console.error("Error fetching track:", e);
			},
		);
	}

	TogglePlayPause(): void
	{
		const player = this.GetCurrentPlayer();
		if (player.paused)
		{
			player.play();
			this.notifyPlayStateChange("playing");
			this.startPositionTracking();
		}
		else
		{
			player.pause();
			this.notifyPlayStateChange("paused");
			this.stopPositionTracking();
		}
	}

	Seek(position: number): void
	{
		const player = this.GetCurrentPlayer();
		player.currentTime = position;
	}

	async Prefetch(track: ISong): Promise<void>
	{
		const nextPlayer = this.GetNextPlayer();
		const mediaUrlResult = await this.audioSource.GetTrack(track);
		mediaUrlResult.match(
			(mediaUrl) =>
			{
				nextPlayer.src = mediaUrl;
				this.SetNextSongId(track.id);
				this.hasPrefetch = true;
			},
			(e) =>
			{
				console.error("Error fetching track:", e);
			},
		);
	}

	ClearPrefetch(): void
	{
		this.hasPrefetch = false;
		this.SetNextSongId(null);
	}

	autoPlayNext = () =>
	{
		const endedSongId = this.GetCurrentSongId();
		this.stopPositionTracking();

		if (this.hasPrefetch)
		{
			this.SwitchPlayers();
			const currentPlayer = this.GetCurrentPlayer();
			this.currentSongStartTime = Date.now();
			currentPlayer.play();
			this.hasPrefetch = false;
			this.notifyPlayStateChange("playing");
			this.startPositionTracking();
		}
		else
		{
			this.notifyPlayStateChange("paused");
		}

		// Notify listeners that the song ended
		if (endedSongId)
		{
			this.songEndCallbacks.forEach((callback) => callback(endedSongId));
		}
	};

	/**
	 * Initializes the backend.
	 *
	 * This method **MUST** be called on a organic click event,
	 * to allow audio playback in browsers.
	 */
	Init(): void
	{
		this.player1 = new Audio();
		this.player2 = new Audio();
		this.player1.volume = this._volume;
		this.player2.volume = this._volume;

		this.player1.addEventListener("ended", this.autoPlayNext);
		this.player2.addEventListener("ended", this.autoPlayNext);

		this.player1.addEventListener("loadedmetadata", () => this.notifyDurationChange(this.player1.duration));
		this.player2.addEventListener("loadedmetadata", () => this.notifyDurationChange(this.player2.duration));

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

	OnPositionUpdate(callback: (positionSeconds: number) => void): void
	{
		this.positionUpdateCallbacks.push(callback);
	}

	OnDurationChange(callback: (durationSeconds: number) => void): void
	{
		this.durationChangeCallbacks.push(callback);
	}

	OnPlayStateChange(callback: (state: PlayState) => void): void
	{
		this.playStateChangeCallbacks.push(callback);
	}

	Deinit(): void
	{
		console.log("[DualAudioBackend] Deinit called");
		this.stopPositionTracking();
		this.player1?.removeEventListener("ended", this.autoPlayNext);
		this.player2?.removeEventListener("ended", this.autoPlayNext);
		this.readyCallbacks = [];
		this.songEndCallbacks = [];
		this.positionUpdateCallbacks = [];
		this.durationChangeCallbacks = [];
		this.playStateChangeCallbacks = [];
	}

	private GetCurrentPlayer(): HTMLAudioElement
	{
		return this.currentPlayer === 1 ? this.player1 : this.player2;
	}
	private GetNextPlayer(): HTMLAudioElement
	{
		return this.currentPlayer === 1 ? this.player2 : this.player1;
	}
	private SwitchPlayers(): void
	{
		this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
	}
	private GetCurrentSongId(): string | null
	{
		return this.currentPlayer === 1 ? this.player1SongId : this.player2SongId;
	}
	private SetCurrentSongId(id: string | null): void
	{
		if (this.currentPlayer === 1)
		{
			this.player1SongId = id;
		}
		else
		{
			this.player2SongId = id;
		}
	}
	private SetNextSongId(id: string | null): void
	{
		if (this.currentPlayer === 1)
		{
			this.player2SongId = id;
		}
		else
		{
			this.player1SongId = id;
		}
	}

	private startPositionTracking(): void
	{
		this.stopPositionTracking();
		this.lastReportedSecond = -1;

		this.positionInterval = setInterval(() =>
		{
			const player = this.GetCurrentPlayer();
			if (!player || player.paused)
			{
				return;
			}

			const currentSecond = Math.floor(player.currentTime);
			if (currentSecond !== this.lastReportedSecond)
			{
				this.lastReportedSecond = currentSecond;
				this.positionUpdateCallbacks.forEach((cb) => cb(currentSecond));
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
		this.playStateChangeCallbacks.forEach((cb) => cb(state));
	}
}
