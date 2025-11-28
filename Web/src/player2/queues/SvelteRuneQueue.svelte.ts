import type { IQueue } from "../interfaces/IQueue";
import type { ISong } from "~/providers";

/**
 * Wraps a IQueue to provide Svelte store compatibility.
 */
export class SvelteRuneQueue
{
	public queue = $state<Array<ISong>>([]);
	public currentIdx = $state(-1);

	constructor(private IQueue: IQueue)
	{}

	// TODO: setup listeners & update svelte signals
}
