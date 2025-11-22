import { getContext, setContext } from "svelte";
import { HeadlessMusicPlayer } from "./HeadlessMusicPlayer.svelte";
import type { Readable, Writable } from "svelte/store";
import type { MusicHub } from "~/lib/MusicHub.svelte";

const playerKey = Symbol("music_player");

export function CreatePlayerContext(
	hub: MusicHub | null,
	paused: Writable<boolean>,
	volume: Writable<number>,
	currentTime: Writable<number>,
	duration: Readable<number>,
): HeadlessMusicPlayer
{
	const player = new HeadlessMusicPlayer(hub, paused, volume, currentTime, duration);
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

