import type { components } from "~/api";
import type { PageLoad } from "./$types";

type AlbumWithTracklistDto = components["schemas"]["AlbumWithTracklistDto"]

export const load: PageLoad = async({params, fetch}) =>
{
	const albumId = params.albumId;

	const albumDataPromise = fetch(`/api/Albums/${albumId}`)
		.then((res) => res.json() as Promise<AlbumWithTracklistDto>);

	return {
		albumDataPromise,
	};
};
