import type { IQueue } from "../interfaces/IQueue";
import type { IAudioBackend } from "../interfaces/IAudioBackend";
import type { ISong } from "../types";

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
	{
		this.audioBackend.OnSongEnd(this.onSongEnd);
	}

	private onSongEnd = () =>
	{
		// Move to next song if available
		if (this._currentIdx < this._queueState.length - 1)
		{
			this._currentIdx += 1;
			this.notifyQueueChanged();
			this.backendPlayAndUpdate();
		}
	};

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
		}
		else
		{
			this.clearCurrentOnwards();
			this._queueState.push(song);
			this._currentIdx += 1;
		}
		this.notifyQueueChanged();
		this.backendPlayAndUpdate();
	}

	PlaySongList(songs: Array<ISong>): void
	{
		if (this._currentIdx === -1)
		{
			this._queueState = songs;
			this._currentIdx = 0;
		}
		else
		{
			this.clearCurrentOnwards();
			this._queueState.push(...songs);
			this._currentIdx += 1;
		}
		this.notifyQueueChanged();
		this.backendPlayAndUpdate();
	}

	AddLastSong(song: ISong): void
	{
		this._queueState.push(song);
		this.notifyQueueChanged();
		this.backendUpdate();
	}

	AddLastSongList(song: Array<ISong>): void
	{
		this._queueState.push(...song);
		this.notifyQueueChanged();
		this.backendUpdate();
	}

	AddNextSong(song: ISong): void
	{
		this._queueState.splice(this._currentIdx + 1, 0, song);
		this.notifyQueueChanged();
		this.backendUpdate();
	}

	AddNextSongList(song: Array<ISong>): void
	{
		this._queueState.splice(this._currentIdx + 1, 0, ...song);
		this.notifyQueueChanged();
		this.backendUpdate();
	}

	Next(): void
	{
		if (this._currentIdx < this._queueState.length - 1)
		{
			this._currentIdx += 1;
			this.notifyQueueChanged();
			this.backendPlayAndUpdate();
		}
	}

	Prev(): void
	{
		if (this._currentIdx > 0)
		{
			this._currentIdx -= 1;
			this.notifyQueueChanged();
			this.backendPlayAndUpdate();
		}
	}

	PlayAt(idx: number): void
	{
		if (idx >= 0 && idx < this._queueState.length)
		{
			this._currentIdx = idx;
			this.notifyQueueChanged();
			this.backendPlayAndUpdate();
		}
	}

	ClearQueue(): void
	{
		this._queueState = [];
		this._currentIdx = -1;
		this.notifyQueueChanged();
		this.audioBackend.ClearPrefetch();
	}

	RemoveAt(idx: number): void
	{
		if (idx < 0 || idx >= this._queueState.length) return;

		this._queueState.splice(idx, 1);

		if (idx < this._currentIdx)
		{
			this._currentIdx -= 1;
		}
		else if (idx === this._currentIdx)
		{
			// Removed the currently playing song
			if (this._currentIdx >= this._queueState.length)
			{
				this._currentIdx = this._queueState.length - 1;
			}
			if (this._currentIdx >= 0)
			{
				this.backendPlayAndUpdate();
			}
		}
		else
		{
			// Removed a song after current, just update prefetch
			this.backendUpdate();
		}

		this.notifyQueueChanged();
	}

	private clearCurrentOnwards()
	{
		if (this._currentIdx !== -1)
		{
			this._queueState = this._queueState.slice(0, this._currentIdx + 1);
		}
	}

	/**
	 * Immediately plays the current song in the backend and prefetches the next one
	 */
	private backendPlayAndUpdate()
	{
		if (this._currentIdx === -1 || this._currentIdx > this._queueState.length)
		{
			console.error("Queue is empty or currentIdx is out of bounds, cannot update player state");
			return;
		}

		const currentSong = this._queueState[this._currentIdx];
		const nextSong: ISong | null = this._queueState[this._currentIdx + 1] ?? null;

		this.audioBackend.Play(currentSong);
		if (nextSong) this.audioBackend.Prefetch(nextSong);
	}

	/**
	 * Updates the prefetched song in the backend. Doesn't alter current playback.
	 */
	private backendUpdate()
	{
		if (this._currentIdx === -1 || this._currentIdx >= this._queueState.length) return;

		const nextSong: ISong | null = this._queueState[this._currentIdx + 1] ?? null;

		if (nextSong) this.audioBackend.Prefetch(nextSong);
		else this.audioBackend.ClearPrefetch();
	}

	SetQueue(newQueue: Array<ISong>, newCurrentIdx: number): void
	{
		this._queueState = newQueue;
		this._currentIdx = newCurrentIdx;
		this.notifyQueueChanged();
		this.backendUpdate();
	}

	OnQueueChanged(callback: () => void): void
	{
		this._onQueueChangedCallbacks.push(callback);
	}
	private notifyQueueChanged()
	{
		this._onQueueChangedCallbacks.forEach((callback) => callback());
	}

	// FIXME: Add init/deinit methods that also setup the audio backend
}
