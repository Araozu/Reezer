import type { Readable } from "svelte/store";
import type { ISong } from "~/providers";

export interface IMusicPlayer {
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(position: number): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;

  playSong(song: ISong): Promise<void>;
  playSongList(songs: ISong[]): Promise<void>;
  addNextSong(song: ISong): Promise<void>;
  addNextSongList(songs: ISong[]): Promise<void>;
  addLastSong(song: ISong): Promise<void>;
  addLastSongList(songs: ISong[]): Promise<void>;
  playQueueIndex(index: number): Promise<void>;
  removeFromQueue(index: number): Promise<void>;

  readonly state: Readable<PlayerState>;
  readonly queue: Readable<ISong[]>;
  readonly currentSong: Readable<ISong | null>;
  readonly currentIndex: Readable<number>;
  readonly position: Readable<number>;
  readonly duration: Readable<number>;
  readonly volume: Readable<number>;
  readonly isPlaying: Readable<boolean>;
  readonly isBuffering: Readable<boolean>;

  setVolume(level: number): void;

  switchStrategy(strategy: PlaybackStrategy): Promise<void>;
  getCurrentStrategy(): PlaybackStrategy;
}

export interface PlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
}

export enum PlaybackStrategy {
  LOCAL = "local",
  REMOTE_SOLO = "remote-solo",
  REMOTE_SYNC = "remote-sync",
}

export enum RepeatMode {
  OFF = "off",
  ALL = "all",
  ONE = "one",
}
