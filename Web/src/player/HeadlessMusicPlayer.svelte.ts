import type { Readable, Writable } from "svelte/store";
import type { ISong } from "../providers";

export class HeadlessMusicPlayer
{
	private audioTag = new Audio("/_.opus");
	public currentSong = $state<ISong | null>(null);

	constructor(
		public isPaused: Writable<boolean>,
		public volume: Writable<number>,
	)
	{
	}

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
		this.volume.set(volume / 100);

		// Convert linear slider position to logarithmic volume perception
		// const logarithmicVolume = Math.pow(volume / 100, 2);
		// console.log("To set volume:", logarithmicVolume)
		// this.volume.set(logarithmicVolume);
	}
}
