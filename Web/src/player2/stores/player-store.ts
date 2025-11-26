import { getContext, setContext } from "svelte";
import type { IAudioBackend } from "../interfaces/IAudioBackend";

const AUDIO_CONTEXT_KEY = "audio";

export function SetPlayerStore(audioBackend: IAudioBackend)
{
	setContext(AUDIO_CONTEXT_KEY, audioBackend);
}

export function GetPlayerStore(): IAudioBackend
{
	return getContext<IAudioBackend>(AUDIO_CONTEXT_KEY);
}
