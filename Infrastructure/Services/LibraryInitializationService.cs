using System.Text.RegularExpressions;
using FFMpegCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Reezer.Application.Services;
using Reezer.Domain.Entities;
using Reezer.Domain.Entities.Songs;
using Reezer.Infrastructure.Data;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public partial class LibraryInitializationService(
    ReezerDbContext dbContext,
    IOptions<StorageOptions> storageOptions,
    ILogger<LibraryInitializationService> logger
) : ILibraryInitializationService
{
    private static readonly string[] CoverFilePatterns =
    [
        "cover.jpg",
        "cover.jpeg",
        "cover.png",
        "cover.webp",
        "folder.jpg",
        "folder.jpeg",
        "folder.png",
        "album.jpg",
        "album.jpeg",
        "album.png",
        "artwork.jpg",
        "artwork.jpeg",
        "artwork.png",
        "front.jpg",
        "front.jpeg",
        "front.png",
    ];

    [GeneratedRegex(@"(?:CD|Disc|Disk)\s*(\d+)", RegexOptions.IgnoreCase)]
    private static partial Regex DiscFolderRegex();

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

        var artistCache = new Dictionary<string, Artist>(StringComparer.OrdinalIgnoreCase);
        var albumCache = new Dictionary<(string ArtistName, string AlbumName), Album>(
            new AlbumKeyComparer()
        );

        var existingArtists = await dbContext.Artists.ToListAsync();
        foreach (var a in existingArtists)
            artistCache[a.Name] = a;

        var existingAlbums = await dbContext.Albums.Include(a => a.Artist).ToListAsync();
        foreach (var a in existingAlbums)
            albumCache[(a.Artist.Name, a.Name)] = a;

        var existingSongPaths = await dbContext.Songs.Select(s => s.RawPath).ToHashSetAsync();

        foreach (var audioFile in audioFiles)
        {
            if (existingSongPaths.Contains(audioFile))
                continue;

            var parsedInfo = await ExtractAudioInfoAsync(audioFile, libraryInitPath);

            logger.LogInformation(
                "Parsed: Artist='{Artist}', Album='{Album}', Disc={Disc}, Track={Track}, Song='{Song}' (Source: {Source})",
                parsedInfo.Artist,
                parsedInfo.Album,
                parsedInfo.DiscNumber ?? 0,
                parsedInfo.TrackNumber ?? 0,
                parsedInfo.SongName,
                parsedInfo.FromMetadata ? "metadata" : "filepath"
            );

            if (!artistCache.TryGetValue(parsedInfo.Artist, out var artist))
            {
                artist = Artist.Create(parsedInfo.Artist);
                dbContext.Artists.Add(artist);
                artistCache[parsedInfo.Artist] = artist;
            }

            var albumKey = (parsedInfo.Artist, parsedInfo.Album);
            if (!albumCache.TryGetValue(albumKey, out var album))
            {
                var albumDirectory = Path.GetDirectoryName(audioFile);
                var albumCoverPath = FindAlbumCover(
                    albumDirectory,
                    parsedInfo.DiscNumber.HasValue,
                    libraryInitPath
                );

                album = Album.Create(parsedInfo.Album, artist, albumCoverPath);
                dbContext.Albums.Add(album);
                albumCache[albumKey] = album;

                logger.LogInformation(
                    "Created album '{Album}' for artist '{Artist}'{CoverInfo}",
                    parsedInfo.Album,
                    parsedInfo.Artist,
                    albumCoverPath != null ? $" with cover: {albumCoverPath}" : ""
                );
            }

            var song = Song.CreateFromLibrary(
                parsedInfo.SongName,
                audioFile,
                album,
                parsedInfo.TrackNumber,
                parsedInfo.DiscNumber
            );
            dbContext.Songs.Add(song);
            existingSongPaths.Add(audioFile);

            logger.LogInformation(
                "Added song '{SongName}' to database (from {Artist}/{Album})",
                parsedInfo.SongName,
                parsedInfo.Artist,
                parsedInfo.Album
            );
        }

        await dbContext.SaveChangesAsync();
        logger.LogInformation("Saved changes to database");
    }

    private sealed class AlbumKeyComparer : IEqualityComparer<(string ArtistName, string AlbumName)>
    {
        public bool Equals(
            (string ArtistName, string AlbumName) x,
            (string ArtistName, string AlbumName) y
        ) =>
            string.Equals(x.ArtistName, y.ArtistName, StringComparison.OrdinalIgnoreCase)
            && string.Equals(x.AlbumName, y.AlbumName, StringComparison.OrdinalIgnoreCase);

        public int GetHashCode((string ArtistName, string AlbumName) obj) =>
            HashCode.Combine(obj.ArtistName.ToLowerInvariant(), obj.AlbumName.ToLowerInvariant());
    }

    private static string? FindAlbumCover(
        string? currentDirectory,
        bool isInDiscFolder,
        string libraryInitFullPath
    )
    {
        if (currentDirectory == null)
            return null;

        var cover = FindCoverInDirectory(currentDirectory);
        if (cover != null)
            return cover;

        if (isInDiscFolder)
        {
            var parentDirectory = Path.GetDirectoryName(currentDirectory);
            if (
                parentDirectory != null
                && !string.Equals(
                    Path.GetFullPath(parentDirectory),
                    libraryInitFullPath,
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                cover = FindCoverInDirectory(parentDirectory);
                if (cover != null)
                    return cover;
            }
        }

        return null;
    }

    private static string? FindCoverInDirectory(string directory)
    {
        foreach (var pattern in CoverFilePatterns)
        {
            var coverPath = Path.Combine(directory, pattern);
            if (File.Exists(coverPath))
                return coverPath;
        }

        return null;
    }

    private async Task<ParsedAudioInfo> ExtractAudioInfoAsync(
        string audioFilePath,
        string libraryInitPath
    )
    {
        var pathInfo = ParseAudioFilePath(audioFilePath, libraryInitPath);

        try
        {
            var mediaInfo = await FFProbe.AnalyseAsync(audioFilePath);
            var tags = mediaInfo.Format.Tags;

            if (tags != null)
            {
                var hasAlbum =
                    tags.TryGetValue("album", out var album)
                    || tags.TryGetValue("ALBUM", out album);

                var hasTitle =
                    tags.TryGetValue("title", out var title)
                    || tags.TryGetValue("TITLE", out title);

                if (
                    hasAlbum
                    && hasTitle
                    && !string.IsNullOrWhiteSpace(album)
                    && !string.IsNullOrWhiteSpace(title)
                )
                {
                    int? trackNumber = null;
                    int? discNumber = null;

                    if (
                        (
                            tags.TryGetValue("track", out var trackStr)
                            || tags.TryGetValue("TRACK", out trackStr)
                            || tags.TryGetValue("TRACKNUMBER", out trackStr)
                        ) && !string.IsNullOrWhiteSpace(trackStr)
                    )
                    {
                        var trackPart = trackStr.Split('/')[0];
                        if (int.TryParse(trackPart, out var track))
                            trackNumber = track;
                    }

                    if (
                        (
                            tags.TryGetValue("disc", out var discStr)
                            || tags.TryGetValue("DISC", out discStr)
                            || tags.TryGetValue("DISCNUMBER", out discStr)
                        ) && !string.IsNullOrWhiteSpace(discStr)
                    )
                    {
                        var discPart = discStr.Split('/')[0];
                        if (int.TryParse(discPart, out var disc))
                            discNumber = disc;
                    }

                    return new ParsedAudioInfo
                    {
                        Artist = pathInfo.Artist,
                        Album = album!,
                        SongName = title!,
                        TrackNumber = trackNumber ?? pathInfo.TrackNumber,
                        DiscNumber = discNumber ?? pathInfo.DiscNumber,
                        FromMetadata = true,
                    };
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Failed to extract metadata from {AudioFile}, falling back to filepath parsing",
                audioFilePath
            );
        }

        return pathInfo;
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
                var match = DiscFolderRegex().Match(discFolder);
                if (match.Success && int.TryParse(match.Groups[1].Value, out var disc))
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
            FromMetadata = false,
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
        public bool FromMetadata { get; init; }
    }
}
