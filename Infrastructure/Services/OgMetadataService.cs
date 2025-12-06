using System.Diagnostics;
using System.Text.RegularExpressions;
using Acide.Perucontrol.Domain.Utils;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OneOf;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public partial class OgMetadataService(
    HttpClient httpClient,
    IOptions<StorageOptions> storageOptions,
    ILogger<OgMetadataService> logger
) : IOgMetadataService
{
    private StorageOptions StorageOptions => storageOptions.Value;

    public async Task<OneOf<OgMetadata, NotFound, InternalError>> GetMetadataAsync(
        string url,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var response = await httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return new NotFound($"Could not fetch URL: {response.StatusCode}");
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var title = ExtractMetaContent(html, "og:title") ?? ExtractTitleTag(html);

            if (title is null)
            {
                return new NotFound("No title found in page metadata");
            }

            var description = ExtractMetaContent(html, "og:description");
            var imageUrl = ExtractMetaContent(html, "og:image");

            string? thumbnailPath = null;
            if (!string.IsNullOrEmpty(imageUrl))
            {
                var videoIdMatch = Regex.Match(url, @"[?&]v=([a-zA-Z0-9_-]{11})");
                if (videoIdMatch.Success)
                {
                    var ytId = videoIdMatch.Groups[1].Value;
                    var thumbnailResult = await DownloadAndEncodeThumbnailAsync(
                        ytId,
                        imageUrl,
                        cancellationToken
                    );
                    thumbnailResult.Switch(path => thumbnailPath = path, _ => { });
                }
            }

            return new OgMetadata(title, description, imageUrl, thumbnailPath);
        }
        catch (HttpRequestException ex)
        {
            return new InternalError($"HTTP request failed: {ex.Message}");
        }
        catch (TaskCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            return new InternalError($"Failed to fetch metadata: {ex.Message}");
        }
    }

    private static string? ExtractMetaContent(string html, string property)
    {
        var pattern = OgMetaPattern();
        var matches = pattern.Matches(html);

        foreach (Match match in matches)
        {
            var prop = match.Groups["property"].Value;
            if (prop.Equals(property, StringComparison.OrdinalIgnoreCase))
            {
                return System.Net.WebUtility.HtmlDecode(match.Groups["content"].Value);
            }
        }

        return null;
    }

    private static string? ExtractTitleTag(string html)
    {
        var match = TitleTagPattern().Match(html);
        return match.Success ? System.Net.WebUtility.HtmlDecode(match.Groups[1].Value) : null;
    }

    [GeneratedRegex(
        """<meta[^>]+property=["'](?<property>[^"']+)["'][^>]+content=["'](?<content>[^"']*)["'][^>]*>|<meta[^>]+content=["'](?<content2>[^"']*)["'][^>]+property=["'](?<property2>[^"']+)["'][^>]*>""",
        RegexOptions.IgnoreCase | RegexOptions.Singleline
    )]
    private static partial Regex OgMetaPattern();

    [GeneratedRegex(@"<title[^>]*>([^<]+)</title>", RegexOptions.IgnoreCase)]
    private static partial Regex TitleTagPattern();

    private async Task<OneOf<string, InternalError>> DownloadAndEncodeThumbnailAsync(
        string ytId,
        string imageUrl,
        CancellationToken cancellationToken
    )
    {
        logger.LogInformation("Starting thumbnail download for YouTube video {YtId}", ytId);
        try
        {
            var tempImagePath = Path.Combine(StorageOptions.YtThumbnailPath, $"{ytId}_temp.jpg");
            var webpPath = Path.Combine(StorageOptions.YtThumbnailPath, $"{ytId}.webp");

            Directory.CreateDirectory(StorageOptions.YtThumbnailPath);

            if (File.Exists(webpPath))
            {
                logger.LogDebug(
                    "Thumbnail already exists at {WebpPath}, skipping download",
                    webpPath
                );
                return webpPath;
            }

            if (File.Exists(tempImagePath))
            {
                File.Delete(tempImagePath);
            }

            logger.LogDebug("Downloading thumbnail image from {ImageUrl}", imageUrl);
            var imageBytes = await httpClient.GetByteArrayAsync(imageUrl, cancellationToken);
            await File.WriteAllBytesAsync(tempImagePath, imageBytes, cancellationToken);
            logger.LogDebug(
                "Downloaded {Bytes} bytes, saved to {TempPath}",
                imageBytes.Length,
                tempImagePath
            );

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

            logger.LogInformation(
                "Successfully downloaded and encoded thumbnail for {YtId} to {WebpPath}",
                ytId,
                webpPath
            );
            return webpPath;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to download thumbnail for {YtId}", ytId);
            return new InternalError($"Failed to download thumbnail: {ex.Message}");
        }
    }
}
