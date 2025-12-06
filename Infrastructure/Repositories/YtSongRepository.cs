using Acide.Perucontrol.Domain.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OneOf;
using Reezer.Domain.Entities.Yt;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Repositories;

public class YtSongRepository(ReezerDbContext dbContext, IOptions<StorageOptions> storageOptions)
    : IYtSongRepository
{
    private StorageOptions StorageOptions => storageOptions.Value;

    public async Task<OneOf<IEnumerable<YtSong>, InternalError>> GetPaginatedAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var songs = await dbContext
                .YtSongs.AsNoTracking()
                .OrderBy(s => s.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return songs;
        }
        catch (Exception ex)
        {
            return new InternalError($"Failed to retrieve YouTube songs: {ex.Message}");
        }
    }

    public async Task<
        OneOf<(Stream Stream, string ContentType), NotFound, InternalError>
    > GetSongStreamAsync(string ytId, CancellationToken cancellationToken = default)
    {
        try
        {
            var song = await dbContext.YtSongs.FirstOrDefaultAsync(
                s => s.YtId == ytId,
                cancellationToken
            );

            if (song is null)
            {
                return new NotFound($"YouTube song with ID {ytId} not found.");
            }

            if (!string.IsNullOrEmpty(song.CachedPath) && File.Exists(song.CachedPath))
            {
                return (
                    new FileStream(song.CachedPath, FileMode.Open, FileAccess.Read, FileShare.Read),
                    "audio/webm"
                );
            }

            var webmPath = Path.Combine(StorageOptions.LibraryYtPath, $"{ytId}.webm");

            if (!File.Exists(webmPath))
            {
                return new NotFound($"YouTube video file for {ytId} not found.");
            }

            song.SetCachedPath(webmPath);
            await dbContext.SaveChangesAsync(cancellationToken);

            return (
                new FileStream(webmPath, FileMode.Open, FileAccess.Read, FileShare.Read),
                "audio/webm"
            );
        }
        catch (Exception ex)
        {
            return new InternalError($"Failed to retrieve YouTube song stream: {ex.Message}");
        }
    }
}
