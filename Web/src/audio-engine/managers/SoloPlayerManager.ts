import { ok, type Result } from "neverthrow";
import type { Action, IPlayerManager } from "../interfaces/IPlayerManager";
import type { ISong } from "../types";
import type { IAudioBackend } from "../interfaces/IAudioBackend";
import type { IQueue } from "../interfaces/IQueue";
import { DualAudioBackend } from "../backends/DualAudioBackend";
import type { IAudioSource } from "../interfaces/IAudioSource";
import { GeneralPurposeQueue } from "../queues/GeneralPurposeQueue";
import { BrowserMediaSession } from "../backends/BrowserMediaSession";
import type { IMediaSession } from "../interfaces/IMediaSession";

/**
 * A player manager for solo (local) playback.
 *
 * As this is a solo player, all actions are always permitted.
 */
export class SoloPlayerManager implements IPlayerManager
{
	private readonly audioBackend: IAudioBackend;
	private readonly queueManager: IQueue;
	private readonly mediaSession: IMediaSession;

	constructor(private readonly audioSource: IAudioSource)
	{
		this.audioBackend = new DualAudioBackend(audioSource);
		this.queueManager = new GeneralPurposeQueue(this.audioBackend);

		// Setup music player
		this.mediaSession = new BrowserMediaSession(this.queueManager , this.audioBackend);
		this.mediaSession.Init();
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

	async Init(): Promise<Result<void, unknown>>
	{
		return ok();
	}

	async Deinit(): Promise<void>
	{

	}
}
