import type { IAudioBackend } from "../interfaces/IAudioBackend";
import type { IAudioSource } from "../interfaces/IAudioSource";

export class GaplessBackend implements IAudioBackend
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
			alert("Volume must be between 0.0 and 1.0");
			throw new RangeError("Volume must be between 0.0 and 1.0");
		}

		this._volume = value;
	}

	async Play(id: string): Promise<void>
	{
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

		const mediaUrlResult = await this.audioSource.GetTrack(id);
		mediaUrlResult.match(
			(mediaUrl) =>
			{
				player.src = mediaUrl;
				this.SetCurrentSongId(id);
				this.currentSongStartTime = Date.now();
				player.play();
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
		}
		else
		{
			player.pause();
		}
	}

	Seek(position: number): void
	{
		throw new Error(`Method not implemented.${position}`);
	}

	async Prefetch(id: string): Promise<void>
	{
		const nextPlayer = this.GetNextPlayer();
		const mediaUrlResult = await this.audioSource.GetTrack(id);
		mediaUrlResult.match(
			(mediaUrl) =>
			{
				nextPlayer.src = mediaUrl;
				this.SetNextSongId(id);
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

		if (this.hasPrefetch)
		{
			this.SwitchPlayers();
			const currentPlayer = this.GetCurrentPlayer();
			this.currentSongStartTime = Date.now();
			currentPlayer.play();
			this.hasPrefetch = false;
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

	/**
	 * Releases all resources held by the backend.
	 */
	Deinit(): void
	{
		console.log("Deinitializing GaplessBackend");
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
}
