import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type components, type WithProblemDetails } from "~/api";
import { derived, type Readable } from "svelte/store";
import type { SongType } from "~/providers/types/song";

type AlbumWithTracklistDto = components["schemas"]["AlbumWithTracklistDto"]

export type SongDto = components["schemas"]["SongDto"];
export type RegularSong = SongDto & {type: SongType}

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

