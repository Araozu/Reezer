using System.Text.RegularExpressions;
using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Domain.Entities.Yt;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public partial class AddYtSongUseCase(
    IOgMetadataService ogMetadataService,
    IYtSongRepository ytSongRepository
)
{
    public async Task<OneOf<YtSong, BadRequest, NotFound, InternalError>> ExecuteAsync(
        string ytUrl,
        CancellationToken cancellationToken = default
    )
    {
        var videoId = ExtractVideoId(ytUrl);
        if (videoId is null)
        {
            return new BadRequest("Invalid YouTube URL");
        }

        var existingResult = await ytSongRepository.GetByIdAsync(videoId, cancellationToken);
        if (existingResult.IsT0)
        {
            return existingResult.AsT0;
        }

        var metadataResult = await ogMetadataService.GetMetadataAsync(ytUrl, cancellationToken);

        return await metadataResult.Match(
            async metadata =>
            {
                var title = TrimYouTubeSuffix(metadata.Title);
                var ytSong = new YtSong(videoId, title);

                var addResult = await ytSongRepository.AddAsync(ytSong, cancellationToken);
                return addResult.Match<OneOf<YtSong, BadRequest, NotFound, InternalError>>(
                    song => song,
                    error => error
                );
            },
            notFound =>
                Task.FromResult<OneOf<YtSong, BadRequest, NotFound, InternalError>>(notFound),
            error => Task.FromResult<OneOf<YtSong, BadRequest, NotFound, InternalError>>(error)
        );
    }

    private static string? ExtractVideoId(string url)
    {
        var match = YoutubeVideoIdPattern().Match(url);
        return match.Success ? match.Groups["id"].Value : null;
    }

    private static string TrimYouTubeSuffix(string title)
    {
        var suffixPattern = YouTubeSuffixPattern();
        return suffixPattern.Replace(title, "").Trim();
    }

    [GeneratedRegex(
        @"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)(?<id>[a-zA-Z0-9_-]{11})",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex YoutubeVideoIdPattern();

    [GeneratedRegex(@"\s*-\s*YouTube\s*$", RegexOptions.IgnoreCase)]
    private static partial Regex YouTubeSuffixPattern();
}
