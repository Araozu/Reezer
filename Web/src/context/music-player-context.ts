import { getContext, setContext } from "svelte";
import type { IAudioBackend } from "~/player2/interfaces/IAudioBackend";
import type { IQueue } from "~/player2/interfaces/IQueue";
import type { SyncPlayerManager } from "~/player2/managers/SyncPlayerManager.svelte";

const AUDIO_CONTEXT_KEY = "audio";
const QUEUE_CONTEXT_KEY = "queue";
const SYNC_PLAYER_MANAGER_KEY = "sync-player-manager";

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

export function SetSyncPlayerManagerContext(manager: SyncPlayerManager)
{
	setContext(SYNC_PLAYER_MANAGER_KEY, manager);
}

export function GetSyncPlayerManagerContext(): SyncPlayerManager
{
	return getContext<SyncPlayerManager>(SYNC_PLAYER_MANAGER_KEY);
}
