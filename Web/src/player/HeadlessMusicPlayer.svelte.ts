export class HeadlessMusicPlayer
{
	private audioTag = new Audio("/_.opus");

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

	public PlaySong(src: string)
	{
		this.audioTag.pause()
		this.audioTag.src = src;
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
