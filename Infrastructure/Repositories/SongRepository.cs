using System.Collections.Concurrent;
using FFMpegCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
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

            // Check if WebM/Opus version already exists
            if (!string.IsNullOrEmpty(song.TranscodedPath) && File.Exists(song.TranscodedPath))
            {
                return (
                    new FileStream(
                        song.TranscodedPath,
                        FileMode.Open,
                        FileAccess.Read,
                        FileShare.Read
                    ),
                    "audio/webm"
                );
            }

            // Check if we have a raw FLAC file to transcode
            if (string.IsNullOrEmpty(song.RawPath) || !File.Exists(song.RawPath))
            {
                throw new FileNotFoundException($"Raw song file not found at path: {song.RawPath}");
            }

            // Transcode FLAC to fragmented WebM with Opus codec (DASH-ready)
            var webmPath = Path.Combine(StorageOptions.LibraryTranscodedPath, $"{songId}.webm");

            // Ensure transcoded directory exists
            Directory.CreateDirectory(StorageOptions.LibraryTranscodedPath);

            // Clean up any partial/corrupted file from previous failed attempts
            if (File.Exists(webmPath))
            {
                File.Delete(webmPath);
            }

            try
            {
                // Perform transcoding to WebM with Opus
                await FFMpegArguments
                    .FromFileInput(song.RawPath)
                    .OutputToFile(
                        webmPath,
                        false,
                        options =>
                            options
                                .WithAudioCodec("libopus")
                                .WithAudioBitrate(64)
                                .WithCustomArgument("-vn")
                    )
                    .ProcessAsynchronously();

                // Update database with transcoded path only after successful transcoding
                song.SetTranscodedPath(webmPath);
                await dbContext.SaveChangesAsync(cancellationToken);

                // Return stream to the transcoded WebM file
                return (
                    new FileStream(webmPath, FileMode.Open, FileAccess.Read, FileShare.Read),
                    "audio/webm"
                );
            }
            catch
            {
                // Clean up partial file if transcoding fails or is cancelled
                if (File.Exists(webmPath))
                {
                    File.Delete(webmPath);
                }
                throw;
            }
        }
        finally
        {
            songLock.Release();
        }
    }
}
