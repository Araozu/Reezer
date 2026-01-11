import { ok, type Result } from "neverthrow";
import type { IAudioBackend, PlayState } from "../interfaces/IAudioBackend";
import type { Action, IPlayerManager } from "../interfaces/IPlayerManager";
import type { ISong, LoopMode } from "../types";
import type { IQueue } from "../interfaces/IQueue";
import type { IMediaSession } from "../interfaces/IMediaSession";
import type { IAudioSource } from "../interfaces/IAudioSource";
import { DualAudioBackend } from "../backends/DualAudioBackend";
import { GeneralPurposeQueue } from "../queues/GeneralPurposeQueue";
import { BrowserMediaSession } from "../backends/BrowserMediaSession";
import type { SyncManager } from "./SyncManager.svelte";

/**
 * A player manager for multiplayer playback.
 *
 * This manager is responsible for playing music in a room and syncing the playback with other participants.
 */
export class MultiplayerManager implements IPlayerManager
{
	private readonly audioBackend: IAudioBackend;
	private readonly queueManager: IQueue;
	private readonly mediaSession: IMediaSession;
	private readonly syncManager: SyncManager;

	constructor(audioSource: IAudioSource, syncManager: SyncManager)
	{
		this.syncManager = syncManager;
		this.audioBackend = new DualAudioBackend(audioSource);
		this.queueManager = new GeneralPurposeQueue(this.audioBackend);

		// Setup music player
		this.mediaSession = new BrowserMediaSession(this.queueManager , this.audioBackend);
		this.mediaSession.Init();

		// Listen for remote queue changes
		this.syncManager.onQueueChanged((queue, currentIdx) =>
		{
			console.log("[MultiplayerManager] Set queue from server", queue, currentIdx);

			this.queueManager.SetQueue(queue, currentIdx);
			console.log("[MultiplayerManager] Set queue from server: done");
		});

		// Listen for initial room state
		this.syncManager.onRoomState(async (state) =>
		{
			console.log("[MultiplayerManager] Set initial room state from server", state);

			this.queueManager.SetQueue(state.queue, state.currentIndex);

			// Wait a bit for the queue to be set and the backend to be ready
			await new Promise(resolve => setTimeout(resolve, 100));
			
			if (state.isPlaying) this.audioBackend.Resume();
			else                 this.audioBackend.Pause();
		});

		// Listen for remote play state changes
		this.syncManager.onPlayStateChanged((isPlaying) =>
		{
			console.log("[MultiplayerManager] Set play state from server, isPlaying: ", isPlaying);
				if (isPlaying)
				{
					this.audioBackend.Resume();
				}
				else
				{
					this.audioBackend.Pause();
				}
		});

		// Listen for local play state changes to sync with backend
		this.audioBackend.OnPlayStateChange((state) =>
		{
			if (this.syncManager.status !== "connected")
			{
				return;
			}

			console.log("[MultiplayerManager] Send play state to server", state);
			void this.syncManager.sendPlayState(state === "playing");
		});
	}

	async PlaySongList(songs: Array<ISong>): Promise<Result<void, unknown>>
	{
		console.log("[MultiplayerManager] Play song list", songs);

		await this.syncManager.sendPlaySongList(songs);
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
		this.queueManager.SetQueue(newQueue, newCurrentIdx);
		return ok();
	}

	async SetLoopMode(mode: LoopMode): Promise<Result<void, unknown>>
	{
		this.queueManager.SetLoopMode(mode);
		return ok();
	}

	async TogglePlayPause(): Promise<Result<void, unknown>>
	{
		const isPlaying = this.audioBackend.playState === "playing";
		await this.syncManager.sendPlayState(!isPlaying);

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

	OnPositionUpdate(callback: (positionSeconds: number) => void): void
	{
		this.audioBackend.OnPositionUpdate(callback);
	}

	OnDurationChange(callback: (durationSeconds: number) => void): void
	{
		this.audioBackend.OnDurationChange(callback);
	}
}

