import { type Readable,type  Writable, get } from "svelte/store";
import type { ISong } from "../providers";
import { api } from "../api";
import type { MusicHub } from "~/lib/MusicHub.svelte";
import type { IMusicPlayer } from "./IMusicPlayer";

type HeadlessMusicPlayerExtras = boolean;

export class HeadlessMusicPlayer implements IMusicPlayer<HeadlessMusicPlayerExtras>
{
	private audioTag = new Audio("/_.opus");
	public audioReady = $state(false);
	public isBuffering = $state(false);
	public currentSongIdx = $state(0);
	public queue = $state<Array<ISong>>([]);
	public readonly currentSong = $derived(this.queue[this.currentSongIdx] ?? null);

	private lastPreloadId = "";
	private lastPositionUpdateTime = 0;

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

		this.audioTag.addEventListener("waiting", () =>
		{
			this.isBuffering = true;
		});

		this.audioTag.addEventListener("canplay", () =>
		{
			this.isBuffering = false;
		});

		this.audioTag.addEventListener("playing", () =>
		{
			this.isBuffering = false;
			this.updateMediaSessionPlaybackState("playing");
		});

		this.audioTag.addEventListener("pause", () =>
		{
			this.updateMediaSessionPlaybackState("paused");
		});

		this.audioTag.addEventListener("loadstart", () =>
		{
			this.isBuffering = true;
		});

		this.audioTag.addEventListener("timeupdate", () =>
		{
			const now = Date.now();
			if (now - this.lastPositionUpdateTime < 1000) return;
			this.lastPositionUpdateTime = now;
			this.updateMediaSessionPositionState();
		});

		this.audioTag.addEventListener("durationchange", () =>
		{
			this.updateMediaSessionPositionState();
		});

