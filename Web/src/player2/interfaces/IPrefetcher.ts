export interface IPrefetcher {
  configure(options: PrefetchOptions): void;

  start(): void;
  stop(): void;

  prefetchSong(songId: string): Promise<void>;

  isPrefetching(songId: string): boolean;
  getPrefetchedSongs(): Set<string>;
}

export interface PrefetchOptions {
  enabled: boolean;
  triggerThreshold: number;
  checkInterval: number;
  maxConcurrent: number;
}
