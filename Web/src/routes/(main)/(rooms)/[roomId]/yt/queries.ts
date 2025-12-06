import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
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

export function useAddYtSong()
{
	const queryClient = useQueryClient();
	
	return createMutation({
		mutationFn: async (url: string) =>
		{
			const response = await api.POST("/api/Yt", {
				body: { url },
			});

			if (response.error)
			{
				throw { message: response.error.detail ?? "Failed to add YouTube song" };
			}

			return response.data;
		},
		onSuccess: () =>
		{
			queryClient.invalidateQueries({ queryKey: ["ytSongs"] });
		},
	});
}
