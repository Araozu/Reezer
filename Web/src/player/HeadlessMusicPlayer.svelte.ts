import type { Readable, Writable } from "svelte/store";
import type { ISong } from "../providers";

export class HeadlessMusicPlayer
{
	private audioTag = new Audio("/_.opus");
	public currentSongIdx = $state(0);
	public queue = $state<Array<ISong>>([]);
	public readonly currentSong = $derived(this.queue[this.currentSongIdx] ?? null)

	constructor(
		public isPaused: Writable<boolean>,
		public volume: Writable<number>,
		public currentTime: Writable<number>,
		public duration: Readable<number>,
	)
	{
		this.setupAudioTag();
	}

	private setupAudioTag()
	{
		this.audioTag.addEventListener("ended", () => {
			this.Next();
		});
	}

	public OverrideTag(el: HTMLAudioElement)
	{
		this.audioTag = el;
		this.setupAudioTag();

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
			this.queue.splice(this.currentSongIdx + 1)
		}
		else
		{
			this.queue = [];
		}

		this.audioTag.pause();
		this.queue.push(song);
		this.currentSongIdx = this.queue.length - 1;
		this.audioTag.src = `/api/Songs/${song.id}/stream`;
		this.audioTag.play().catch(e => console.error(e));
	}

	public PlaySongs(songs: ISong[])
	{
		if (songs.length === 0) return;

		this.audioTag.pause();
		this.queue = songs;
		this.currentSongIdx = 0;
		this.audioTag.src = `/api/Songs/${songs[0].id}/stream`;
		this.audioTag.play().catch(e => console.error(e));
	}

	public Next()
	{
		if (this.currentSong === null) return;
		if (this.currentSongIdx === -1 || this.currentSongIdx === this.queue.length - 1) return;

		this.currentSongIdx += 1;
		const nextSong = this.currentSong;
		this.audioTag.src = `/api/Songs/${nextSong.id}/stream`;
		this.audioTag.play().catch(e => console.error(e));
	}

	public Previous()
	{
		if (this.currentSong === null) return;
		if (this.currentSongIdx === -1 || this.currentSongIdx === 0) return;

		this.currentSongIdx -= 1;
		const previousSong = this.currentSong;
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
