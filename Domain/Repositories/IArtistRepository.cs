using Reezer.Domain.Entities;

namespace Reezer.Domain.Repositories;

public interface IArtistRepository
{
    Task<Artist> GetArtistByIdWithAlbumsAsync(Guid artistId, CancellationToken cancellationToken = default);
}
