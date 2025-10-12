import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type components } from "../../api";

export type AlbumDto = components["schemas"]["AlbumDto"];
export type PaginatedAlbumsResult = components["schemas"]["PaginatedResultOfAlbumDto"];

export function useSongs() {
	return createQuery({
		queryKey: ["songs"],
		queryFn: sv(() => api.GET("/api/Songs")),
		staleTime: 5 * 60 * 1000,
	});
}

export function useAlbums(page: number = 1, pageSize: number = 20) {
	return createQuery({
		queryKey: ["albums", page, pageSize],
		queryFn: sv(() => api.GET("/api/Albums", {
			params: {
				query: { page, pageSize }
			}
		})),
		staleTime: 5 * 60 * 1000,
	});
}