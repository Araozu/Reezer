using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Reezer.Application.Services;
using Reezer.Domain.Entities;
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
            .SelectMany(ext =>
                Directory.GetFiles(libraryInitPath, ext, SearchOption.AllDirectories)
            )
            .ToArray();

        logger.LogInformation("Found {AudioFiles} audio files", audioFiles.Length);

        foreach (var audioFile in audioFiles)
        {
            var parsedInfo = ParseAudioFilePath(audioFile, libraryInitPath);

            logger.LogInformation(
                "Parsed: Artist='{Artist}', Album='{Album}', Disc={Disc}, Song='{Song}'",
                parsedInfo.Artist,
                parsedInfo.Album,
                parsedInfo.DiscNumber ?? 0,
                parsedInfo.SongName
            );

            var existingSong = await dbContext.Songs.FirstOrDefaultAsync(s =>
                s.RawPath == audioFile
            );

            if (existingSong is null)
            {
                var artist =
                    await dbContext.Artists.FirstOrDefaultAsync(a => a.Name == parsedInfo.Artist)
                    ?? Artist.Create(parsedInfo.Artist);

                var album =
                    await dbContext.Albums.FirstOrDefaultAsync(a =>
                        a.Name == parsedInfo.Album && a.ArtistId == artist.Id
                    ) ?? Album.Create(parsedInfo.Album, artist);

                var song = Song.CreateFromLibrary(parsedInfo.SongName, audioFile, album);
                dbContext.Songs.Add(song);
                logger.LogInformation(
                    "Added song '{SongName}' to database (from {Artist}/{Album})",
                    parsedInfo.SongName,
                    parsedInfo.Artist,
                    parsedInfo.Album
                );
            }
        }

        await dbContext.SaveChangesAsync();
        logger.LogInformation("Saved changes to database");
    }

    private ParsedAudioInfo ParseAudioFilePath(string audioFilePath, string libraryInitPath)
    {
        var relativePath = Path.GetRelativePath(libraryInitPath, audioFilePath);
        var pathParts = relativePath.Split(Path.DirectorySeparatorChar);

        var songName = Path.GetFileNameWithoutExtension(audioFilePath);
        string artist;
        string album;
        int? discNumber = null;

        if (pathParts.Length >= 3)
        {
            artist = pathParts[0];
            album = pathParts[1];

            if (pathParts.Length == 4)
            {
                var discFolder = pathParts[2];
                if (
                    int.TryParse(new string(discFolder.Where(char.IsDigit).ToArray()), out var disc)
                )
                {
                    discNumber = disc;
                }
            }
        }
        else if (pathParts.Length == 2)
        {
            artist = pathParts[0];
            album = "Unknown Album";
        }
        else
        {
            artist = "Unknown Artist";
            album = "Unknown Album";
        }

        return new ParsedAudioInfo
        {
            Artist = artist,
            Album = album,
            DiscNumber = discNumber,
            SongName = songName,
        };
    }

    private record ParsedAudioInfo
    {
        public required string Artist { get; init; }
        public required string Album { get; init; }
        public int? DiscNumber { get; init; }
        public required string SongName { get; init; }
    }
}
