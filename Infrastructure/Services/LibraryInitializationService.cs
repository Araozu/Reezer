using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Reezer.Application.Services;
using Reezer.Domain.Entities.Songs;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public class LibraryInitializationService(
    ReezerDbContext dbContext,
    IOptions<StorageOptions> storageOptions,
    ILogger<LibraryInitializationService> logger
) : ILibraryInitializationService
{
    private StorageOptions StorageOptions => storageOptions.Value;

    public async Task InitializeLibraryAsync()
    {
        var libraryInitPath = Path.GetFullPath(StorageOptions.LibraryInitPath);

        if (!Directory.Exists(libraryInitPath))
        {
            logger.LogError(
                "Library initialization path does not exist: {LibraryInitPath}",
                libraryInitPath
            );
            throw new DirectoryNotFoundException(
                $"Library initialization path does not exist: {libraryInitPath}"
            );
        }

        var supportedExtensions = new[] { "*.flac", "*.opus", "*.mp3", "*.m4a", "*.ogg" };
        var audioFiles = supportedExtensions
            .SelectMany(ext => Directory.GetFiles(libraryInitPath, ext))
            .ToArray();

        logger.LogInformation("Found {AudioFiles} audio files", audioFiles.Length);

        foreach (var audioFile in audioFiles)
        {
            var fileName = Path.GetFileName(audioFile);
            var songName = Path.GetFileNameWithoutExtension(fileName);

            var existingSong = await dbContext.Songs.FirstOrDefaultAsync(s =>
                s.RawPath == audioFile
            );

            if (existingSong is null)
            {
                var song = Song.CreateFromLibrary(songName, audioFile);
                dbContext.Songs.Add(song);
                logger.LogInformation("Added song {SongName} to database", songName);
            }
        }

        await dbContext.SaveChangesAsync();
        logger.LogInformation("Saved changes to database");
    }
}
