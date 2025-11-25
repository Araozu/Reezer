export interface IAudioBackend {
  load(url: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(position: number): void;

  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;

  setVolume(level: number): void;
  getVolume(): number;

  on(event: AudioEvent, handler: AudioEventHandler): void;
  off(event: AudioEvent, handler: AudioEventHandler): void;

  dispose(): void;
}

export type AudioEventHandler = () => void;

export enum AudioEvent {
  LOADED = "loaded",
  ENDED = "ended",
  PLAYING = "playing",
  PAUSED = "paused",
  TIME_UPDATE = "timeupdate",
  DURATION_CHANGE = "durationchange",
  WAITING = "waiting",
  CAN_PLAY = "canplay",
  ERROR = "error",
}
