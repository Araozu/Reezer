import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type components } from "../../../../api";
import { derived, type Readable } from "svelte/store";

export function useAlbumByIdQuery(
	$albumId: Readable<string>,
) {
	return createQuery(
		derived($albumId, albumId => ({
			queryKey: ["albums", albumId],
			queryFn: sv(() => api.GET("/api/Albums/{albumId}", {
				params: {
						path: {albumId}
				}
			})),
			staleTime: 5 * 60 * 1000,
		}))
	);
}

