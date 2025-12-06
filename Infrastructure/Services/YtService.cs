using System.Diagnostics;
using System.Text.RegularExpressions;
using Acide.Perucontrol.Domain.Utils;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OneOf;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public class YtService(
    IOptions<StorageOptions> storageOptions,
    ILogger<YtService> logger
) : IYtService
{
    private StorageOptions StorageOptions => storageOptions.Value;

    public async Task<OneOf<string, InternalError>> DownloadAndCacheAsync(
        string ytId,
        CancellationToken cancellationToken = default
    )
    {
        var webmPath = Path.Combine(StorageOptions.LibraryYtPath, $"{ytId}.webm");

        Directory.CreateDirectory(StorageOptions.LibraryYtPath);

        if (File.Exists(webmPath))
        {
            File.Delete(webmPath);
        }

        var youtubeUrl = $"https://www.youtube.com/watch?v={ytId}";

        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "yt-dlp",
                Arguments =
                    $"-f \"bestaudio[ext=webm]/bestaudio\" --extract-audio --audio-format opus -o \"{webmPath}\" \"{youtubeUrl}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            },
        };

        try
        {
            process.Start();
            await process.WaitForExitAsync(cancellationToken);

            if (process.ExitCode != 0)
            {
                var error = await process.StandardError.ReadToEndAsync(cancellationToken);
                if (File.Exists(webmPath))
                {
                    File.Delete(webmPath);
                }
                return new InternalError($"yt-dlp failed: {error}");
            }

            var actualPath = FindDownloadedFile(webmPath, ytId);
            if (actualPath is null || !File.Exists(actualPath))
            {
                return new InternalError("Download completed but file not found.");
            }

            if (actualPath != webmPath && File.Exists(actualPath))
            {
                File.Move(actualPath, webmPath, true);
            }

            return webmPath;
        }
        catch (OperationCanceledException)
        {
            if (File.Exists(webmPath))
            {
                File.Delete(webmPath);
            }
            throw;
        }
        catch (Exception ex)
        {
            if (File.Exists(webmPath))
            {
                File.Delete(webmPath);
            }
            return new InternalError($"Failed to download: {ex.Message}");
        }
    }

    private string? FindDownloadedFile(string expectedPath, string ytId)
    {
        if (File.Exists(expectedPath))
            return expectedPath;

        var directory = Path.GetDirectoryName(expectedPath)!;
        var possibleExtensions = new[] { ".webm", ".opus", ".m4a", ".mp3" };

        foreach (var ext in possibleExtensions)
        {
            var path = Path.Combine(directory, $"{ytId}{ext}");
            if (File.Exists(path))
                return path;
        }

        return null;
    }

    public async Task<OneOf<string, InternalError>> DownloadAndEncodeThumbnailAsync(
        string ytId,
        CancellationToken cancellationToken = default
    )
    {
        logger.LogInformation("Starting thumbnail download for YouTube video {YtId}", ytId);
        try
        {
            var youtubeUrl = $"https://www.youtube.com/watch?v={ytId}";

            using var httpClient = new HttpClient();
            logger.LogDebug("Fetching YouTube page HTML for {YtId}", ytId);
            var pageHtml = await httpClient.GetStringAsync(youtubeUrl, cancellationToken);

            var match = Regex.Match(
                pageHtml,
                @"<meta\s+property=""og:image""\s+content=""([^""]+)"""
            );
            if (!match.Success)
            {
                logger.LogWarning("Thumbnail URL not found in page metadata for {YtId}", ytId);
                return new InternalError("Thumbnail URL not found in page metadata.");
            }

            var thumbnailUrl = match.Groups[1].Value;
            logger.LogDebug("Found thumbnail URL: {ThumbnailUrl}", thumbnailUrl);

            var tempImagePath = Path.Combine(StorageOptions.YtThumbnailPath, $"{ytId}_temp.jpg");
            var webpPath = Path.Combine(StorageOptions.YtThumbnailPath, $"{ytId}.webp");

            Directory.CreateDirectory(StorageOptions.YtThumbnailPath);

            if (File.Exists(tempImagePath))
            {
                File.Delete(tempImagePath);
            }
            if (File.Exists(webpPath))
            {
                File.Delete(webpPath);
            }

            logger.LogDebug("Downloading thumbnail image from {ThumbnailUrl}", thumbnailUrl);
            var imageBytes = await httpClient.GetByteArrayAsync(thumbnailUrl, cancellationToken);
            await File.WriteAllBytesAsync(tempImagePath, imageBytes, cancellationToken);
            logger.LogDebug("Downloaded {Bytes} bytes, saved to {TempPath}", imageBytes.Length, tempImagePath);

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cwebp",
                    Arguments = $"-q 70 -resize 600 0 \"{tempImagePath}\" -o \"{webpPath}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                },
            };

            logger.LogDebug("Starting cwebp encoding process for {YtId}", ytId);
            process.Start();
            await process.WaitForExitAsync(cancellationToken);

            if (File.Exists(tempImagePath))
            {
                File.Delete(tempImagePath);
            }

            if (process.ExitCode != 0)
            {
                var error = await process.StandardError.ReadToEndAsync(cancellationToken);
                logger.LogError("cwebp encoding failed for {YtId}: {Error}", ytId, error);
                if (File.Exists(webpPath))
                {
                    File.Delete(webpPath);
                }
                return new InternalError($"cwebp failed: {error}");
            }

            if (!File.Exists(webpPath))
            {
                logger.LogError("Thumbnail encoding completed but file not found for {YtId}", ytId);
                return new InternalError("Thumbnail encoding completed but file not found.");
            }

            logger.LogInformation("Successfully downloaded and encoded thumbnail for {YtId} to {WebpPath}", ytId, webpPath);
            return webpPath;
        }
        catch (OperationCanceledException)
        {
            logger.LogWarning("Thumbnail download cancelled for {YtId}", ytId);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to download thumbnail for {YtId}", ytId);
            return new InternalError($"Failed to download thumbnail: {ex.Message}");
        }
    }
}
