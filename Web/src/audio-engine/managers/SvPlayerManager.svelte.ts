import type { IPlayerManager } from "../interfaces/IPlayerManager";
import { type ISong, LoopMode } from "../types";
import type { PlayState } from "../interfaces/IAudioBackend";

export class SvPlayerManager
{
	public queue = $state<Readonly<Array<ISong>>>([]);
	public currentIdx = $state(-1);
	public currentSong: ISong | null = $state(null);
	public loopMode = $state(LoopMode.None);
	public playState = $state<PlayState>("paused");
	public duration = $state<number | null>(null);
	public position = $state(0);

	constructor(public imanager: IPlayerManager)
	{
		this.updateState();
		this.imanager.OnQueueChanged(() => this.updateState());
		this.imanager.OnPlayStateChanged((state) => (this.playState = state));
		this.imanager.OnPositionUpdate((pos) => (this.position = pos));
		this.imanager.OnDurationChange((dur) => (this.duration = dur));
	}

	private updateState()
	{
		this.queue = this.imanager.GetQueue();
		this.currentIdx = this.imanager.GetCurrentIdx();
		this.currentSong = this.imanager.GetCurrentSong();
		this.loopMode = this.imanager.GetLoopMode();
		this.playState = this.imanager.GetPlayState();
		this.duration = this.imanager.GetDuration();
		this.position = this.imanager.GetPosition();
	}
}

