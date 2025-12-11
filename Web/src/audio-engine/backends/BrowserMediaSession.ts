import type { ISong } from "../types";
import type { IAudioBackend, PlayState } from "../interfaces/IAudioBackend";
import type { IMediaSession } from "../interfaces/IMediaSession";
import type { IQueue } from "../interfaces/IQueue";

export class BrowserMediaSession implements IMediaSession
{
	private lastPosition = 0;

	constructor(
		private queue: IQueue,
		private backend: IAudioBackend,
	)
	{}

	Init(): void
	{
		if (typeof navigator === "undefined" || !("mediaSession" in navigator))
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
			this.lastPosition = position;
			const duration = this.backend.duration;
			if (duration !== null)
			{
				this.UpdatePosition(position, duration);
			}
		});

		this.backend.OnDurationChange((duration) =>
		{
			this.UpdatePosition(this.lastPosition, duration);
		});
	}

	UpdateMetadata(song: ISong, artwork?: string): void
	{
		if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

		let finalArtwork = artwork;
		if (!finalArtwork)
		{
			if (song.type === "regular" && song.albumId)
			{
				finalArtwork = `/api/Albums/${song.albumId}/cover`;
			}
		}

		const artworkArray = finalArtwork
			? [
				{ src: finalArtwork, sizes: "600x600", type: "image/jpeg" },
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
		if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

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
		if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
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
		if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
		navigator.mediaSession.metadata = null;
	}
}
