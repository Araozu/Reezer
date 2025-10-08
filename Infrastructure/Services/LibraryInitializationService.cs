using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Reezer.Application.Services;
using Reezer.Domain.Entities.Songs;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public class LibraryInitializationService(
    ReezerDbContext dbContext,
    IOptions<StorageOptions> storageOptions
) : ILibraryInitializationService
{
    public async Task InitializeLibraryAsync()
    {
        var libraryInitPath = storageOptions.Value.LibraryInitPath;

        if (!Directory.Exists(libraryInitPath))
        {
            throw new DirectoryNotFoundException(
                $"Library initialization path does not exist: {libraryInitPath}"
            );
        }

        var flacFiles = Directory.GetFiles(libraryInitPath, "*.flac");

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
            }
        }

        await dbContext.SaveChangesAsync();
    }
}
