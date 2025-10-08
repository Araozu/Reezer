using Microsoft.EntityFrameworkCore;
using Reezer.Application.Repositories;
using Reezer.Domain.Entities.Songs;
using Reezer.Infrastructure.Data;

namespace Reezer.Infrastructure.Repositories;

public class SongRepository(ReezerDbContext dbContext) : ISongRepository
{
    public async Task<IEnumerable<Song>> GetAllSongsAsync(
        CancellationToken cancellationToken = default
    )
    {
        return await dbContext.Songs.AsNoTracking().ToListAsync(cancellationToken);
    }
}
