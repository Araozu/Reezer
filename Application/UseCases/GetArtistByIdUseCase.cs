using Reezer.Application.DTOs;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class GetArtistByIdUseCase(IArtistRepository artistRepository)
{
    public async Task<ArtistDto> GetArtistByIdAsync(
        Guid artistId,
        CancellationToken cancellationToken = default
    )
    {
        var artist = await artistRepository.GetArtistByIdWithAlbumsAsync(
            artistId,
            cancellationToken
        );

        var albumDtos = artist.Albums.Select(album => new AlbumDto(
            album.Id,
            album.Name,
            artist.Id,
            artist.Name,
            album.CoverPath
        ));

        return new ArtistDto(artist.Id, artist.Name, albumDtos);
    }
}
