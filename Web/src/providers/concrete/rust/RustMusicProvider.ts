import { backend_url } from "~/env"
import { IMusicProvider, IPaginatedResult, IPaginationOptions, ISong, IAlbum, IAlbumDetails } from "~/providers/types"

export class RustMusicProvider implements IMusicProvider
{
	readonly name = "Rusty Music Provider"

	async getAlbumDetails(albumId: string): Promise<IAlbumDetails>
	{
		const response = await fetch(`${backend_url}/api/albums/${albumId}`)
		if (!response.ok) throw new Error("Album not found")
		return await response.json()
	}

	async searchAlbums(query: string, options?: IPaginationOptions): Promise<IPaginatedResult<IAlbum>>
	{
		const url_params = new URLSearchParams()
		url_params.append("q", query)

		if (options)
		{
			if (options.limit) url_params.append("limit", options.limit.toString())
			if (options.pageNumber) url_params.append("page", options.pageNumber.toString())
		}
		const params_str = url_params.toString()

		const response = await fetch(`${backend_url}/api/albums/search?${params_str}`)
		return await response.json()
	}

	async getAlbums(options?: IPaginationOptions): Promise<IPaginatedResult<IAlbum>>
	{
		if (import.meta.env.DEV)
		{
			await new Promise((res) => setTimeout(res, 1000))
		}

		const url_params = new URLSearchParams()
		if (options)
		{
			if (options.limit) url_params.append("limit", options.limit.toString())
			if (options.pageNumber) url_params.append("page", options.pageNumber.toString())
		}
		const params_str = url_params.toString()

		const response = await fetch(`${backend_url}/api/albums?${params_str}`)
		return await response.json()
	}

	async getSongs(options?: IPaginationOptions): Promise<IPaginatedResult<ISong>>
	{
		if (import.meta.env.DEV)
		{
			await new Promise((res) => setTimeout(res, 1000))
		}

		const url_params = new URLSearchParams()
		if (options)
		{
			if (options.limit) url_params.append("limit", options.limit.toString())
			if (options.pageNumber) url_params.append("page", options.pageNumber.toString())
		}
		const params_str = url_params.toString()

		const response = await fetch(`${backend_url}/api/music?${params_str}`)
		return await response.json()
	}

	async searchSongs(query: string, options?: IPaginationOptions): Promise<IPaginatedResult<ISong>>
	{
		const url_params = new URLSearchParams()
		url_params.append("q", query)

		if (options)
		{
			if (options.limit) url_params.append("limit", options.limit.toString())
			if (options.pageNumber) url_params.append("page", options.pageNumber.toString())
		}
		const params_str = url_params.toString()

		const response = await fetch(`${backend_url}/api/music/search?${params_str}`)
		return await response.json()
	}

	async getAudioUrl(songId: string): Promise<string>
	{
		const response = await fetch(`${backend_url}/api/music/${songId}/stream-url`)
		if (!response.ok) throw new Error("Not found")

		const songUrl = await response.text()
		return backend_url + songUrl
	}

	async getAlbumCover(albumId: string): Promise<string>
	{
		// Fetch the image directly from the new endpoint
		const response = await fetch(`${backend_url}/api/albums/${albumId}/cover`)
		if (!response.ok) throw new Error("Failed to fetch album cover")

		const blob = await response.blob()

		// Convert blob to base64 data URL
		return new Promise<string>((resolve, reject) =>
		{
			const reader = new FileReader()
			reader.onload = () => resolve(reader.result as string)
			reader.onerror = () => reject(new Error("Failed to convert image to base64"))
			reader.readAsDataURL(blob)
		})
	}

	async getArtistAlbums(artistId: string, options?: IPaginationOptions): Promise<IPaginatedResult<IAlbum>>
	{
		const urlParams = new URLSearchParams()
		if (options)
		{
			if (options.limit) urlParams.append("limit", options.limit.toString())
			if (options.pageNumber) urlParams.append("page", options.pageNumber.toString())
		}
		const params = urlParams.toString()
		const response = await fetch(`${backend_url}/api/artists/${artistId}/albums${params ? `?${params}` : ""}`)
		return await response.json()
	}
}
