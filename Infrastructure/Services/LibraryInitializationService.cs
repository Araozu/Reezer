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

        var flacFiles = Directory.GetFiles(libraryInitPath, "*.flac");
        logger.LogInformation("Found {FlacFiles} flac files", flacFiles.Length);

        foreach (var flacFile in flacFiles)
        {
            var fileName = Path.GetFileName(flacFile);
            var songName = Path.GetFileNameWithoutExtension(fileName); // Remove .flac extension

            // Check if song already exists
            var existingSong = await dbContext.Songs.FirstOrDefaultAsync(s =>
                s.RawPath == flacFile
            );

            if (existingSong is null)
            {
                var song = Song.CreateFromLibrary(songName, flacFile);
                dbContext.Songs.Add(song);
                logger.LogInformation("Added song {SongName} to database", songName);
            }
        }

        await dbContext.SaveChangesAsync();
        logger.LogInformation("Saved changes to database");
    }
}
