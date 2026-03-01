import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type components, type WithProblemDetails } from "~/api";
import { derived, type Readable } from "svelte/store";
import { type ISong, type SongType } from "~/audio-engine/types/song";

type AlbumWithTracklistDto = components["schemas"]["AlbumWithTracklistDto"]

export type SongDto = components["schemas"]["SongDto"];
export type RegularSong = ISong & {
	artist: string;
	album: string;
	artistId: string;
	albumId: string;
	trackNumber: number | null | string;
	discNumber: number | null | string;
	duration: number;
}

export function useAlbumByIdQuery(
	$albumId: Readable<string>,
	$placeholderData: Readable<AlbumWithTracklistDto>,
)
{
	const query = createQuery(derived([$albumId, $placeholderData], ([albumId, placeholderData]) => ({
		queryKey: ["albums", albumId],
		queryFn: sv(() => api.GET("/api/Albums/{albumId}", {
			params: {
				path: {albumId},
			},
		})),
		staleTime: 5 * 60 * 1000,
		placeholderData,
		refetchOnWindowFocus: false,
	})));
	return query as WithProblemDetails<typeof query>;
}

