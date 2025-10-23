using Microsoft.EntityFrameworkCore;
using Reezer.Domain.Entities;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Data;

namespace Reezer.Infrastructure.Repositories;

public class ArtistRepository(ReezerDbContext dbContext) : IArtistRepository
{
    public async Task<Artist> GetArtistByIdWithAlbumsAsync(
        Guid artistId,
        CancellationToken cancellationToken = default
    )
    {
        return await dbContext
                .Artists.Include(a => a.Albums)
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == artistId, cancellationToken)
            ?? throw new KeyNotFoundException($"Artist with ID {artistId} not found.");
    }
}
