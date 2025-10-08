using FFMpegCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Reezer.Application.Repositories;
using Reezer.Domain.Entities.Songs;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Repositories;

public class SongRepository(ReezerDbContext dbContext, IOptions<StorageOptions> storageOptions)
    : ISongRepository
{
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
        var song =
            await dbContext.Songs.FirstOrDefaultAsync(s => s.Id == songId, cancellationToken)
            ?? throw new KeyNotFoundException($"Song with ID {songId} not found.");

        // Check if OPUS version already exists
        if (!string.IsNullOrEmpty(song.TranscodedPath) && File.Exists(song.TranscodedPath))
        {
            return (
                new FileStream(song.TranscodedPath, FileMode.Open, FileAccess.Read, FileShare.Read),
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

        // Update database with transcoded path
        song.SetTranscodedPath(opusPath);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Return stream to the transcoded OPUS file
        return (
            new FileStream(opusPath, FileMode.Open, FileAccess.Read, FileShare.Read),
            "audio/opus"
        );
    }
}
