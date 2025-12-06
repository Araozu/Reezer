using System.Diagnostics;
using Acide.Perucontrol.Domain.Utils;
using Microsoft.Extensions.Options;
using OneOf;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public class YtService(IOptions<StorageOptions> storageOptions) : IYtService
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
}
