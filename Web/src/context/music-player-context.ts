import { getContext, setContext } from "svelte";
import type { IPlayerManager } from "~/audio-engine/interfaces/IPlayerManager";
import type { SvPlayerManager } from "~/audio-engine/managers/SvPlayerManager.svelte";
import type { SyncPlayerManager } from "~/audio-engine/managers/SyncPlayerManager.svelte";

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

export function SetSyncRoomManagerContext(manager: SyncPlayerManager)
{
	setContext(SYNC_ROOM_MANAGER_KEY, manager);
}

export function GetSyncRoomManagerContext(): SyncPlayerManager
{
	return getContext<SyncPlayerManager>(SYNC_ROOM_MANAGER_KEY);
}

