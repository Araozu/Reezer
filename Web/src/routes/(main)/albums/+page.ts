import type { components } from "../../../api";
import type { PageLoad } from "./$types";
type AlbumData = components["schemas"]["PaginatedResultOfAlbumDto"];

export const load: PageLoad = async ({url, fetch}) => {
	// Preload the data for the current page of albums,
	// and send it to the tanstack...
	const searchParams = url.searchParams
	const pageNumber = Number.parseInt(searchParams.get("page") ?? "1")

	const requestParams = new URLSearchParams()
	requestParams.set("page", pageNumber.toString())

	console.log("[debug]: loading albums data on +page.ts");
	const albumsData: Promise<AlbumData> = (async() => {
		// await new Promise(res => setTimeout(res, 500))
		return await fetch(`/api/Albums?${requestParams.toString()}`)
			.then(data => data.json())
			.catch(() => {});
	})()

	return {
		albumsData,
	}
};

