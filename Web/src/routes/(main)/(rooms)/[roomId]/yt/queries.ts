import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
import { api, sv, type components, type WithProblemDetails } from "~/api";
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

	const mutation = createMutation({
		mutationFn: (url: string) => api.POST("/api/Yt", {
			body: {
				url,
			},
		}),
		onSuccess: () =>
		{
			queryClient.invalidateQueries({ queryKey: ["ytSongs"] });
		},
	});

	return mutation as unknown as WithProblemDetails<typeof mutation>;
}
