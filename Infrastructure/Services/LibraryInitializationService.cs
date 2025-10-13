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
                "Parsed: Artist='{Artist}', Album='{Album}', Disc={Disc}, Track={Track}, Song='{Song}'",
                parsedInfo.Artist,
                parsedInfo.Album,
                parsedInfo.DiscNumber ?? 0,
                parsedInfo.TrackNumber ?? 0,
                parsedInfo.SongName
            );

            var existingSong = await dbContext.Songs.FirstOrDefaultAsync(s =>
                s.RawPath == audioFile
            );

            if (existingSong is null)
            {
                var artist = await dbContext.Artists.FirstOrDefaultAsync(a =>
                    a.Name == parsedInfo.Artist
                );

                if (artist is null)
                {
                    artist = Artist.Create(parsedInfo.Artist);
                    dbContext.Artists.Add(artist);
                    await dbContext.SaveChangesAsync();
                }

                var albumDirectory = Path.GetDirectoryName(audioFile);
                var coverPath =
                    albumDirectory != null ? Path.Combine(albumDirectory, "cover.jpg") : null;

                var albumCoverPath = coverPath != null && File.Exists(coverPath) ? coverPath : null;

                var album = await dbContext.Albums.FirstOrDefaultAsync(a =>
                    a.Name == parsedInfo.Album && a.ArtistId == artist.Id
                );

                if (album is null)
                {
                    album = Album.Create(parsedInfo.Album, artist, albumCoverPath);
                    dbContext.Albums.Add(album);
                    await dbContext.SaveChangesAsync();
                }

                var song = Song.CreateFromLibrary(
                    parsedInfo.SongName,
                    audioFile,
                    album,
                    parsedInfo.TrackNumber
                );
                dbContext.Songs.Add(song);
                logger.LogInformation(
                    "Added song '{SongName}' to database (from {Artist}/{Album}){CoverInfo}",
                    parsedInfo.SongName,
                    parsedInfo.Artist,
                    parsedInfo.Album,
                    albumCoverPath != null ? $" with cover: {albumCoverPath}" : ""
                );
            }
        }

        await dbContext.SaveChangesAsync();
        logger.LogInformation("Saved changes to database");
    }

    private static ParsedAudioInfo ParseAudioFilePath(string audioFilePath, string libraryInitPath)
    {
        var relativePath = Path.GetRelativePath(libraryInitPath, audioFilePath);
        var pathParts = relativePath.Split(Path.DirectorySeparatorChar);

        var songName = Path.GetFileNameWithoutExtension(audioFilePath);
        var trackNumber = ExtractTrackNumber(songName);
        songName = TrimLeadingNumbers(songName);
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
            TrackNumber = trackNumber,
            SongName = songName,
        };
    }

    private static int? ExtractTrackNumber(string songName)
    {
        var trimmed = songName.TrimStart();
        var index = 0;

        while (index < trimmed.Length && char.IsDigit(trimmed[index]))
        {
            index++;
        }

        if (index > 0 && index < trimmed.Length)
        {
            var numberStr = trimmed[..index];
            if (int.TryParse(numberStr, out var trackNumber))
            {
                return trackNumber;
            }
        }

        return null;
    }

    private static string TrimLeadingNumbers(string songName)
    {
        var trimmed = songName.TrimStart();
        var index = 0;

        while (index < trimmed.Length && char.IsDigit(trimmed[index]))
        {
            index++;
        }

        if (index > 0 && index < trimmed.Length)
        {
            var afterNumbers = trimmed[index..].TrimStart();
            if (
                afterNumbers.StartsWith('-')
                || afterNumbers.StartsWith('.')
                || afterNumbers.StartsWith('_')
            )
            {
                afterNumbers = afterNumbers[1..].TrimStart();
            }

            return afterNumbers.Length > 0 ? afterNumbers : songName;
        }

        return songName;
    }

    private record ParsedAudioInfo
    {
        public required string Artist { get; init; }
        public required string Album { get; init; }
        public int? DiscNumber { get; init; }
        public int? TrackNumber { get; init; }
        public required string SongName { get; init; }
    }
}
