/**
 * Represents a song in the music library.
 */
export interface ISong {
    id: string;
    name: string;
    artist: string;
    album: string;
    artist_id: string | null;
    album_id: string | null;
}
