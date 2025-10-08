import { createQuery } from "@tanstack/svelte-query";
import { api, sv } from "../../api";

export function useSongs() {
	return createQuery({
		queryKey: ["songs"],
		queryFn: sv(() => api.GET("/api/Songs")),
		staleTime: 5 * 60 * 1000,
	});
}