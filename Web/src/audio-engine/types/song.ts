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
    duration: number;
    type: SongType;
}

export type SongType = "regular" | "youtube"

