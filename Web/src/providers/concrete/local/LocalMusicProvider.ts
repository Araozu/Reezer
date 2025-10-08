import { type IPaginationOptions, type IPaginatedResult, type ISong, type IMusicProvider, type IAlbum, type IAlbumDetails } from "../../types"

type SongWithUrl = ISong & {
	url: string;
	cover: string;
}

const songsList: Array<SongWithUrl> = [
	{
		id: "1",
		name: "Tonight",
		album: "Fancy That",
		artist: "PinkPantheress",
		url: "/musique/Tonight.flac",
		cover: "https://navidrome.araozu.dev/rest/getCoverArt?u=fernando&t=da9e8ddbb4fef837b69abfc0e3cd0730&s=d84d22&f=json&v=1.8.0&c=NavidromeUI&id=al-7fa3c84acaf11e1e7891874205242942&_=2025-04-19T23%3A51%3A46.7439648Z&square=true",
		album_id: "1",
		artist_id: "1",
	},
	{
		id: "2",
		name: "Capable of Love",
		album: "Heaven Knows",
		artist: "PinkPantheress",
		url: "/musique/Capable of love.flac",
		cover: "https://navidrome.araozu.dev/rest/getCoverArt?u=fernando&t=c2eaf7d7349840e4ed02e5f4ca78832e&s=dc12ac&f=json&v=1.8.0&c=NavidromeUI&id=al-2abacb18c196bd654a6d4588e814f6be&_=2025-04-19T23%3A53%3A13.4895869Z&square=true",
		album_id: "1",
		artist_id: "1",
	},
	{
		id: "3",
		name: "Your Man",
		album: "Smithereens",
		artist: "Joji",
		url: "/musique/Your Man.flac",
		cover: "https://navidrome.araozu.dev/rest/getCoverArt?u=fernando&t=c2eaf7d7349840e4ed02e5f4ca78832e&s=dc12ac&f=json&v=1.8.0&c=NavidromeUI&id=al-6ea3d7862d98cff35736f28711257f4e&_=2024-10-04T01%3A15%3A32.239568Z",
		album_id: "1",
		artist_id: "1",
	},
	{
		id: "4",
		name: "New Jeans",
		album: "Get Up",
		artist: "NewJeans",
		url: "/musique/New Jeans.flac",
		cover: "https://navidrome.araozu.dev/rest/getCoverArt?u=fernando&t=c2eaf7d7349840e4ed02e5f4ca78832e&s=dc12ac&f=json&v=1.8.0&c=NavidromeUI&id=al-27535642c68cdd039b37553f9eb43122&_=2024-10-03T23%3A54%3A38.5063976Z",
		album_id: "1",
		artist_id: "1",
	},
	{
		id: "5",
		name: "United In Grief",
		album: "Mr. Morale & The Big Steppers",
		artist: "Kendrick Lamar",
		url: "/musique/United In Grief.flac",
		cover: "https://navidrome.araozu.dev/rest/getCoverArt?u=fernando&t=c2eaf7d7349840e4ed02e5f4ca78832e&s=dc12ac&f=json&v=1.8.0&c=NavidromeUI&id=al-1b053b50022822726a512ec83631392a&_=2024-10-04T01%3A17%3A44.9119933Z&square=true",
		album_id: "1",
		artist_id: "1",
	},
	{
		id: "6",
		name: "No More Parties In LA",
		album: "The Life of Pablo",
		artist: "Kanye West",
		url: "/musique/No More Parties In LA.flac",
		cover: "https://navidrome.araozu.dev/rest/getCoverArt?u=fernando&t=c2eaf7d7349840e4ed02e5f4ca78832e&s=dc12ac&f=json&v=1.8.0&c=NavidromeUI&id=al-309c94aee7aa9f20a94848d0ba183bc5&_=2024-10-04T00%3A59%3A34.8313877Z&square=true",
		album_id: "1",
		artist_id: "1",
	},
	{
		id: "7",
		name: "Glitter",
		album: "Flower Boy",
		artist: "Tyler, The Creator",
		url: "/musique/Glitter.flac",
		cover: "https://navidrome.araozu.dev/rest/getCoverArt?u=fernando&t=c2eaf7d7349840e4ed02e5f4ca78832e&s=dc12ac&f=json&v=1.8.0&c=NavidromeUI&id=al-e60d9d9d58cc6d71a48e711560825436&_=2024-10-04T00%3A59%3A52.4008848Z&square=true",
		album_id: "1",
		artist_id: "1",
	},
]

export class LocalMusicProvider implements IMusicProvider
{
	readonly name = "Local Music"

	async getSongs(options: IPaginationOptions = {}): Promise<IPaginatedResult<ISong>>
	{
		// Simple pagination for local provider
		const page = parseInt(options.pageNumber || "1", 10)
		const limit = options.limit || 20
		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		const paginatedSongs = songsList.slice(startIndex, endIndex)
		const totalPages = Math.ceil(songsList.length / limit)

		return {
			data: paginatedSongs,
			pagination: {
				current_page: page,
				page_size: limit,
				total_items: songsList.length,
				total_pages: totalPages,
				has_next: page < totalPages,
				has_prev: page > 1,
			},
		}
	}

