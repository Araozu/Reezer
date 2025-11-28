import type { ISong } from "~/providers";
import type { IQueue } from "../interfaces/IQueue";
import type { IAudioBackend } from "../interfaces/IAudioBackend";

/**
 * A regular queue implementation
 */
export class GeneralPurposeQueue implements IQueue
{
	private _queueState: Array<ISong> = [];
	private _currentIdx: number = -1;

	// callbacks
	private _onQueueChangedCallbacks: Array<() => void> = [];

	constructor(private readonly audioBackend: IAudioBackend)
	{}

	get queue():Readonly<Array<ISong>>
	{
		return this._queueState;
	}
	get currentSong(): ISong | null
	{
		return this._currentIdx === -1 ? null : this._queueState[this._currentIdx];
	};
	get currentIdx(): number
	{
		return this._currentIdx;
	}

	PlaySong(song: ISong): void
	{
		if (this._currentIdx === -1)
		{
			this._queueState = [song];
			this._currentIdx = 0;
			// this.audioBackend.PlaySong(song);
		}
		else
		{
			this.clearCurrentOnwards();
			this._queueState.push(song);
			this._currentIdx += 1;
			// this.audioBackend.PlaySong(song);
		}
		this.notifyQueueChanged();
		this.updatePlayerState();
	}

	PlaySongList(songs: Array<ISong>): void
	{
		if (this._currentIdx === -1)
		{
			this._queueState = songs;
			this._currentIdx = 0;
			// this.audioBackend.PlaySong(songs[0]);
		}
		else
		{
			this.clearCurrentOnwards();
			this._queueState.push(...songs);
			this._currentIdx += 1;
			// this.audioBackend.PlaySong(songs[0]);
		}
		this.notifyQueueChanged();
		this.updatePlayerState();
	}

	AddLastSong(song: ISong): void
	{
		this._queueState.push(song);
		this.notifyQueueChanged();
	}

	AddLastSongList(song: Array<ISong>): void
	{
		this._queueState.push(...song);
		this.notifyQueueChanged();
	}

	AddNextSong(song: ISong): void
	{
		this._queueState.splice(this._currentIdx + 1, 0, song);
		this.notifyQueueChanged();
	}

	AddNextSongList(song: Array<ISong>): void
	{
		this._queueState.splice(this._currentIdx + 1, 0, ...song);
		this.notifyQueueChanged();
	}

	Next(): void
	{
		throw new Error("Method not implemented.");
	}

	Prev(): void
	{
		throw new Error("Method not implemented.");
	}

	PlayAt(idx: number): void
	{
		throw new Error("Method not implemented.");
	}

	ClearQueue(): void
	{
		throw new Error("Method not implemented.");
	}

	RemoveAt(idx: number): void
	{
		throw new Error("Method not implemented.");
	}

	private clearCurrentOnwards()
	{
		if (this._currentIdx !== -1)
		{
			this._queueState = this._queueState.slice(0, this._currentIdx + 1);
		}
	}

	/**
	 * To be called after a queue state change. Updates the audio backend's player state,
	 * commands it to play the current song, queue next song, etc.
	 */
	private updatePlayerState()
	{
		if (this._currentIdx === -1 || this._currentIdx > this._queueState.length)
		{
			console.error("Queue is empty or currentIdx is out of bounds, cannot update player state");
			return;
		}

		const currentSong = this._queueState[this._currentIdx];
		const nextSong: ISong | null = this._queueState[this._currentIdx] ?? null;

		this.audioBackend.Play(currentSong.id);
		if (nextSong) this.audioBackend.Prefetch(nextSong.id);
	}

	OnQueueChanged(callback: () => void): void
	{
		this._onQueueChangedCallbacks.push(callback);
	}
	private notifyQueueChanged()
	{
		for (const callback of this._onQueueChangedCallbacks)
		{
			callback();
		}
	}

	// FIXME: Add init/deinit methods that also setup the audio backend
}
