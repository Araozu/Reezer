using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Reezer.Domain.Entities;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Repositories;

public class AlbumRepository(ReezerDbContext dbContext, IOptions<StorageOptions> storageOptions)
    : IAlbumRepository
{
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> AlbumLocks = new();
    private StorageOptions StorageOptions => storageOptions.Value;

    public async Task<(Stream Stream, string ContentType)> GetAlbumCoverStreamAsync(
        Guid albumId,
        CancellationToken cancellationToken = default
    )
    {
        var albumLock = AlbumLocks.GetOrAdd(albumId, _ => new SemaphoreSlim(1, 1));

        await albumLock.WaitAsync(cancellationToken);
        try
        {
            var album =
                await dbContext.Albums.FirstOrDefaultAsync(a => a.Id == albumId, cancellationToken)
                ?? throw new KeyNotFoundException($"Album with ID {albumId} not found.");

            if (
                !string.IsNullOrEmpty(album.TranscodedCoverPath)
                && File.Exists(album.TranscodedCoverPath)
            )
            {
                return (
                    new FileStream(
                        album.TranscodedCoverPath,
                        FileMode.Open,
                        FileAccess.Read,
                        FileShare.Read
                    ),
                    "image/webp"
                );
            }

            if (string.IsNullOrEmpty(album.CoverPath) || !File.Exists(album.CoverPath))
            {
                throw new FileNotFoundException($"Album cover not found for album ID: {albumId}");
            }

            var webpPath = Path.Combine(StorageOptions.LibraryTranscodedPath, $"{albumId}.webp");

            Directory.CreateDirectory(StorageOptions.LibraryTranscodedPath);

            if (File.Exists(webpPath))
            {
                File.Delete(webpPath);
            }

            try
            {
                var startInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "cwebp",
                    Arguments = $"-q 70 -resize 600 0 \"{album.CoverPath}\" -o \"{webpPath}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                };

                using var process = System.Diagnostics.Process.Start(startInfo);
                if (process == null)
                {
                    throw new InvalidOperationException("Failed to start cwebp process.");
                }

                await process.WaitForExitAsync(cancellationToken);

                if (process.ExitCode != 0)
                {
                    var error = await process.StandardError.ReadToEndAsync(cancellationToken);
                    throw new InvalidOperationException(
                        $"cwebp failed with exit code {process.ExitCode}: {error}"
                    );
                }

                album.SetTranscodedCoverPath(webpPath);
                await dbContext.SaveChangesAsync(cancellationToken);

                return (
                    new FileStream(webpPath, FileMode.Open, FileAccess.Read, FileShare.Read),
                    "image/webp"
                );
            }
            catch
            {
                if (File.Exists(webpPath))
                {
                    File.Delete(webpPath);
                }
                throw;
            }
        }
        finally
        {
            albumLock.Release();
        }
    }

    public async Task<(IEnumerable<Album> Albums, int TotalCount)> GetPaginatedAlbumsAsync(
        int page,
        int pageSize,
        string? search = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = dbContext.Albums.Include(a => a.Artist).AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a =>
                EF.Functions.ILike(a.Name, $"%{search}%")
                || EF.Functions.ILike(a.Artist.Name, $"%{search}%")
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var albums = await query
            .OrderBy(a => a.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (albums, totalCount);
    }

    public async Task<Album> GetAlbumWithSongsAsync(
        Guid albumId,
        CancellationToken cancellationToken = default
    )
    {
        return await dbContext
                .Albums.Include(a => a.Artist)
                .Include(a => a.Songs)
                .FirstOrDefaultAsync(a => a.Id == albumId, cancellationToken)
            ?? throw new KeyNotFoundException($"Album with ID {albumId} not found.");
    }
}
