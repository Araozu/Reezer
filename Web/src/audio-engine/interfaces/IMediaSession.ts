import type { ISong } from "../types";
import type { PlayState } from "./IAudioBackend";

export interface IMediaSession {
	UpdateMetadata(song: ISong, artwork?: string): void;
	UpdatePlaybackState(state: PlayState): void;
	UpdatePosition(position: number, duration: number): void;
	ClearMetadata(): void;
	Init(): void;
}
