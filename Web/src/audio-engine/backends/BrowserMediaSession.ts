import type { ISong } from "../types";
import type { IAudioBackend, PlayState } from "../interfaces/IAudioBackend";
import type { IMediaSession } from "../interfaces/IMediaSession";
import type { IQueue } from "../interfaces/IQueue";

export class BrowserMediaSession implements IMediaSession
{
	private lastPosition = 0;
	private queueChangedCallback: (() => void) | null = null;
	private playStateChangeCallback: ((state: PlayState) => void) | null = null;
	private positionUpdateCallback: ((position: number) => void) | null = null;
	private durationChangeCallback: ((duration: number) => void) | null = null;

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

		this.queueChangedCallback = () =>
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
		};
		this.queue.OnQueueChanged(this.queueChangedCallback);

		this.playStateChangeCallback = (state) =>
		{
			this.UpdatePlaybackState(state);
		};
		this.backend.OnPlayStateChange(this.playStateChangeCallback);

		this.positionUpdateCallback = (position) =>
		{
			this.lastPosition = position;
			const duration = this.backend.duration;
			if (duration !== null)
			{
				this.UpdatePosition(position, duration);
			}
		};
		this.backend.OnPositionUpdate(this.positionUpdateCallback);

		this.durationChangeCallback = (duration) =>
		{
			this.UpdatePosition(this.lastPosition, duration);
		};
		this.backend.OnDurationChange(this.durationChangeCallback);
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

	Deinit(): void
	{
		console.log("[BrowserMediaSession] Deinit called");
		if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

		navigator.mediaSession.setActionHandler("play", null);
		navigator.mediaSession.setActionHandler("pause", null);
		navigator.mediaSession.setActionHandler("nexttrack", null);
		navigator.mediaSession.setActionHandler("previoustrack", null);
		navigator.mediaSession.setActionHandler("seekto", null);

		this.queueChangedCallback = null;
		this.playStateChangeCallback = null;
		this.positionUpdateCallback = null;
		this.durationChangeCallback = null;
	}
}
