import type { ISong } from "../providers";

export class HeadlessMusicPlayer
{
	private audioTag = new Audio("/_.opus");
	public currentSong = $state<ISong | null>(null);

	constructor()
	{
		const onclick = () => {
			this.audioTag.play()
				.catch(e => console.error(e))
				.finally(() => this.audioTag.pause());
			document.removeEventListener("click", onclick);
		};
		document.addEventListener("click", onclick);
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
}
