import { getContext, setContext } from "svelte";
import type { IPlayerManager } from "~/audio-engine/interfaces/IPlayerManager";

const SYNC_PLAYER_MANAGER_KEY = "sync-player-manager";

export function SetPlayerManagerContext(manager: IPlayerManager)
{
	setContext(SYNC_PLAYER_MANAGER_KEY, manager);
}

export function GetPlayerManagerContext(): IPlayerManager
{
	return getContext<IPlayerManager>(SYNC_PLAYER_MANAGER_KEY);
}
