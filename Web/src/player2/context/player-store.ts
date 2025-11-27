import { getContext, setContext } from "svelte";
import type { IAudioBackend } from "../interfaces/IAudioBackend";

const AUDIO_CONTEXT_KEY = "audio";

export function SetPlayerContext(audioBackend: IAudioBackend)
{
	setContext(AUDIO_CONTEXT_KEY, audioBackend);
}

export function GetPlayerContext(): IAudioBackend
{
	return getContext<IAudioBackend>(AUDIO_CONTEXT_KEY);
}
