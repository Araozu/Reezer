using Reezer.Application.DTOs;

namespace Reezer.Application.UseCases.Search;

public class UnifiedSearchUseCase(IUnifiedSearchRepository repository)
{
    public async Task<UnifiedSearchResultDto> SearchAsync(
        string query,
        int limit = 10,
        CancellationToken cancellationToken = default
    )
    {
        var (songs, ytSongs, albums, artists) = await repository.SearchAsync(
            query,
            limit,
            cancellationToken
        );

        var songDtos = songs.Select(s => new SongDto(
            s.Id,
            s.Name,
            s.TrackNumber,
            s.DiscNumber,
            s.Album.Artist.Name,
            s.Album.Name,
            s.Album.ArtistId,
            s.Album.Id
        ));

        var ytSongDtos = ytSongs.Select(y => new YtSongDto(y.YtId, y.Name, y.CachedPath));

        var albumDtos = albums.Select(a => new AlbumDto(
            a.Id,
            a.Name,
            a.ArtistId,
            a.Artist.Name,
            a.CoverPath
        ));

        var artistDtos = artists.Select(a => new ArtistDto(
            a.Id,
            a.Name,
            a.Albums.Select(album => new AlbumDto(
                album.Id,
                album.Name,
                album.ArtistId,
                a.Name,
                album.CoverPath
            ))
        ));

        return new UnifiedSearchResultDto(songDtos, ytSongDtos, albumDtos, artistDtos);
    }
}
