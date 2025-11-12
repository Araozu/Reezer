import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type components } from "../../../api";
import { derived, type Readable } from "svelte/store";

export type AlbumDto = components["schemas"]["AlbumDto"];
export type PaginatedAlbumsResult = components["schemas"]["PaginatedResultOfAlbumDto"];
export type AlbumData = components["schemas"]["PaginatedResultOfAlbumDto"];

export function useSongs()
{
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
	$search: Readable<string | undefined>,
)
{
	return createQuery(derived([$page, $pageSize, $search], ([page, pageSize, search]) => ({
		queryKey: ["albums", page, pageSize, search],
		queryFn: sv(() => api.GET("/api/Albums", {
			params: {
				query: { page, pageSize, search },
			},
		})),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})));
}
