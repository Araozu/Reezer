import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type components } from "../../api";
import { derived, type Readable } from "svelte/store";

export type AlbumDto = components["schemas"]["AlbumDto"];
export type PaginatedAlbumsResult = components["schemas"]["PaginatedResultOfAlbumDto"];
export type AlbumData = components["schemas"]["PaginatedResultOfAlbumDto"];


export function useSongs() {
	return createQuery({
		queryKey: ["songs"],
		queryFn: sv(() => api.GET("/api/Songs")),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}

export function useAlbums(
	$page: Readable<number>,
	$pageSize: Readable<number>,
	$placeholderData: Readable<AlbumData>,
) {
	return createQuery(
		derived([$page, $pageSize, $placeholderData], ([page, pageSize, placeholderData]) => ({
			queryKey: ["albums", page, pageSize],
			queryFn: sv(() => api.GET("/api/Albums", {
				params: {
					query: { page, pageSize }
				}
			})),
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
			placeholderData,
		}))
	);
}
