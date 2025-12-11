import { createQuery } from "@tanstack/svelte-query";
import { api, type components } from "~/api";
import { derived, type Readable } from "svelte/store";

export type AlbumDto = components["schemas"]["AlbumDto"];
export type PaginatedAlbumsResult = components["schemas"]["PaginatedResultOfAlbumDto"];
export type AlbumData = components["schemas"]["PaginatedResultOfAlbumDto"];

export type ArtistDto = components["schemas"]["ArtistDto"];
export type PaginatedResultOfArtistDto = {
	items: ArtistDto[];
	page: number;
	pageSize: number;
	totalCount: number;
};

export function useSongs()
{
	return createQuery({
		queryKey: ["songs"],
		queryFn: () => api.GET("/api/Songs"),
	});
}

export function useArtists(
	$page: Readable<number>,
	$pageSize: Readable<number>,
	$search: Readable<string | undefined>,
)
{
	return createQuery(derived([$page, $pageSize, $search], ([page, pageSize, search]) => ({
		queryKey: ["artists", page, pageSize, search],
		queryFn: () => api.GET("/api/Artists", {
			params: {
				query: { page, pageSize, search },
			},
		}),
	})));
}

export function useAlbums(
	$page: Readable<number>,
	$pageSize: Readable<number>,
	$search: Readable<string | undefined>,
)
{
	return createQuery(derived([$page, $pageSize, $search], ([page, pageSize, search]) => ({
		queryKey: ["albums", page, pageSize, search],
		queryFn: () => api.GET("/api/Albums", {
			params: {
				query: { page, pageSize, search },
			},
		}),
	})));
}

export function useRecentAlbums(limit: number = 6)
{
	return createQuery({
		queryKey: ["albums", 1, limit],
		queryFn: () => api.GET("/api/Albums", {
			params: {
				query: { page: 1, pageSize: limit },
			},
		}),
	});
}

export function useRandomAlbums(
	$page: Readable<number>,
	$pageSize: Readable<number>,
	$seed: Readable<number | undefined>,
)
{
	return createQuery(derived([$page, $pageSize, $seed], ([page, pageSize, seed]) => ({
		queryKey: ["albums", "random", page, pageSize, seed],
		queryFn: () => api.GET("/api/Albums/random", {
			params: {
				query: { page, pageSize, seed },
			},
		}),
	})));
}
