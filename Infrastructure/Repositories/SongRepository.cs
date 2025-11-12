using System.Collections.Concurrent;
using FFMpegCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Reezer.Domain.Entities;
using Reezer.Domain.Entities.Songs;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Repositories;

public class SongRepository(ReezerDbContext dbContext, IOptions<StorageOptions> storageOptions)
    : ISongRepository
{
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> SongLocks = new();
    private StorageOptions StorageOptions => storageOptions.Value;

    public async Task<IEnumerable<Song>> GetAllSongsAsync(
        CancellationToken cancellationToken = default
    )
    {
        return await dbContext
            .Songs.Include(s => s.Album)
            .ThenInclude(a => a.Artist)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Stream> GetSongStreamAsync(
        Guid songId,
        CancellationToken cancellationToken = default
    )
    {
        var (stream, _) = await GetSongStreamWithContentTypeAsync(songId, cancellationToken);
        return stream;
    }

    public async Task<(Stream Stream, string ContentType)> GetSongStreamWithContentTypeAsync(
        Guid songId,
        CancellationToken cancellationToken = default
    )
    {
        var songLock = SongLocks.GetOrAdd(songId, _ => new SemaphoreSlim(1, 1));

        await songLock.WaitAsync(cancellationToken);
        try
        {
            var song =
                await dbContext.Songs.FirstOrDefaultAsync(s => s.Id == songId, cancellationToken)
                ?? throw new KeyNotFoundException($"Song with ID {songId} not found.");

            // Check if OPUS version already exists
            if (!string.IsNullOrEmpty(song.TranscodedPath) && File.Exists(song.TranscodedPath))
            {
                return (
                    new FileStream(
                        song.TranscodedPath,
                        FileMode.Open,
                        FileAccess.Read,
                        FileShare.Read
                    ),
                    "audio/opus"
                );
            }

            // Check if we have a raw FLAC file to transcode
            if (string.IsNullOrEmpty(song.RawPath) || !File.Exists(song.RawPath))
            {
                throw new FileNotFoundException($"Raw song file not found at path: {song.RawPath}");
            }

            // Transcode FLAC to OPUS
            var opusPath = Path.Combine(StorageOptions.LibraryTranscodedPath, $"{songId}.opus");

            // Ensure transcoded directory exists
            Directory.CreateDirectory(StorageOptions.LibraryTranscodedPath);

            // Clean up any partial/corrupted file from previous failed attempts
            if (File.Exists(opusPath))
            {
                File.Delete(opusPath);
            }

            try
            {
                // Perform transcoding (blocking)
                await FFMpegArguments
                    .FromFileInput(song.RawPath)
                    .OutputToFile(
                        opusPath,
                        false,
                        options =>
                            options
                                .WithAudioCodec("libopus")
                                .WithAudioBitrate(64)
                                .WithCustomArgument("-avoid_negative_ts make_zero")
                    )
                    .ProcessAsynchronously();

                // Update database with transcoded path only after successful transcoding
                song.SetTranscodedPath(opusPath);
                await dbContext.SaveChangesAsync(cancellationToken);

                // Return stream to the transcoded OPUS file
                return (
                    new FileStream(opusPath, FileMode.Open, FileAccess.Read, FileShare.Read),
                    "audio/opus"
                );
            }
            catch
            {
                // Clean up partial file if transcoding fails or is cancelled
                if (File.Exists(opusPath))
                {
                    File.Delete(opusPath);
                }
                throw;
            }
        }
        finally
        {
            songLock.Release();
        }
    }

    public async Task<(Stream Stream, string ContentType)> GetAlbumCoverStreamAsync(
        Guid albumId,
        CancellationToken cancellationToken = default
    )
    {
        var album =
            await dbContext.Albums.FirstOrDefaultAsync(a => a.Id == albumId, cancellationToken)
            ?? throw new KeyNotFoundException($"Album with ID {albumId} not found.");

        if (string.IsNullOrEmpty(album.CoverPath) || !File.Exists(album.CoverPath))
        {
            throw new FileNotFoundException($"Album cover not found for album ID: {albumId}");
        }

        var extension = Path.GetExtension(album.CoverPath).ToLowerInvariant();
        var contentType = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream",
        };

        return (
            new FileStream(album.CoverPath, FileMode.Open, FileAccess.Read, FileShare.Read),
            contentType
        );
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
            query = query.Where(a => a.Name.Contains(search) || a.Artist.Name.Contains(search));
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
