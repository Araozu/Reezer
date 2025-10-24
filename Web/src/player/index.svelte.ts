import { getContext, setContext } from "svelte";
import { HeadlessMusicPlayer } from "./HeadlessMusicPlayer.svelte";
import type { Readable, Writable } from "svelte/store";

const playerKey = Symbol("music_player");

export function CreatePlayerContext(
	paused: Writable<boolean>,
	volume: Writable<number>,
	currentTime: Writable<number>,
	duration: Readable<number>,
)
{
	const player = new HeadlessMusicPlayer(paused, volume, currentTime, duration);
	setContext(playerKey, player);
	return player;
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

