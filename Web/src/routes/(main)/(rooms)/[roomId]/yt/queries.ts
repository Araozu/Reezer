import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type components } from "~/api";
import { derived, type Readable } from "svelte/store";

export type YtSongDto = components["schemas"]["YtSongDto"];
export type PaginatedYtSongsResult = components["schemas"]["PaginatedResultOfYtSongDto"];

export function useYtSongs(
	$page: Readable<number>,
	$pageSize: Readable<number>,
)
{
	return createQuery(derived([$page, $pageSize], ([page, pageSize]) => ({
		queryKey: ["ytSongs", page, pageSize],
		queryFn: sv(() => api.GET("/api/Yt", {
			params: {
				query: { page, pageSize },
			},
		})),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})));
}
