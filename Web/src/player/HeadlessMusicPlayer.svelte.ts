import type { Readable, Writable } from "svelte/store";
import type { ISong } from "../providers";

export class HeadlessMusicPlayer
{
	private audioTag = new Audio("/_.opus");
	public currentSong = $state<ISong | null>(null);
	public queue = $state<Array<ISong>>([]);

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

	/**
	 * Playing a single song clears the remaining queue &
	 * plays the song.
	 */
	public PlaySong(song: ISong)
	{
		// Clear remaining queue
		const currentSong = this.currentSong;
		if (currentSong !== null)
		{
			const currentSongIdx = this.queue.findIndex(s => s.id === currentSong.id);
			this.queue.splice(currentSongIdx + 1)
		}
		else
		{
			this.queue = [];
		}

		this.audioTag.pause();
		this.queue.push(song);
		this.currentSong = song;
		this.audioTag.src = `/api/Songs/${song.id}/stream`;
		this.audioTag.play().catch(e => console.error(e));
	}

	public PlaySongs(songs: ISong[])
	{
		if (songs.length === 0) return;

		this.audioTag.pause();
		this.queue = songs;
		this.currentSong = songs[0];
		this.audioTag.src = `/api/Songs/${songs[0].id}/stream`;
		this.audioTag.play().catch(e => console.error(e));
	}

	public Next()
	{
		if (this.currentSong === null) return;

		const currentSongIdx = this.queue.findIndex(s => s.id === this.currentSong!.id);
		if (currentSongIdx === -1 || currentSongIdx === this.queue.length - 1) return;

		const nextSong = this.queue[currentSongIdx + 1];
		this.currentSong = nextSong;
		this.audioTag.src = `/api/Songs/${nextSong.id}/stream`;
		this.audioTag.play().catch(e => console.error(e));
	}

	public Previous()
	{
		if (this.currentSong === null) return;

		const currentSongIdx = this.queue.findIndex(s => s.id === this.currentSong!.id);
		if (currentSongIdx === -1 || currentSongIdx === 0) return;

		const previousSong = this.queue[currentSongIdx - 1];
		this.currentSong = previousSong;
		this.audioTag.src = `/api/Songs/${previousSong.id}/stream`;
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
