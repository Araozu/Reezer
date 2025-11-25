import { AudioEvent, type AudioEventHandler, type IAudioBackend } from "../interfaces";

export class GaplessAudioBackend implements IAudioBackend
{
	private audioElements: [HTMLAudioElement, HTMLAudioElement];
	private activeIndex: 0 | 1 = 0;
	private nextPreloadedUrl: string | null = null;
	private eventHandlers: Map<AudioEvent, Set<AudioEventHandler>> = new Map();
	private _volume: number = 1;

	constructor()
	{
		this.audioElements = [new Audio(), new Audio()];
		this.setupAudioElement(this.audioElements[0]);
		this.setupAudioElement(this.audioElements[1]);
	}

	private get active(): HTMLAudioElement
	{
		return this.audioElements[this.activeIndex];
	}

	private get inactive(): HTMLAudioElement
	{
		return this.audioElements[this.activeIndex === 0 ? 1 : 0];
	}

	private setupAudioElement(audio: HTMLAudioElement): void
	{
		audio.addEventListener("ended", () =>
		{
			if (this.nextPreloadedUrl && audio === this.active)
			{
				this.switchToInactive();
			}
			else
			{
				this.emit(AudioEvent.ENDED);
			}
		});

		audio.addEventListener("loadeddata", () =>
		{
			if (audio === this.active)
			{
				this.emit(AudioEvent.LOADED);
			}
		});

		audio.addEventListener("playing", () =>
		{
			if (audio === this.active)
			{
				this.emit(AudioEvent.PLAYING);
			}
		});

		audio.addEventListener("pause", () =>
		{
			if (audio === this.active)
			{
				this.emit(AudioEvent.PAUSED);
			}
		});

		audio.addEventListener("timeupdate", () =>
		{
			if (audio === this.active)
			{
				this.emit(AudioEvent.TIME_UPDATE);
			}
		});

		audio.addEventListener("durationchange", () =>
		{
			if (audio === this.active)
			{
				this.emit(AudioEvent.DURATION_CHANGE);
			}
		});

		audio.addEventListener("waiting", () =>
		{
			if (audio === this.active)
			{
				this.emit(AudioEvent.WAITING);
			}
		});

		audio.addEventListener("canplay", () =>
		{
			if (audio === this.active)
			{
				this.emit(AudioEvent.CAN_PLAY);
			}
		});

		audio.addEventListener("error", () =>
		{
			if (audio === this.active)
			{
				this.emit(AudioEvent.ERROR);
			}
		});
	}

	private switchToInactive(): void
	{
		const wasPlaying = !this.active.paused;
		this.active.pause();
		this.active.currentTime = 0;
		this.active.src = "";

		this.activeIndex = this.activeIndex === 0 ? 1 : 0;
		this.nextPreloadedUrl = null;

		if (wasPlaying)
		{
			this.active.play();
		}

		this.emit(AudioEvent.PLAYING);
		this.emit(AudioEvent.DURATION_CHANGE);
	}

	async load(url: string): Promise<void>
	{
		this.nextPreloadedUrl = null;
		this.active.src = url;
		this.active.load();
		this.active.volume = this._volume;

		return new Promise((resolve, reject) =>
		{
			const onCanPlay = () =>
			{
				this.active.removeEventListener("canplay", onCanPlay);
				this.active.removeEventListener("error", onError);
				resolve();
			};

			const onError = () =>
			{
				this.active.removeEventListener("canplay", onCanPlay);
				this.active.removeEventListener("error", onError);
				reject(new Error("Failed to load audio"));
			};

			this.active.addEventListener("canplay", onCanPlay);
			this.active.addEventListener("error", onError);
		});
	}

	async play(): Promise<void>
	{
		await this.active.play();
	}

	async pause(): Promise<void>
	{
		this.active.pause();
	}

	seek(position: number): void
	{
		this.active.currentTime = position;
	}

	getCurrentTime(): number
	{
		return this.active.currentTime;
	}

	getDuration(): number
	{
		return this.active.duration || 0;
	}

	isPlaying(): boolean
	{
		return !this.active.paused;
	}

	setVolume(level: number): void
	{
		this._volume = Math.max(0, Math.min(1, level));
		this.audioElements[0].volume = this._volume;
		this.audioElements[1].volume = this._volume;
	}

	getVolume(): number
	{
		return this._volume;
	}

	preloadNext(url: string): void
	{
		this.inactive.src = url;
		this.inactive.load();
		this.inactive.volume = this._volume;
		this.nextPreloadedUrl = url;
	}

	cancelPreload(): void
	{
		this.inactive.src = "";
		this.nextPreloadedUrl = null;
	}

	hasPreloadedNext(): boolean
	{
		return this.nextPreloadedUrl !== null;
	}

	on(event: AudioEvent, handler: AudioEventHandler): void
	{
		if (!this.eventHandlers.has(event))
		{
			this.eventHandlers.set(event, new Set());
		}
		this.eventHandlers.get(event)!.add(handler);
	}

	off(event: AudioEvent, handler: AudioEventHandler): void
	{
		this.eventHandlers.get(event)?.delete(handler);
	}

	private emit(event: AudioEvent): void
	{
		this.eventHandlers.get(event)?.forEach((handler) => handler());
	}

	dispose(): void
	{
		this.audioElements[0].pause();
		this.audioElements[0].src = "";
		this.audioElements[1].pause();
		this.audioElements[1].src = "";
		this.eventHandlers.clear();
	}
}
