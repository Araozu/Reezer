import type { ISong } from "../providers";

export class HeadlessMusicPlayer
{
	private audioTag = new Audio("/_.opus");
	public currentSong = $state<ISong | null>(null);
	public volume = $state(33);
	public isPaused = $derived(true);

	constructor()
	{
		const onclick = () => {
			this.audioTag.play()
				.catch(e => console.error(e))
				.finally(() => this.audioTag.pause());
			document.removeEventListener("click", onclick);
		};
		document.addEventListener("click", onclick);

		// Initialize audio volume with logarithmic scaling
		this.audioTag.volume = Math.pow(this.volume / 100, 2);

		// Initialize pause state
		this.audioTag.addEventListener("pause", () => this.isPaused = true);
		this.audioTag.addEventListener("play", () => this.isPaused = false);
	}

	public DoSomething()
	{
		console.log("Doing something in the music player");
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
		this.volume = Math.max(0, Math.min(100, volume));
		// Convert linear slider position to logarithmic volume perception
		const logarithmicVolume = Math.pow(this.volume / 100, 2);
		this.audioTag.volume = logarithmicVolume;
	}
}
