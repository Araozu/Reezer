using System.Text.RegularExpressions;
using Acide.Perucontrol.Domain.Utils;
using Microsoft.Extensions.Options;
using OneOf;
using Reezer.Domain.Repositories;
using Reezer.Infrastructure.Options;

namespace Reezer.Infrastructure.Services;

public partial class YtService(IOptions<StorageOptions> storageOptions) : IYtService
{
    private StorageOptions StorageOptions => storageOptions.Value;

    [GeneratedRegex(@"[?&]v=([a-zA-Z0-9_-]{11})")]
    private static partial Regex VideoIdRegex();

    public async Task<
        OneOf<(Stream Stream, string ContentType), BadRequest, NotFound>
    > GetYtStreamAsync(string youtubeUrl, CancellationToken cancellationToken = default)
    {
        var match = VideoIdRegex().Match(youtubeUrl);
        if (!match.Success)
        {
            return new BadRequest("Invalid YouTube URL format. Could not extract video ID.");
        }

        var videoId = match.Groups[1].Value;

        var webmPath = Path.Combine(StorageOptions.LibraryYtPath, $"{videoId}.webm");

        if (!File.Exists(webmPath))
        {
            return new NotFound($"YouTube video {videoId} not found.");
        }

        return await Task.FromResult<
            OneOf<(Stream Stream, string ContentType), BadRequest, NotFound>
        >((new FileStream(webmPath, FileMode.Open, FileAccess.Read, FileShare.Read), "audio/webm"));
    }
}
