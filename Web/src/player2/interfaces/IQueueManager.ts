import type { ISong } from "~/providers";
import type { RepeatMode } from "./IMusicPlayer";

export interface IQueueManager {
  setQueue(songs: ISong[]): void;
  addNext(songs: ISong[]): void;
  addLast(songs: ISong[]): void;
  remove(index: number): void;
  clear(): void;
  move(from: number, to: number): void;

  getCurrentIndex(): number;
  setCurrentIndex(index: number): void;
  hasNext(): boolean;
  hasPrevious(): boolean;
  getNext(): ISong | null;
  getPrevious(): ISong | null;
  getCurrent(): ISong | null;

  setRepeatMode(mode: RepeatMode): void;
  setShuffleEnabled(enabled: boolean): void;

  getQueue(): ISong[];

  on(event: QueueEvent, handler: QueueEventHandler): void;
  off(event: QueueEvent, handler: QueueEventHandler): void;
}

export type QueueEventHandler = () => void;

export enum QueueEvent {
  QUEUE_CHANGED = "queue-changed",
  INDEX_CHANGED = "index-changed",
  SONG_ADDED = "song-added",
  SONG_REMOVED = "song-removed",
}
