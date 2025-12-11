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

    public async Task<(IEnumerable<Artist> Artists, int TotalCount)> GetPaginatedArtistsAsync(
        int page,
        int pageSize,
        string? search = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = dbContext.Artists.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a => EF.Functions.ILike(a.Name, $"%{search}%"));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var artists = await query
            .OrderBy(a => EF.Functions.Collate(a.Name, "default"))
            .ThenBy(a => a.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (artists, totalCount);
    }
}
