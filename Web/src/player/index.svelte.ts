import { getContext, setContext } from "svelte";
import { HeadlessMusicPlayer } from "./HeadlessMusicPlayer.svelte";

const playerKey = Symbol("music_player");

export function CreatePlayerContext()
{
	const player = new HeadlessMusicPlayer();
	setContext(playerKey, player);
}

export function GetCurrentPlayer(): HeadlessMusicPlayer
{
	const player = getContext<HeadlessMusicPlayer | undefined>(playerKey);
	if (!player)
{
		throw new Error("No music player context found. Ensure that CreatePlayerContext has been called in a parent component.");
	}

	return player;
}

