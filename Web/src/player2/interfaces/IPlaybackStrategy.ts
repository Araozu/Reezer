import type { ISong } from "~/providers";
import type { IAudioBackend } from "./IAudioBackend";
import type { PlaybackStrategy } from "./IMusicPlayer";

export interface IPlaybackStrategy {
  readonly name: PlaybackStrategy;

  initialize(backend: IAudioBackend): Promise<void>;
  dispose(): Promise<void>;

  play(): Promise<void>;
  pause(): Promise<void>;
  seek(position: number): Promise<void>;
  loadSong(song: ISong): Promise<void>;

  getState(): PlaybackState;

  on(event: PlaybackEvent, handler: PlaybackEventHandler): void;
  off(event: PlaybackEvent, handler: PlaybackEventHandler): void;
}

export interface PlaybackState {
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
}

export type PlaybackEventHandler = () => void;

export enum PlaybackEvent {
  SONG_ENDED = "song-ended",
  PLAYBACK_STARTED = "playback-started",
  PLAYBACK_PAUSED = "playback-paused",
  POSITION_CHANGED = "position-changed",
  DURATION_CHANGED = "duration-changed",
  BUFFERING_STARTED = "buffering-started",
  BUFFERING_ENDED = "buffering-ended",
  ERROR = "error",
}
