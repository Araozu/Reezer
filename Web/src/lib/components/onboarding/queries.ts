import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
import { api, sv, type WithProblemDetails } from "~/api";

export type MusicRoomDto = {
	roomCode: string;
	roomName: string;
	connectedUsers: number;
};

export function useRooms()
{
	const query = createQuery({
		queryKey: ["musicrooms"],
		queryFn: sv(() => api.GET("/api/MusicRooms")),
		refetchInterval: 5000,
	});
	return query as WithProblemDetails<typeof query>;
}

export function useCreateRoom()
{
	const queryClient = useQueryClient();

	const mutation = createMutation({
		mutationFn: (roomName?: string) => api.POST("/api/MusicRooms", {
			body: {roomName: roomName || null},
		}),
		onSuccess: () =>
		{
			queryClient.invalidateQueries({ queryKey: ["musicrooms"] });
		},
	});

	return mutation as unknown as WithProblemDetails<typeof mutation>;
}
