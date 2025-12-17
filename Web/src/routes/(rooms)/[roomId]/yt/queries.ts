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

export function useSetYtCookies()
{
	const mutation = createMutation({
		mutationFn: async(cookiesText: string) =>
		{
			const blob = new Blob([cookiesText], { type: "text/plain" });
			const formData = new FormData();
			formData.append("file", blob, "cookies.txt");

			const response = await fetch("/api/Yt/cookies", {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			if (!response.ok)
			{
				const contentType = response.headers.get("content-type");
				if (contentType?.includes("application/json"))
				{
					const problem = await response.json();
					throw problem;
				}
				throw { detail: `HTTP error ${response.status}` };
			}

			return;
		},
	});

	return mutation as unknown as WithProblemDetails<typeof mutation>;
}
