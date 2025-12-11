import type { IQueue } from "../interfaces/IQueue";
import { type ISong, LoopMode } from "../types";

/**
 * Wraps a IQueue to provide Svelte store compatibility.
 */
export class SvelteRuneQueue
{
	public queue = $state<Readonly<Array<ISong>>>([]);
	public currentIdx = $state(-1);
	public currentSong: ISong | null = $state(null);
	public loopMode = $state(LoopMode.None);

	constructor(iqueue: IQueue)
	{
		this.queue = iqueue.queue;
		this.currentIdx = iqueue.currentIdx;
		this.currentSong = iqueue.currentSong;
		this.loopMode = iqueue.loopMode;

		iqueue.OnQueueChanged(() =>
		{
			this.queue = iqueue.queue;
			this.currentIdx = iqueue.currentIdx;
			this.currentSong = iqueue.currentSong;
			this.loopMode = iqueue.loopMode;
		});
	}
}
