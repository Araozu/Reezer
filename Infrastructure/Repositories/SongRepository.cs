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

    public async Task<Stream> GetSongStreamAsync(
        Guid songId,
        CancellationToken cancellationToken = default
    )
    {
        var song =
            await dbContext
                .Songs.AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == songId, cancellationToken)
            ?? throw new KeyNotFoundException($"Song with ID {songId} not found.");
        var filePath = song.Raw ? song.RawPath : song.TranscodedPath;

        if (string.IsNullOrEmpty(filePath) || !File.Exists(filePath))
        {
            throw new FileNotFoundException($"Song file not found at path: {filePath}");
        }

        return new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
    }
}
