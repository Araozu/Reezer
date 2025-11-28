import type { ISong } from "~/providers";
import type { IQueue } from "../interfaces/IQueue";
import type { IAudioBackend } from "../interfaces/IAudioBackend";

/**
 * A regular queue implementation
 */
export class GeneralPurposeQueue implements IQueue
{
	queueState: ISong[];

	constructor(private readonly audioBackend: IAudioBackend)
	{
		//
	}

	PlaySong(song: ISong): void
	{
		throw new Error("Method not implemented.");
	}

	PlaySongList(songs: Array<ISong>): void
	{
		throw new Error("Method not implemented.");
	}

	AddLastSong(song: ISong): void
	{
		throw new Error("Method not implemented.");
	}

	AddLastSongList(song: Array<ISong>): void
	{
		throw new Error("Method not implemented.");
	}

	AddNextSong(song: ISong): void
	{
		throw new Error("Method not implemented.");
	}

	AddNextSongList(song: Array<ISong>): void
	{
		throw new Error("Method not implemented.");
	}

	Next(): void
	{
		throw new Error("Method not implemented.");
	}

	Prev(): void
	{
		throw new Error("Method not implemented.");
	}

	PlayIdx(idx: number): void
	{
		throw new Error("Method not implemented.");
	}

	ClearQueue(): void
	{
		throw new Error("Method not implemented.");
	}
}
