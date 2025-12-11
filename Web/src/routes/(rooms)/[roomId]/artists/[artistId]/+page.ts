import type { components } from "~/api";
import type { PageLoad } from "./$types";

type ArtistDto = components["schemas"]["ArtistDto"]

export const load: PageLoad = async({params, fetch}) =>
{
	const artistId = params.artistId;

	const artistDataPromise = fetch(`/api/Artists/${artistId}`)
		.then((res) => res.json() as Promise<ArtistDto>);

	return {
		artistDataPromise,
	};
};
