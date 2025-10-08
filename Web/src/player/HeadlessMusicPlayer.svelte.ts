export class HeadlessMusicPlayer
{
	private audioTag: HTMLAudioElement | null = null;

	// Bindings for svelte
	public paused = $state(true);
	public ready = $state(false);

	/**
	 * Initializes the audio tag for the music player.
	 * All audio operations will be performed on this tag.
	 *
	 * It is essential to call this method before using any other functionality of the music player.
	 *
	 * @param tag The HTMLAudioElement to be used for audio playback.
	 */
	public InitializeAudioTag(tag: HTMLAudioElement)
	{
		this.audioTag = tag;
		this.ready = true;
	}

	/**
	 * Plays and pauses the audio playback.
	 * This method must be called on a user interaction event (e.g., button click)
	 * to comply with browser autoplay policies.
	 */
	public SetupOnClick()
	{
		if (!this.audioTag) throw new Error("Audio tag not initialized. Call InitializeAudioTag first.");

		this.audioTag.play().finally(() => this.audioTag?.pause());
	}

	public DoSomething()
	{
		console.log("Doing something in the music player");
	}

	public SetSong(src: string)
	{
		if (!this.audioTag) throw new Error("Audio tag not initialized. Call InitializeAudioTag first. (when calling SetSong)");
	
		this.audioTag.src = src;
	}

	public TogglePlayPause()
	{
		if (!this.audioTag) throw new Error("Audio tag not initialized. Call InitializeAudioTag first. (when calling TogglePlayPause)");

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

