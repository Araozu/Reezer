using Reezer.Application.DTOs;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class GetPaginatedArtistsUseCase(IArtistRepository artistRepository)
{
    public async Task<PaginatedResult<ArtistDto>> GetPaginatedArtistsAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        CancellationToken cancellationToken = default
    )
    {
        var (artists, totalCount) = await artistRepository.GetPaginatedArtistsAsync(
            page,
            pageSize,
            search,
            cancellationToken
        );

        var artistDtos = artists.Select(artist => new ArtistDto(artist.Id, artist.Name, []));

        return new PaginatedResult<ArtistDto>(artistDtos, page, pageSize, totalCount);
    }
}
