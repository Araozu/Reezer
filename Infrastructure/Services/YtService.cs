using System.Diagnostics;
using System.Text.Json;
using Acide.Perucontrol.Domain.Utils;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OneOf;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public class YtService(IOptions<StorageOptions> storageOptions, ILogger<YtService> logger)
    : IYtService
{
    private StorageOptions StorageOptions => storageOptions.Value;

    public async Task SaveCookiesAsync(Stream stream, CancellationToken cancellationToken = default)
    {
        var directory = Path.GetDirectoryName(StorageOptions.YtCookiesFile);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }

        await using var fileStream = new FileStream(
            StorageOptions.YtCookiesFile,
            FileMode.Create,
            FileAccess.Write
        );
        await stream.CopyToAsync(fileStream, cancellationToken);
    }

    public async Task<OneOf<YtDownloadResult, InternalError>> DownloadAsync(
        string ytId,
        CancellationToken cancellationToken = default
    )
    {
        logger.LogInformation("Starting download for YouTube video {YtId}", ytId);

        var webmPath = Path.Combine(StorageOptions.LibraryYtPath, $"{ytId}.webm");
        var infoJsonPath = Path.Combine(StorageOptions.LibraryYtPath, $"{ytId}.info.json");
        var webpPath = Path.Combine(StorageOptions.LibraryYtPath, $"{ytId}.webp");

        Directory.CreateDirectory(StorageOptions.LibraryYtPath);

        if (File.Exists(webmPath))
        {
            File.Delete(webmPath);
        }
        if (File.Exists(infoJsonPath))
        {
            File.Delete(infoJsonPath);
        }
        if (File.Exists(webpPath))
        {
            File.Delete(webpPath);
        }

        var youtubeUrl = $"https://www.youtube.com/watch?v={ytId}";

        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "yt-dlp",
                Arguments =
                    $"-4 -f \"bestaudio[ext=webm]/bestaudio\" "
                    + $"--cookies {StorageOptions.YtCookiesFile} "
                    + $"--convert-thumbnails webp "
                    + $"--write-thumbnail "
                    + $"--write-info-json "
                    + $"--extract-audio --audio-format opus "
                    + $"-o \"{webmPath}\" "
                    + $"\"{youtubeUrl}\"",
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
                CleanupFiles(webmPath, infoJsonPath, webpPath);
                return new InternalError($"yt-dlp failed: {error}");
            }

            var actualPath = FindDownloadedFile(webmPath, ytId);
            if (actualPath is null || !File.Exists(actualPath))
            {
                CleanupFiles(webmPath, infoJsonPath, webpPath);
                return new InternalError("Download completed but audio file not found.");
            }

            if (actualPath != webmPath && File.Exists(actualPath))
            {
                File.Move(actualPath, webmPath, true);
            }

            if (!File.Exists(infoJsonPath))
            {
                CleanupFiles(webmPath, infoJsonPath, webpPath);
                return new InternalError("Info JSON file not found after download.");
            }

            if (!File.Exists(webpPath))
            {
                CleanupFiles(webmPath, infoJsonPath, webpPath);
                return new InternalError("Thumbnail file not found after download.");
            }

            var title = await ExtractTitleFromInfoJson(infoJsonPath, cancellationToken);
            if (title is null)
            {
                CleanupFiles(webmPath, infoJsonPath, webpPath);
                return new InternalError("Failed to extract title from info.json.");
            }

            logger.LogInformation(
                "Successfully downloaded YouTube video {YtId} with title '{Title}'",
                ytId,
                title
            );

            return new YtDownloadResult(title, webmPath, webpPath);
        }
        catch (OperationCanceledException)
        {
            CleanupFiles(webmPath, infoJsonPath, webpPath);
            throw;
        }
        catch (Exception ex)
        {
            CleanupFiles(webmPath, infoJsonPath, webpPath);
            return new InternalError($"Failed to download: {ex.Message}");
        }
        finally
        {
            CleanupFiles(infoJsonPath);
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

    private async Task<string?> ExtractTitleFromInfoJson(
        string infoJsonPath,
        CancellationToken cancellationToken
    )
    {
        try
        {
            await using var fileStream = File.OpenRead(infoJsonPath);
            var jsonDoc = await JsonDocument.ParseAsync(
                fileStream,
                cancellationToken: cancellationToken
            );

            if (jsonDoc.RootElement.TryGetProperty("title", out var titleElement))
            {
                return titleElement.GetString();
            }

            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to parse info.json at {Path}", infoJsonPath);
            return null;
        }
    }

    private static void CleanupFiles(params string[] paths)
    {
        foreach (var path in paths)
        {
            if (File.Exists(path))
            {
                try
                {
                    File.Delete(path);
                }
                catch { }
            }
        }
    }
}
