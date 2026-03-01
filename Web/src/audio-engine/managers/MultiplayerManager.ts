import { ok, type Result } from "neverthrow";
import type { IAudioBackend, PlayState } from "../interfaces/IAudioBackend";
import type { Action, IPlayerManager } from "../interfaces/IPlayerManager";
import type { ISong, LoopMode } from "../types";
import type { IQueue } from "../interfaces/IQueue";
import type { IMediaSession } from "../interfaces/IMediaSession";
import type { IAudioSource } from "../interfaces/IAudioSource";
import { GeneralPurposeQueue } from "../queues/GeneralPurposeQueue";
import { BrowserMediaSession } from "../backends/BrowserMediaSession";
import type { SyncManager } from "./SyncManager.svelte";
import { WebAudioBackend } from "../backends/WebAudioBackend";

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

	/**
	 * Tracks the local timestamp of the most recent seek command sent to the server.
	 * Used to discard stale PlayStateChanged events that predate our seek.
	 */
	private lastSeekSentAt: number = 0;

	constructor(audioSource: IAudioSource, syncManager: SyncManager)
	{
		this.syncManager = syncManager;
		this.audioBackend = new WebAudioBackend(audioSource);
		this.queueManager = new GeneralPurposeQueue(this.audioBackend);

		// Setup music player
		this.mediaSession = new BrowserMediaSession(this.queueManager, this.audioBackend);
		this.mediaSession.Init();

		// Listen for remote queue changes
		this.syncManager.onQueueChanged(async(queue, currentIdx, isPlaying, position, serverTime) =>
		{
			console.log("[MultiplayerManager] Set queue from server", queue, currentIdx);

			await this.queueManager.SetQueue(queue, currentIdx);

			const projectedPosition = this.calculateProjectedPosition(isPlaying, position, serverTime);
			console.log("[MultiplayerManager] Projected position (queue change):", projectedPosition);

			this.audioBackend.Seek(projectedPosition);

			if (isPlaying) this.audioBackend.Resume();
			else this.audioBackend.Pause();
		});

		// Listen for initial room state
		this.syncManager.onRoomState(async(state) =>
		{
			console.log("[MultiplayerManager] Set initial room state from server", state);

			await this.queueManager.SetQueue(state.queue, state.currentIndex);

			const projectedPosition = this.calculateProjectedPosition(
				state.isPlaying,
				state.currentPosition,
				state.lastUpdateServerTime,
			);
			console.log("[MultiplayerManager] Projected position (initial):", projectedPosition);

			this.audioBackend.Seek(projectedPosition);

			if (state.isPlaying) this.audioBackend.Resume();
			else this.audioBackend.Pause();
		});

		// Listen for remote play state changes
		this.syncManager.onPlayStateChanged((isPlaying, position, serverTime) =>
		{
			console.log(
				">> [MultiplayerManager]    Set play state from server, isPlaying: ",
				isPlaying,
				"position:",
				position,
				"serverTime:",
				serverTime,
			);

			// Discard events that were issued before our last seek — they carry stale positions.
			// `lastSeekSentAt` is in local ms; convert to estimated server time for comparison.
			// A 500ms grace period covers the round-trip before the server echoes our seek back.
			if (this.lastSeekSentAt > 0)
			{
				const lastSeekServerTime = this.syncManager.localToServerTime(this.lastSeekSentAt);
				if (serverTime < lastSeekServerTime - 500)
				{
					console.log(`[MultiplayerManager] Discarding stale PlayStateChanged (serverTime ${serverTime} predates seek at ${lastSeekServerTime})`);
					return;
				}
			}

			const projectedPosition = this.calculateProjectedPosition(isPlaying, position, serverTime);
			console.log(">> [MultiplayerManager]    Projected position (play state):", projectedPosition);

			// Only seek if we are far enough from the projected position (e.g. > 1.5 seconds)
			// to avoid stuttering on every state update
			const currentPos = this.audioBackend.position;
			const drift = Math.abs(currentPos - projectedPosition);

			if (drift > 1500 || !isPlaying)
			{
				console.log(`[MultiplayerManager] Drift detected (${drift}ms). Seeking to ${projectedPosition}ms.`);
				this.audioBackend.Seek(projectedPosition);
			}
			else
			{
				console.log(`[MultiplayerManager] Drift within tolerance (${drift}ms). Skipping seek.`);
			}

			if (isPlaying) this.audioBackend.Resume();
			else this.audioBackend.Pause();
		});
	}

	async PlaySongList(songs: Array<ISong>): Promise<Result<void, unknown>>
	{
		console.log("   [MultiplayerManager] >> Play song list:", songs);

		await this.syncManager.sendPlaySongList(songs);
		return ok();
	}

	async AddLastSong(song: ISong): Promise<Result<void, unknown>>
	{
		console.log("   [MultiplayerManager] >> Add last song:", song);
		await this.syncManager.sendAddSongsToQueue([song], "Last");
		return ok();
	}

	async AddLastSongList(songs: Array<ISong>): Promise<Result<void, unknown>>
	{
		console.log("   [MultiplayerManager] >> Add last song list:", songs);
		await this.syncManager.sendAddSongsToQueue(songs, "Last");
		return ok();
	}

	async AddNextSong(song: ISong): Promise<Result<void, unknown>>
	{
		console.log("   [MultiplayerManager] >> Add next song:", song);
		await this.syncManager.sendAddSongsToQueue([song], "Next");
		return ok();
	}

	async AddNextSongList(songs: Array<ISong>): Promise<Result<void, unknown>>
	{
		console.log("   [MultiplayerManager] >> Add next song list:", songs);
		await this.syncManager.sendAddSongsToQueue(songs, "Next");
		return ok();
	}

	async Next(): Promise<Result<void, unknown>>
	{
		throw new Error("Not migrated to server");
		return ok();
	}

	async Prev(): Promise<Result<void, unknown>>
	{
		throw new Error("Not migrated to server");
		return ok();
	}

	async PlayAt(idx: number): Promise<Result<void, unknown>>
	{
		throw new Error("Not migrated to server");
		return ok();
	}

	async ClearQueue(): Promise<Result<void, unknown>>
	{
		throw new Error("Not migrated to server");
		return ok();
	}

	async RemoveAt(idx: number): Promise<Result<void, unknown>>
	{
		throw new Error("Not migrated to server");
		return ok();
	}

	async SetQueue(newQueue: Array<ISong>, newCurrentIdx: number): Promise<Result<void, unknown>>
	{
		throw new Error("Not migrated to server");
		return ok();
	}

	async SetLoopMode(mode: LoopMode): Promise<Result<void, unknown>>
	{
		throw new Error("Not migrated to server");
		return ok();
	}

	async TogglePlayPause(): Promise<Result<void, unknown>>
	{
		const isPlaying = this.audioBackend.playState === "playing";
		console.log("[MultiplayerManager] >> TogglePlayPause, sending isPlaying:", !isPlaying);
		await this.syncManager.sendPlayState(!isPlaying);

		return ok();
	}

	async Seek(position: number): Promise<Result<void, unknown>>
	{
		console.log("   [MultiplayerManager] >> Seek to", position);
		this.lastSeekSentAt = Date.now();
		await this.syncManager.sendSeek(position);
		return ok();
	}

	private calculateProjectedPosition(
		isPlaying: boolean,
		serverPosition: number,
		lastUpdateServerTime: number,
	): number
	{
		return this.syncManager.getInterpolatedPosition(
			isPlaying,
			serverPosition,
			lastUpdateServerTime,
		);
	}

	HasPermission(action: Action): boolean
	{
		void action;
		return true;
	}

	async PlaySong(song: ISong): Promise<Result<void, unknown>>
	{
		console.log("   [MultiplayerManager] >> Play song:", song);
		await this.syncManager.sendPlaySongList([song]);
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