		this.setupMediaSession();
	}

	private setupMediaSession()
	{
		if (!("mediaSession" in navigator)) return;

		navigator.mediaSession.setActionHandler("play", () =>
		{
			this.audioTag.play();
		});

		navigator.mediaSession.setActionHandler("pause", () =>
		{
			this.audioTag.pause();
		});

		navigator.mediaSession.setActionHandler("previoustrack", () =>
		{
			this.Prev();
		});

		navigator.mediaSession.setActionHandler("nexttrack", () =>
		{
			this.Next();
		});

		navigator.mediaSession.setActionHandler("seekbackward", () =>
		{
			this.audioTag.currentTime = Math.max(0, this.audioTag.currentTime - 10);
			this.updateMediaSessionPositionState();
		});

		navigator.mediaSession.setActionHandler("seekforward", () =>
		{
			this.audioTag.currentTime = Math.min(this.audioTag.duration, this.audioTag.currentTime + 10);
			this.updateMediaSessionPositionState();
		});

		navigator.mediaSession.setActionHandler("seekto", (details) =>
		{
			if (details.seekTime !== undefined)
			{
				this.audioTag.currentTime = details.seekTime;
				this.updateMediaSessionPositionState();
			}
		});
	}

	private updateMediaSessionMetadata(song: ISong)
	{
		if (!("mediaSession" in navigator)) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: song.name,
			artist: song.artist,
			album: song.album,
			artwork: [
				{
					src: `/api/Albums/${song.albumId}/cover`,
					sizes: "600x600",
					type: "image/webp",
				},
			],
		});
	}

	private updateMediaSessionPositionState()
	{
		if (!("mediaSession" in navigator)) return;
		if (!("setPositionState" in navigator.mediaSession)) return;

		const duration = this.audioTag.duration;
		const position = this.audioTag.currentTime;

		if (isNaN(duration) || isNaN(position) || duration <= 0) return;

		navigator.mediaSession.setPositionState({
			duration,
			playbackRate: this.audioTag.playbackRate,
			position,
		});
	}

	private updateMediaSessionPlaybackState(state: "none" | "paused" | "playing")
	{
		if (!("mediaSession" in navigator)) return;

		navigator.mediaSession.playbackState = state;
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
	public PlaySong(song: ISong, fromServer?: boolean)
	{
		// send to the backend
		if (!fromServer) this.hub?.playSong(song);

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
		this.updateMediaSessionMetadata(song);
		this.updateMediaSessionPositionState();
		this.audioTag.play().catch((e) => console.error(e));
	}

	public PlaySongList(songs: ISong[], _extra?: boolean)
	{
		if (songs.length === 0) return;

		this.audioTag.pause();
		this.queue = songs;
		this.currentSongIdx = 0;
		this.audioTag.src = `/api/Songs/${songs[0].id}/stream`;
		this.updateMediaSessionMetadata(songs[0]);
		this.updateMediaSessionPositionState();
		this.audioTag.play().catch((e) => console.error(e));
	}

	public AddLastSong(song: ISong, _extra?: boolean)
	{
		this.queue.push(song);

		// If nothing is currently playing, start playing this song
		if (this.currentSong === null)
		{
			this.currentSongIdx = 0;
			this.audioTag.src = `/api/Songs/${song.id}/stream`;
			this.updateMediaSessionMetadata(song);
			this.updateMediaSessionPositionState();
			this.audioTag.play().catch((e) => console.error(e));
		}
	}

	public AddLastSongList(songs: ISong[], _extra?: boolean)
	{
		if (songs.length === 0) return;

		this.queue.push(...songs);

		// If nothing is currently playing, start playing the first added song
		if (this.currentSong === null)
		{
			this.currentSongIdx = 0;
			this.audioTag.src = `/api/Songs/${songs[0].id}/stream`;
			this.updateMediaSessionMetadata(songs[0]);
			this.updateMediaSessionPositionState();
			this.audioTag.play().catch((e) => console.error(e));
		}
	}

	public AddNextSong(song: ISong, _extra?: boolean)
	{
		// Insert the song right after the current song
		this.queue.splice(this.currentSongIdx + 1, 0, song);

		// If nothing is currently playing, start playing this song
		if (this.currentSong === null)
		{
			this.currentSongIdx = 0;
			this.audioTag.src = `/api/Songs/${song.id}/stream`;
			this.updateMediaSessionMetadata(song);
			this.updateMediaSessionPositionState();
			this.audioTag.play().catch((e) => console.error(e));
		}
	}

	public AddNextSongList(songs: ISong[], _extra?: boolean)
	{
		if (songs.length === 0) return;

		// Insert all songs right after the current song
		this.queue.splice(this.currentSongIdx + 1, 0, ...songs);

		// If nothing is currently playing, start playing the first added song
		if (this.currentSong === null)
		{
			this.currentSongIdx = 0;
			this.audioTag.src = `/api/Songs/${songs[0].id}/stream`;
			this.updateMediaSessionMetadata(songs[0]);
			this.updateMediaSessionPositionState();
			this.audioTag.play().catch((e) => console.error(e));
		}
	}

	public Next(_extra?: boolean)
	{
		if (this.currentSong === null) return;
		if (this.currentSongIdx === -1 || this.currentSongIdx === this.queue.length - 1) return;

		this.currentSongIdx += 1;
		const nextSong = this.currentSong;
		this.audioTag.src = `/api/Songs/${nextSong.id}/stream`;
		this.updateMediaSessionMetadata(nextSong);
		this.updateMediaSessionPositionState();
		this.audioTag.play().catch((e) => console.error(e));
	}

	public Prev(_extra?: boolean)
	{
		if (this.currentSong === null) return;
		if (this.currentSongIdx === -1 || this.currentSongIdx === 0) return;

		this.currentSongIdx -= 1;
		const previousSong = this.currentSong;
		this.audioTag.src = `/api/Songs/${previousSong.id}/stream`;
		this.updateMediaSessionMetadata(previousSong);
		this.updateMediaSessionPositionState();
		this.audioTag.play().catch((e) => console.error(e));
	}

	public PlayIdx(index: number, _extra?: boolean)
	{
		if (index < 0 || index >= this.queue.length) return;

		this.currentSongIdx = index;
		const song = this.queue[index];
		this.audioTag.src = `/api/Songs/${song.id}/stream`;
		this.updateMediaSessionMetadata(song);
		this.updateMediaSessionPositionState();
		this.audioTag.play().catch((e) => console.error(e));
	}

	public RemoveSongFromQueue(index: number)
	{
		if (index < 0 || index >= this.queue.length) return;

		if (index === this.currentSongIdx)
		{
			this.Next();
		}
		else if (index < this.currentSongIdx)
		{
			this.currentSongIdx -= 1;
		}

		this.queue.splice(index, 1);
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
