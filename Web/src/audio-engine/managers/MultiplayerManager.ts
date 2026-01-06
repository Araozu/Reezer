import type { Result } from "neverthrow";
import type { IAudioBackend, PlayState } from "../interfaces/IAudioBackend";
import type { Action, IPlayerManager } from "../interfaces/IPlayerManager";
import type { ISong, LoopMode } from "../types";
import type { IQueue } from "../interfaces/IQueue";
import type { IMediaSession } from "../interfaces/IMediaSession";
import type { IAudioSource } from "../interfaces/IAudioSource";
import { DualAudioBackend } from "../backends/DualAudioBackend";
import { GeneralPurposeQueue } from "../queues/GeneralPurposeQueue";
import { BrowserMediaSession } from "../backends/BrowserMediaSession";

export class MultiplayerManager implements IPlayerManager
{
	private readonly audioBackend: IAudioBackend;
	private readonly queueManager: IQueue;
	private readonly mediaSession: IMediaSession;

	constructor(audioSource: IAudioSource)
	{
		this.audioBackend = new DualAudioBackend(audioSource);
		this.queueManager = new GeneralPurposeQueue(this.audioBackend);

		// Setup music player
		this.mediaSession = new BrowserMediaSession(this.queueManager , this.audioBackend);
		this.mediaSession.Init();
	}

    Init(): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }

    Deinit(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    HasPermission(action: Action): boolean {
        throw new Error("Method not implemented.");
    }
    PlaySong(song: ISong): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    PlaySongList(songs: Array<ISong>): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    AddLastSong(song: ISong): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    AddLastSongList(songs: Array<ISong>): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    AddNextSong(song: ISong): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    AddNextSongList(songs: Array<ISong>): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    Next(): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    Prev(): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    PlayAt(idx: number): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    ClearQueue(): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    RemoveAt(idx: number): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    SetQueue(newQueue: Array<ISong>, newCurrentIdx: number): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    SetLoopMode(mode: LoopMode): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    TogglePlayPause(): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    Seek(position: number): Promise<Result<void, unknown>> {
        throw new Error("Method not implemented.");
    }
    SetVolume(volume: number): void {
        throw new Error("Method not implemented.");
    }
    GetVolume(): number {
        throw new Error("Method not implemented.");
    }
    GetCurrentSong(): ISong | null {
        throw new Error("Method not implemented.");
    }
    GetQueue(): Readonly<Array<ISong>> {
        throw new Error("Method not implemented.");
    }
    GetCurrentIdx(): number {
        throw new Error("Method not implemented.");
    }
    GetLoopMode(): LoopMode {
        throw new Error("Method not implemented.");
    }
    GetPlayState(): PlayState {
        throw new Error("Method not implemented.");
    }
    GetDuration(): number | null {
        throw new Error("Method not implemented.");
    }
    GetPosition(): number {
        throw new Error("Method not implemented.");
    }
    OnQueueChanged(callback: () => void): void {
        throw new Error("Method not implemented.");
    }
    OnPlayStateChanged(callback: (state: PlayState) => void): void {
        throw new Error("Method not implemented.");
    }
    OnPositionUpdate(callback: (positionSeconds: number) => void): void {
        throw new Error("Method not implemented.");
    }
    OnDurationChange(callback: (durationSeconds: number) => void): void {
        throw new Error("Method not implemented.");
    }
}