using Microsoft.EntityFrameworkCore;
using Reezer.Application.UseCases.Search;
using Reezer.Domain.Entities;
using Reezer.Domain.Entities.Songs;
using Reezer.Domain.Entities.Yt;
using Reezer.Infrastructure.Data;

namespace Reezer.Infrastructure.Repositories;

public class UnifiedSearchRepository(ReezerDbContext dbContext) : IUnifiedSearchRepository
{
    public async Task<(
        IEnumerable<Song> Songs,
        IEnumerable<YtSong> YtSongs,
        IEnumerable<Album> Albums,
        IEnumerable<Artist> Artists
    )> SearchAsync(string query, int limit = 10, CancellationToken cancellationToken = default)
    {
        var searchPattern = $"%{query}%";

        var songs = await dbContext
            .Songs.Include(s => s.Album)
            .ThenInclude(a => a.Artist)
            .Where(s => EF.Functions.ILike(s.Name, searchPattern))
            .Take(limit)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var ytSongs = await dbContext
            .YtSongs.Where(y => EF.Functions.ILike(y.Name, searchPattern))
            .Take(limit)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var albums = await dbContext
            .Albums.Include(a => a.Artist)
            .Where(a => EF.Functions.ILike(a.Name, searchPattern))
            .Take(limit)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var artists = await dbContext
            .Artists.Include(a => a.Albums)
            .Where(a => EF.Functions.ILike(a.Name, searchPattern))
            .Take(limit)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return (songs, ytSongs, albums, artists);
    }
}
