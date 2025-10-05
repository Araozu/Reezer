import { getContext, setContext } from "svelte";
import { HeadlessMusicPlayer } from "./HeadlessMusicPlayer";

const playerKey = Symbol("music_player");

export function CreatePlayerContext()
{
	const player = new HeadlessMusicPlayer();
	setContext(playerKey, player);
}

export function GetCurrentPlayer()
{
	return getContext<HeadlessMusicPlayer>(playerKey);
	//
}

