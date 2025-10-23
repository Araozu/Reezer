using Reezer.Application.DTOs;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class GetAlbumWithTracklistUseCase(ISongRepository songRepository)
{
    public async Task<AlbumWithTracklistDto> GetAlbumWithTracklistAsync(
        Guid albumId,
        CancellationToken cancellationToken = default
    )
    {
        var album = await songRepository.GetAlbumWithSongsAsync(albumId, cancellationToken);

        var songDtos = album
            .Songs.OrderBy(song => song.TrackNumber)
            .Select(song => new SongDto(
                song.Id,
                song.Name,
                song.TrackNumber,
                album.Artist.Name,
                album.Name,
                album.ArtistId,
                album.Id
            ));

        return new AlbumWithTracklistDto(
            album.Id,
            album.Name,
            album.ArtistId,
            album.Artist.Name,
            album.CoverPath,
            songDtos
        );
    }
}
