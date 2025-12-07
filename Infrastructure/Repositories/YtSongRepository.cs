using System.Collections.Concurrent;
using Acide.Perucontrol.Domain.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OneOf;
using Reezer.Domain.Entities.Yt;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Repositories;

public class YtSongRepository(
    ReezerDbContext dbContext,
    IOptions<StorageOptions> storageOptions,
    IYtService ytService
) : IYtSongRepository
{
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> SongLocks = new();
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
        var songLock = SongLocks.GetOrAdd(ytId, _ => new SemaphoreSlim(1, 1));

        await songLock.WaitAsync(cancellationToken);
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

            if (File.Exists(webmPath))
            {
                song.SetCachedPath(webmPath);
                await dbContext.SaveChangesAsync(cancellationToken);

                return (
                    new FileStream(webmPath, FileMode.Open, FileAccess.Read, FileShare.Read),
                    "audio/webm"
                );
            }

            var downloadResult = await ytService.DownloadAsync(ytId, cancellationToken);

            return downloadResult.Match<
                OneOf<(Stream Stream, string ContentType), NotFound, InternalError>
            >(
                result =>
                {
                    song.SetCachedPath(result.AudioPath);
                    song.SetThumbnailPath(result.ThumbnailPath);
                    dbContext.SaveChanges();

                    return (
                        new FileStream(
                            result.AudioPath,
                            FileMode.Open,
                            FileAccess.Read,
                            FileShare.Read
                        ),
                        "audio/webm"
                    );
                },
                error => error
            );
        }
        finally
        {
            songLock.Release();
        }
    }

    public async Task<
        OneOf<(Stream Stream, string ContentType), NotFound, InternalError>
    > GetThumbnailStreamAsync(string ytId, CancellationToken cancellationToken = default)
    {
        try
        {
            var song = await dbContext
                .YtSongs.AsNoTracking()
                .FirstOrDefaultAsync(s => s.YtId == ytId, cancellationToken);

            if (song is null)
            {
                return new NotFound($"YouTube song with ID {ytId} not found.");
            }

            if (string.IsNullOrEmpty(song.ThumbnailPath) || !File.Exists(song.ThumbnailPath))
            {
                return new NotFound($"Thumbnail not found for YouTube video {ytId}.");
            }

            return (
                new FileStream(song.ThumbnailPath, FileMode.Open, FileAccess.Read, FileShare.Read),
                "image/webp"
            );
        }
        catch (Exception ex)
        {
            return new InternalError($"Failed to retrieve thumbnail: {ex.Message}");
        }
    }

    public async Task<OneOf<YtSong, InternalError>> AddAsync(
        YtSong ytSong,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            dbContext.YtSongs.Add(ytSong);
            await dbContext.SaveChangesAsync(cancellationToken);
            return ytSong;
        }
        catch (Exception ex)
        {
            return new InternalError($"Failed to add YouTube song: {ex.Message}");
        }
    }

    public async Task<OneOf<YtSong, NotFound>> GetByIdAsync(
        string ytId,
        CancellationToken cancellationToken = default
    )
    {
        var song = await dbContext.YtSongs.FirstOrDefaultAsync(
            s => s.YtId == ytId,
            cancellationToken
        );

        if (song is null)
        {
            return new NotFound($"YouTube song with ID {ytId} not found.");
        }

        return song;
    }
}