	async searchSongs(query: string, options: IPaginationOptions = {}): Promise<IPaginatedResult<ISong>>
	{
		// Filter songs based on query (case-insensitive search in name, artist, album)
		const filteredSongs = songsList.filter((song) => song.name.toLowerCase().includes(query.toLowerCase()) ||
			song.artist.toLowerCase().includes(query.toLowerCase()) ||
			song.album.toLowerCase().includes(query.toLowerCase()))

		// Simple pagination for local provider
		const page = parseInt(options.pageNumber || "1", 10)
		const limit = options.limit || 20
		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		const paginatedSongs = filteredSongs.slice(startIndex, endIndex)
		const totalPages = Math.ceil(filteredSongs.length / limit)

		return {
			data: paginatedSongs,
			pagination: {
				current_page: page,
				page_size: limit,
				total_items: filteredSongs.length,
				total_pages: totalPages,
				has_next: page < totalPages,
				has_prev: page > 1,
			},
		}
	}

	async getAudioUrl(songId: string): Promise<string>
	{
		const song = songsList.find((song) => song.id === songId)

		if (song)
		{
			return song.url
		}

		throw { message: "Song not found" }
	}

	async getAlbumCover(albumId: string): Promise<string>
	{
		await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

		// Find any song with the matching album_id to get the cover
		const song = songsList.find((song) => song.album_id === albumId)
		if (!song) throw { message: "Album not found" }

		// Fetch the image from the URL and convert to base64
		const response = await fetch(song.cover)
		if (!response.ok) throw { message: "Failed to fetch cover image" }

		const blob = await response.blob()

		// Convert blob to base64 data URL
		return new Promise<string>((resolve, reject) =>
		{
			const reader = new FileReader()
			reader.onload = () => resolve(reader.result as string)
			reader.onerror = () => reject({ message: "Failed to convert image to base64" })
			reader.readAsDataURL(blob)
		})
	}

	async getAlbums(options: IPaginationOptions = {}): Promise<IPaginatedResult<IAlbum>>

	{
		const page = parseInt(options.pageNumber || "1", 10)
		const limit = options.limit || 20
		// Build unique album list
		const albumMap = new Map<string, IAlbum>()
		for (const song of songsList)
		{
			if (!song.album_id)

			{
				continue
			}
			const id = song.album_id
			if (!albumMap.has(id))

			{
				albumMap.set(id, {
					id: id,
					name: song.album,
					artist: song.artist,
				})
			}
		}
		const allAlbums = Array.from(albumMap.values())
		const totalItems = allAlbums.length
		const totalPages = Math.ceil(totalItems / limit)
		const startIndex = (page - 1) * limit
		const paged = allAlbums.slice(startIndex, startIndex + limit)
		return {
			data: paged,
			pagination: {
				current_page: page,
				page_size: limit,
				total_items: totalItems,
				total_pages: totalPages,
				has_next: page < totalPages,
				has_prev: page > 1,
			},
		}
	}

	async searchAlbums(query: string, options: IPaginationOptions = {}): Promise<IPaginatedResult<IAlbum>>
	{
		const page = parseInt(options.pageNumber || "1", 10)
		const limit = options.limit || 20
		// Filter unique albums by name or artist
		const albumMap = new Map<string, IAlbum>()
		for (const song of songsList)
		{
			if (!song.album_id)

			{
				continue
			}
			const nameMatch = song.album.toLowerCase().includes(query.toLowerCase())
			const artistMatch = song.artist.toLowerCase().includes(query.toLowerCase())
			const id = song.album_id
			if ((nameMatch || artistMatch) && !albumMap.has(id))

			{
				albumMap.set(id, {
					id: id,
					name: song.album,
					artist: song.artist,
				})
			}
		}
		const filtered = Array.from(albumMap.values())
		const totalItems = filtered.length
		const totalPages = Math.ceil(totalItems / limit)
		const startIndex = (page - 1) * limit
		const paged = filtered.slice(startIndex, startIndex + limit)
		return {
			data: paged,
			pagination: {
				current_page: page,
				page_size: limit,
				total_items: totalItems,
				total_pages: totalPages,
				has_next: page < totalPages,
				has_prev: page > 1,
			},
		}
	}

	async getAlbumDetails(albumId: string): Promise<IAlbumDetails>
	{
		// Gather all songs for this album
		const songs = songsList
			.filter((song) => song.album_id === albumId)
			.map((song) => ({ id: song.id, name: song.name, artist: song.artist, album: song.album, artist_id: song.artist_id, album_id: song.album_id }))
		if (songs.length === 0)

		{
			throw { message: "Album not found" }
		}
		// Take first song to retrieve album metadata
		const { album, artist } = songs[0]
		return { id: albumId, name: album, artist, songs }
	}

	async getArtistAlbums(artistId: string, options: IPaginationOptions = {}): Promise<IPaginatedResult<IAlbum>>
	{
		const page = parseInt(options.pageNumber || "1", 10)
		const limit = options.limit || 20

		// Build unique album list for the given artist
		const albumMap = new Map<string, IAlbum>()
		for (const song of songsList)
		{
			if (song.artist_id === artistId && song.album_id)
			{
				const id = song.album_id
				if (!albumMap.has(id))
				{
					albumMap.set(id, {
						id: id,
						name: song.album,
						artist: song.artist,
					})
				}
			}
		}
		const allAlbums = Array.from(albumMap.values())
		const totalItems = allAlbums.length
		const totalPages = Math.ceil(totalItems / limit)
		const startIndex = (page - 1) * limit
		const paged = allAlbums.slice(startIndex, startIndex + limit)
		return {
			data: paged,
			pagination: {
				current_page: page,
				page_size: limit,
				total_items: totalItems,
				total_pages: totalPages,
				has_next: page < totalPages,
				has_prev: page > 1,
			},
		}
	}
}
