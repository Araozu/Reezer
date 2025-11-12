import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type components } from "../../../../../api";
import { derived, type Readable } from "svelte/store";

type AlbumWithTracklistDto = components["schemas"]["AlbumWithTracklistDto"]

export function useAlbumByIdQuery(
	$albumId: Readable<string>,
	$placeholderData: Readable<AlbumWithTracklistDto>,
)
{
	return createQuery(derived([$albumId, $placeholderData], ([albumId, placeholderData]) => ({
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
}

