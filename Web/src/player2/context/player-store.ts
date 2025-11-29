import { getContext, setContext } from "svelte";
import type { IAudioBackend } from "../interfaces/IAudioBackend";
import type { IQueue } from "../interfaces/IQueue";

const AUDIO_CONTEXT_KEY = "audio";
const QUEUE_CONTEXT_KEY = "queue";

// FIXME: Remove context for audio backend, should use the IQueue instead
export function SetPlayerContext(audioBackend: IAudioBackend)
{
	setContext(AUDIO_CONTEXT_KEY, audioBackend);
}

export function GetPlayerContext(): IAudioBackend
{
	return getContext<IAudioBackend>(AUDIO_CONTEXT_KEY);
}

export function SetQueueContext(queue: IQueue)
{
	setContext(QUEUE_CONTEXT_KEY, queue);
}

export function GetQueueContext(): IQueue
{
	return getContext<IQueue>(QUEUE_CONTEXT_KEY);
}
