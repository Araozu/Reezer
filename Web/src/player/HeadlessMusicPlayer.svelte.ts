import { type Readable,type  Writable, get } from "svelte/store";
import type { ISong } from "../providers";
import { api } from "../api";
import type { MusicHub } from "~/lib/MusicHub.svelte";

export class HeadlessMusicPlayer
{
	private audioTag = new Audio("/_.opus");
	public audioReady = $state(false);
	public currentSongIdx = $state(0);
	public queue = $state<Array<ISong>>([]);
	public readonly currentSong = $derived(this.queue[this.currentSongIdx] ?? null);

	private lastPreloadId = "";

	constructor(
		public hub: MusicHub | null,
		public isPaused: Writable<boolean>,
		public volume: Writable<number>,
		public currentTime: Writable<number>,
		public duration: Readable<number>,
	)
	{
		this.setupAudioTag();
		hub?.setPlayer(this);

		// schedule song preloading
		setInterval(() =>
		{
			if (get(isPaused)) return;

			const nextSong = this.queue[this.currentSongIdx + 1];
			if (!nextSong) return;

			const current = get(currentTime);
			const total = get(duration);
			const difference = Math.floor(total - current);

			if (difference > 20) return;

			if (this.lastPreloadId === nextSong.id) return;

			this.lastPreloadId = nextSong.id;

			// Actually preload
			api.POST("/api/Songs/{songId}/prepare", {
				params: {
					path: {
						songId: nextSong.id,
					},
				},
			})
				.catch(() =>
				{});
		}, 2500);
	}

	private setupAudioTag()
	{
		this.audioTag.addEventListener("ended", () =>
		{
			this.Next();
		});
	}

	public OverrideTag(el: HTMLAudioElement)
	{
		this.audioTag = el;
		this.setupAudioTag();

		const onclick = () =>
		{
			this.audioTag.play()
				.catch((e) => console.error(e))
				.finally(() =>
				{
					this.audioTag.pause();
					this.audioReady = true;
				});
			document.removeEventListener("click", onclick);
		};
		document.addEventListener("click", onclick);
	}

	/**
	 * Playing a single song clears the remaining queue &
	 * plays the song.
	 */
	public PlaySong(song: ISong, fromServer: boolean = false)
	{
		// send to the backend
		if (!fromServer) this.hub?.playSong(song.id);

		// Clear remaining queue
		const currentSong = this.currentSong;
		if (currentSong !== null)
		{
			this.queue.splice(this.currentSongIdx + 1);
		}
		else
		{
			this.queue = [];
		}

		this.audioTag.pause();
		this.queue.push(song);
		this.currentSongIdx = this.queue.length - 1;
		this.audioTag.src = `/api/Songs/${song.id}/stream`;
		this.audioTag.play().catch((e) => console.error(e));
	}

	public async PlaySongById(songId: string)
	{
		const response = await api.GET("/api/Songs");

		if (response.data)
		{
			const songData = response.data.find((s) => s.id === songId);
			if (songData)
			{
				const song: ISong = {
					id: songData.id,
					name: songData.name,
					artist: songData.artist,
					album: songData.album,
					artistId: songData.artistId,
					albumId: songData.albumId,
				};

				this.PlaySong(song);
			}
		}
	}

	public PlaySongs(songs: ISong[])
	{
		if (songs.length === 0) return;

		this.audioTag.pause();
		this.queue = songs;
		this.currentSongIdx = 0;
		this.audioTag.src = `/api/Songs/${songs[0].id}/stream`;
		this.audioTag.play().catch((e) => console.error(e));
	}

	public AddSongToQueue(song: ISong)
	{
		this.queue.push(song);

		// If nothing is currently playing, start playing this song
		if (this.currentSong === null)
		{
			this.currentSongIdx = 0;
			this.audioTag.src = `/api/Songs/${song.id}/stream`;
			this.audioTag.play().catch((e) => console.error(e));
		}
	}

	public AddSongsToQueue(songs: ISong[])
	{
		if (songs.length === 0) return;

		this.queue.push(...songs);

		// If nothing is currently playing, start playing the first added song
		if (this.currentSong === null)
		{
			this.currentSongIdx = 0;
			this.audioTag.src = `/api/Songs/${songs[0].id}/stream`;
			this.audioTag.play().catch((e) => console.error(e));
		}
	}

	public PlaySongNext(song: ISong)
	{
		// Insert the song right after the current song
		this.queue.splice(this.currentSongIdx + 1, 0, song);

		// If nothing is currently playing, start playing this song
		if (this.currentSong === null)
		{
			this.currentSongIdx = 0;
			this.audioTag.src = `/api/Songs/${song.id}/stream`;
			this.audioTag.play().catch((e) => console.error(e));
		}
	}

	public Next()
	{
		if (this.currentSong === null) return;
		if (this.currentSongIdx === -1 || this.currentSongIdx === this.queue.length - 1) return;

		this.currentSongIdx += 1;
		const nextSong = this.currentSong;
		this.audioTag.src = `/api/Songs/${nextSong.id}/stream`;
		this.audioTag.play().catch((e) => console.error(e));
	}

	public Previous()
	{
		if (this.currentSong === null) return;
		if (this.currentSongIdx === -1 || this.currentSongIdx === 0) return;

		this.currentSongIdx -= 1;
		const previousSong = this.currentSong;
		this.audioTag.src = `/api/Songs/${previousSong.id}/stream`;
		this.audioTag.play().catch((e) => console.error(e));
	}

	public PlaySongAtIndex(index: number)
	{
		if (index < 0 || index >= this.queue.length) return;

		this.currentSongIdx = index;
		const song = this.queue[index];
		this.audioTag.src = `/api/Songs/${song.id}/stream`;
		this.audioTag.play().catch((e) => console.error(e));
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
		if (volume < 0 || volume > 1) throw new Error(`Attemted to set a invalid volume level: ${volume}`);

		this.volume.set(volume);
	}

	public SetCurrentTime(time: number)
	{
		this.currentTime.set(time);
	}
}
