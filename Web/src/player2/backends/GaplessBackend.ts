import type { IAudioBackend } from "../interfaces/IAudioBackend";
import type { IAudioSource } from "../interfaces/IAudioSource";

export class GaplessBackend implements IAudioBackend
{
	private _volume: number = 1.0;
	private player1: HTMLAudioElement = null!;
	private player2: HTMLAudioElement = null!;

	private readyCallbacks: Array<() => void> = [];

	constructor(private audioSource: IAudioSource)
	{}

	get volume(): number
	{
		return this._volume;
	}
	set volume(value: number)
	{
		if (value < 0.0 || value > 1.0)
		{
			alert("Volume must be between 0.0 and 1.0");
			throw new RangeError("Volume must be between 0.0 and 1.0");
		}

		this._volume = value;
	}

	async Play(id: string): Promise<void>
	{
		const mediaUrlResult = await this.audioSource.GetTrack(id);
		mediaUrlResult.match(
			(mediaUrl) =>
			{
				this.player1.src = mediaUrl;
				this.player1.play();
			},
			(e) =>
			{
				console.error("Error fetching track:", e);
			},
		);
	}

	TogglePause(): void
	{
		throw new Error("Method not implemented.");
	}

	Seek(position: number): void
	{
		throw new Error(`Method not implemented.${position}`);
	}
	Prefetch(id: string): void
	{
		alert("GaplessBackend.Prefetch is not implemented yet.");
		throw new Error(`Method not implemented.${id}`);
	}
	ClearPrefetch(): void
	{
		throw new Error("Method not implemented.");
	}

	/**
	 * Initializes the backend.
	 *
	 * This method **MUST** be called by a organic click event,
	 * to allow audio playback in browsers.
	 */
	Init(): void
	{
		this.player1 = new Audio();
		this.player2 = new Audio();
		this.player1.volume = this._volume;
		this.player2.volume = this._volume;

		this.readyCallbacks.forEach((callback) => callback());
	}

	OnReady(callback: () => void): void
	{
		this.readyCallbacks.push(callback);
	}

	/**
	 * Releases all resources held by the backend.
	 */
	Deinit(): void
	{
		// noop
	}
}
