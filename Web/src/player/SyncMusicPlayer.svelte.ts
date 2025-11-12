import type { ISong } from "~/providers";
import type { IMusicPlayer } from "./IMusicPlayer";
import type { Readable, Writable } from "svelte/store";

type SyncMusicPlayerOpts = never

export class SyncMusicPlayer implements IMusicPlayer<SyncMusicPlayerOpts>
{
	private audio_tag = null as unknown as HTMLAudioElement;
	public ready = $state(false);
	public idx = $state(0);
	public queue = $state<Array<ISong>>([]);
	public readonly current_song = $derived(this.queue[this.idx] ?? null);

	constructor(
		public isPaused: Writable<boolean>,
		public volume: Writable<number>,
		public currentTime: Writable<number>,
		public duration: Readable<number>,
	)
	{}

	public Init(el: HTMLAudioElement)
	{
		this.audio_tag = el;

		const onclick = () =>
		{
			this.audio_tag.play()
				.catch((e) => console.error(e))
				.finally(() =>
				{
					this.audio_tag.pause();
					this.ready = true;
				});
			document.removeEventListener("click", onclick);
		};
		document.addEventListener("click", onclick);
	}

	/**
	 * Plays the song at the current idx of the queue.
	 * All other methods should use this one for playing
	 */
	private PlayCurrent()
	{
		// FIXME: implement
	}
}
