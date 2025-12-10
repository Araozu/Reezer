import type { ISong } from "../types";
import type { IAudioBackend, PlayState } from "../interfaces/IAudioBackend";
import type { IMediaSession } from "../interfaces/IMediaSession";
import type { IQueue } from "../interfaces/IQueue";

export class BrowserMediaSession implements IMediaSession
{
	constructor(
		private queue: IQueue,
		private backend: IAudioBackend,
	)
	{}

	Init(): void
	{
		if (!("mediaSession" in navigator))
		{
			console.warn("MediaSession API not supported");
			return;
		}

		navigator.mediaSession.setActionHandler("play", () =>
		{
			this.backend.TogglePlayPause();
		});

		navigator.mediaSession.setActionHandler("pause", () =>
		{
			this.backend.TogglePlayPause();
		});

		navigator.mediaSession.setActionHandler("nexttrack", () =>
		{
			this.queue.Next();
		});

		navigator.mediaSession.setActionHandler("previoustrack", () =>
		{
			this.queue.Prev();
		});

		navigator.mediaSession.setActionHandler("seekto", (details) =>
		{
			if (details.seekTime !== undefined)
			{
				this.backend.Seek(details.seekTime);
			}
		});

		this.queue.OnQueueChanged(() =>
		{
			const song = this.queue.currentSong;
			if (song)
			{
				this.UpdateMetadata(song);
			}
			else
			{
				this.ClearMetadata();
			}
		});

		this.backend.OnPlayStateChange((state) =>
		{
			this.UpdatePlaybackState(state);
		});

		this.backend.OnPositionUpdate((position) =>
		{
			const duration = this.backend.duration;
			if (duration !== null)
			{
				this.UpdatePosition(position, duration);
			}
		});

		this.backend.OnDurationChange((duration) =>
		{
			this.UpdatePosition(0, duration);
		});
	}

	UpdateMetadata(song: ISong, artwork?: string): void
	{
		if (!("mediaSession" in navigator)) return;

		const artworkArray = artwork
			? [
				{ src: artwork, sizes: "96x96", type: "image/jpeg" },
				{ src: artwork, sizes: "128x128", type: "image/jpeg" },
				{ src: artwork, sizes: "192x192", type: "image/jpeg" },
				{ src: artwork, sizes: "256x256", type: "image/jpeg" },
				{ src: artwork, sizes: "384x384", type: "image/jpeg" },
				{ src: artwork, sizes: "512x512", type: "image/jpeg" },
			  ]
			: [];

		navigator.mediaSession.metadata = new MediaMetadata({
			title: song.name,
			artist: song.artist || "Unknown Artist",
			album: song.album || "Unknown Album",
			artwork: artworkArray,
		});
	}

	UpdatePlaybackState(state: PlayState): void
	{
		if (!("mediaSession" in navigator)) return;

		if (state === "playing")
		{
			navigator.mediaSession.playbackState = "playing";
		}
		else if (state === "paused")
		{
			navigator.mediaSession.playbackState = "paused";
		}
		else
		{
			navigator.mediaSession.playbackState = "playing";
		}
	}

	UpdatePosition(position: number, duration: number): void
	{
		if (!("mediaSession" in navigator)) return;
		if (!("setPositionState" in navigator.mediaSession)) return;

		try
		{
			navigator.mediaSession.setPositionState({
				duration: duration,
				playbackRate: 1.0,
				position: position,
			});
		}
		catch (e)
		{
			console.warn("Failed to set position state:", e);
		}
	}
	ClearMetadata(): void
	{
		if (!("mediaSession" in navigator)) return;
		navigator.mediaSession.metadata = null;
	}
}
