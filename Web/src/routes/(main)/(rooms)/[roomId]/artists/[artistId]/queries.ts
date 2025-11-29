import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type components } from "~/api";
import { derived, type Readable } from "svelte/store";

type ArtistDto = components["schemas"]["ArtistDto"];

export function useArtistByIdQuery($artistId: Readable<string>)
{
	return createQuery(derived([$artistId], ([artistId]) => ({
		queryKey: ["artists", artistId],
		queryFn: sv(() => api.GET("/api/Artists/{artistId}", {
			params: {
				path: { artistId },
			},
		})),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})));
}

