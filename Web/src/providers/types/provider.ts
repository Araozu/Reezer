import type { ISong } from "./song";
import type { IAlbum } from "./album";
import type { IPaginatedResult, IPaginationOptions } from "./pagination";

export interface IAlbumDetails extends IAlbum {
  songs: ISong[];
}

export interface IMusicProvider {
  readonly name: string;
  getSongs(options?: IPaginationOptions): Promise<IPaginatedResult<ISong>>;
  searchSongs(query: string, options?: IPaginationOptions): Promise<IPaginatedResult<ISong>>;
  getAudioUrl(songId: string): Promise<string>;
  getAlbumCover(albumId: string): Promise<string>; // Returns base64 data URL
  getAlbums(options?: IPaginationOptions): Promise<IPaginatedResult<IAlbum>>;
  searchAlbums(query: string, options?: IPaginationOptions): Promise<IPaginatedResult<IAlbum>>;
  getAlbumDetails(albumId: string): Promise<IAlbumDetails>;
  getArtistAlbums(artistId: string, options?: IPaginationOptions): Promise<IPaginatedResult<IAlbum>>;
}
