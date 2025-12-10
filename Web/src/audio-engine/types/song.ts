/**
 * Represents a song in the music library.
 */
export interface ISong {
    id: string;
    name: string;
    artist?: string;
    album?: string;
    artistId?: string;
    albumId?: string;
    type: SongType;
}

export type SongType = "regular" | "youtube"

