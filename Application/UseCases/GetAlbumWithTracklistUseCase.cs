using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Application.DTOs;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class GetAlbumWithTracklistUseCase(IAlbumRepository albumRepository)
{
    public async Task<OneOf<AlbumWithTracklistDto, NotFound>> GetAlbumWithTracklistAsync(
        Guid albumId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var album = await albumRepository.GetAlbumWithSongsAsync(albumId, cancellationToken);

            var songDtos = album
                .Songs.OrderBy(song => song.DiscNumber ?? 1)
                .ThenBy(song => song.TrackNumber)
                .Select(song => new SongDto(
                    song.Id,
                    song.Name,
                    song.TrackNumber,
                    song.DiscNumber,
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
        catch (KeyNotFoundException ex)
        {
            return new NotFound(ex.Message);
        }
    }
}
