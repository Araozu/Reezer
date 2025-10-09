import type { Readable, Writable } from "svelte/store";
import type { ISong } from "../providers";

export class HeadlessMusicPlayer
{
	private audioTag = new Audio("/_.opus");
	public currentSong = $state<ISong | null>(null);

	constructor(
		public isPaused: Writable<boolean>,
		public volume: Writable<number>,
		public currentTime: Writable<number>,
		public duration: Readable<number>,
	)
	{}

	public OverrideTag(el: HTMLAudioElement)
	{
		this.audioTag = el;

		const onclick = () => {
			this.audioTag.play()
				.catch(e => console.error(e))
				.finally(() => this.audioTag.pause());
			document.removeEventListener("click", onclick);
		};
		document.addEventListener("click", onclick);
	}

	public PlaySong(song: ISong)
	{
		this.currentSong = song;
		this.audioTag.pause()
		this.audioTag.src = `/api/Songs/${song.id}/stream`;
		this.audioTag.play().catch(e => console.error(e));
	}

	public TogglePlayPause()
	{
		if (this.audioTag.paused)
		{
			this.audioTag.play();
		}
		else
		{
			this.audioTag.pause();
		}
	}

	public SetVolume(volume: number)
	{
		if (volume < 0 || volume > 1) throw new Error("Attemted to set a invalid volume level: " + volume)

		this.volume.set(volume);
	}

	public SetCurrentTime(time: number)
	{
		this.currentTime.set(time)
	}
}
