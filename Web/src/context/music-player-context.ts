import { getContext, setContext } from "svelte";
import type { IPlayerManager } from "~/audio-engine/interfaces/IPlayerManager";
import type { SvPlayerManager } from "~/audio-engine/managers/SvPlayerManager.svelte";
import type { SyncManager } from "~/audio-engine/managers/SyncManager.svelte";

const SYNC_PLAYER_MANAGER_KEY = "sync-player-manager";
const SYNC_SV_MANAGER_KEY = "sync-sv-manager";
const SYNC_ROOM_MANAGER_KEY = "sync-room-manager";

export function SetPlayerManagerContext(manager: IPlayerManager)
{
	setContext(SYNC_PLAYER_MANAGER_KEY, manager);
}

export function GetPlayerManagerContext(): IPlayerManager
{
	return getContext<IPlayerManager>(SYNC_PLAYER_MANAGER_KEY);
}

export function SetSvelteManagerContext(manager: SvPlayerManager)
{
	setContext(SYNC_SV_MANAGER_KEY, manager);
}

export function GetSvelteManagerContext(): SvPlayerManager
{
	return getContext<SvPlayerManager>(SYNC_SV_MANAGER_KEY);
}

export function SetSyncRoomManagerContext(manager: SyncManager)
{
	setContext(SYNC_ROOM_MANAGER_KEY, manager);
}

export function GetSyncRoomManagerContext(): SyncManager
{
	return getContext<SyncManager>(SYNC_ROOM_MANAGER_KEY);
}

