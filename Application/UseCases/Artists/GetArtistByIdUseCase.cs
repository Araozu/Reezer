using OneOf;
using Reezer.Application.DTOs;
using Reezer.Domain.Repositories;
using Reezer.Domain.Utils;

namespace Reezer.Application.UseCases;

public class GetArtistByIdUseCase(IArtistRepository artistRepository)
{
    public async Task<OneOf<ArtistDto, NotFound>> GetArtistByIdAsync(
        Guid artistId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var artist = await artistRepository.GetArtistByIdWithAlbumsAsync(
                artistId,
                cancellationToken
            );

            var albumDtos = artist.Albums.Select(album => new AlbumDto(
                album.Id,
                album.Name,
                album.ArtistId,
                artist.Name,
                album.CoverPath
            ));

            return new ArtistDto(artist.Id, artist.Name, albumDtos);
        }
        catch (KeyNotFoundException ex)
        {
            return new NotFound(ex.Message);
        }
    }
}
