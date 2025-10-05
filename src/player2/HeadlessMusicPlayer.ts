export class HeadlessMusicPlayer
{
	private audioTag: HTMLAudioElement | null = null;

	/**
	 * Initializes the audio tag for the music player.
	 * All audio operations will be performed on this tag.
	 *
	 * It is essential to call this method before using any other functionality of the music player.
	 *
	 * It is essential to perform some user interaction with the audio tag before using it,
	 * as many browsers restrict audio playback without user interaction.
	 *
	 * @param tag The HTMLAudioElement to be used for audio playback.
	 */
	public InitializeAudioTag(tag: HTMLAudioElement)
{
		this.audioTag = tag;
	}

	public DoSomething()
{
		console.log("Doing something in the music player");
	}
}

