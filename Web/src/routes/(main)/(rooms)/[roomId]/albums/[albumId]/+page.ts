import type { components } from "../../../../../api";
import type { PageLoad } from "./$types";

type AlbumWithTracklistDto = components["schemas"]["AlbumWithTracklistDto"]

export const load: PageLoad = async({params, fetch}) =>
{
	const albumId = params.albumId;

	// get album data
	const res = await fetch(`/api/Albums/${albumId}`);
	const albumData = await res.json() as AlbumWithTracklistDto;

	return {
		albumData,
	};
};
