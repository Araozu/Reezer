export interface IStreamProvider {
  getStreamUrl(songId: string): string;
  prefetchSong(songId: string): Promise<void>;
  getSongInfo(songId: string): Promise<SongMetadata>;
}

export interface SongMetadata {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
}
