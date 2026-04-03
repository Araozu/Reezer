import { ok, type Result } from "neverthrow";
import type { Action, IPlayerManager } from "../interfaces/IPlayerManager";
import { type ISong, LoopMode } from "../types";
import type { IAudioBackend, PlayState } from "../interfaces/IAudioBackend";
import type { IQueue } from "../interfaces/IQueue";
import { DualAudioBackend } from "../backends/DualAudioBackend";
import type { IAudioSource } from "../interfaces/IAudioSource";
import { GeneralPurposeQueue } from "../queues/GeneralPurposeQueue";
import { BrowserMediaSession } from "../backends/BrowserMediaSession";
import type { IMediaSession } from "../interfaces/IMediaSession";

/**
 * A player manager for solo (local) playback.
 *
 * As this is a solo player, all actions are always allowed.
 */
export class SoloPlayerManager implements IPlayerManager
{
	private readonly audioBackend: IAudioBackend;
	private readonly queueManager: IQueue;
	private readonly mediaSession: IMediaSession;

	constructor(audioSource: IAudioSource)
	{
		this.audioBackend = new DualAudioBackend(audioSource);
		this.queueManager = new GeneralPurposeQueue(this.audioBackend);

		// Setup music player
		this.mediaSession = new BrowserMediaSession(this.queueManager, this.audioBackend);
		this.mediaSession.Init();
	}

	async PlaySongList(songs: Array<ISong>): Promise<Result<void, unknown>>
	{
		// Checking for permission is not needed in solo player

		this.queueManager.PlaySongList(songs);
		return ok();
	}

	async AddLastSong(song: ISong): Promise<Result<void, unknown>>
	{
		this.queueManager.AddLastSong(song);
		return ok();
	}

	async AddLastSongList(songs: Array<ISong>): Promise<Result<void, unknown>>
	{
		this.queueManager.AddLastSongList(songs);
		return ok();
	}

	async AddNextSong(song: ISong): Promise<Result<void, unknown>>
	{
		this.queueManager.AddNextSong(song);
		return ok();
	}

	async AddNextSongList(songs: Array<ISong>): Promise<Result<void, unknown>>
	{
		this.queueManager.AddNextSongList(songs);
		return ok();
	}

	async Next(): Promise<Result<void, unknown>>
	{
		this.queueManager.Next();
		return ok();
	}

	async Prev(): Promise<Result<void, unknown>>
	{
		this.queueManager.Prev();
		return ok();
	}

	async PlayAt(idx: number): Promise<Result<void, unknown>>
	{
		this.queueManager.PlayAt(idx);
		return ok();
	}

	async ClearQueue(): Promise<Result<void, unknown>>
	{
		this.queueManager.ClearQueue();
		return ok();
	}

	async RemoveAt(idx: number): Promise<Result<void, unknown>>
	{
		this.queueManager.RemoveAt(idx);
		return ok();
	}

	async SetQueue(newQueue: Array<ISong>, newCurrentIdx: number): Promise<Result<void, unknown>>
	{
		await this.queueManager.SetQueue(newQueue, newCurrentIdx);
		return ok();
	}

	async SetLoopMode(mode: LoopMode): Promise<Result<void, unknown>>
	{
		this.queueManager.SetLoopMode(mode);
		return ok();
	}

	async TogglePlayPause(): Promise<Result<void, unknown>>
	{
		this.audioBackend.TogglePlayPause();
		return ok();
	}

	async Seek(position: number): Promise<Result<void, unknown>>
	{
		this.audioBackend.Seek(position);
		return ok();
	}

	HasPermission(action: Action): boolean
	{
		void action;
		return true;
	}

	async PlaySong(song: ISong): Promise<Result<void, unknown>>
	{
		this.queueManager.PlaySong(song);
		return ok();
	}

	/** Always allowed, the volume is local only */
	SetVolume(volume: number): void
	{
		this.audioBackend.volume = volume;
	}
	GetVolume(): number
	{
		return this.audioBackend.volume;
	}

	async Init(): Promise<Result<void, unknown>>
	{
		this.audioBackend.Init();
		return ok();
	}

	async Deinit(): Promise<void>
	{
		this.queueManager.Deinit();
	}

	GetCurrentSong(): ISong | null
	{
		return this.queueManager.currentSong;
	}

	GetQueue(): Readonly<Array<ISong>>
	{
		return this.queueManager.queue;
	}

	GetCurrentIdx(): number
	{
		return this.queueManager.currentIdx;
	}

	GetLoopMode(): LoopMode
	{
		return this.queueManager.loopMode;
	}

	GetPlayState(): PlayState
	{
		return this.audioBackend.playState;
	}

	GetDuration(): number | null
	{
		return this.audioBackend.duration;
	}

	GetPosition(): number
	{
		return this.audioBackend.position;
	}

	OnQueueChanged(callback: () => void): void
	{
		this.queueManager.OnQueueChanged(callback);
	}

	OnPlayStateChanged(callback: (state: PlayState) => void): void
	{
		this.audioBackend.OnPlayStateChange(callback);
	}

	OnPositionUpdate(callback: (positionMs: number) => void): void
	{
		this.audioBackend.OnPositionUpdate(callback);
	}

	OnDurationChange(callback: (durationMs: number) => void): void
	{
		this.audioBackend.OnDurationChange(callback);
	}
}
