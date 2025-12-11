using Reezer.Domain.Entities;

namespace Reezer.Domain.Repositories;

public interface IArtistRepository
{
    Task<Artist> GetArtistByIdWithAlbumsAsync(
        Guid artistId,
        CancellationToken cancellationToken = default
    );

    Task<(IEnumerable<Artist> Artists, int TotalCount)> GetPaginatedArtistsAsync(
        int page,
        int pageSize,
        string? search = null,
        CancellationToken cancellationToken = default
    );
}
