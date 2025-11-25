import { createQuery } from "@tanstack/svelte-query";
import { api, sv, type WithProblemDetails } from "~/api";

export function useCurrentUser()
{
	const query = createQuery({
		queryKey: ["user", "me"],
		queryFn: sv(() => api.GET("/api/User/me")),
		staleTime: 5 * 60 * 1000,
		retry: false,
	});
	return query as WithProblemDetails<typeof query>;
}

