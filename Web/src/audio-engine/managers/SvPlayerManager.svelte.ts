import type { IPlayerManager } from "../interfaces/IPlayerManager";
import { type ISong, LoopMode } from "../types";

export class SvPlayerManager
{
	public queue = $state<Readonly<Array<ISong>>>([]);
	public currentIdx = $state(-1);
	public currentSong: ISong | null = $state(null);
	public loopMode = $state(LoopMode.None);

	constructor(public imanager: IPlayerManager)
	{
		this.updateState();
		this.imanager.OnQueueChanged(() => this.updateState());
	}

	private updateState()
	{
		this.queue = this.imanager.GetQueue();
		this.currentIdx = this.imanager.GetCurrentIdx();
		this.currentSong = this.imanager.GetCurrentSong();
		this.loopMode = this.imanager.GetLoopMode();
	}
}

