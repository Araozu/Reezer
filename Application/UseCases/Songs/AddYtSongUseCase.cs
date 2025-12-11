using System.Text.RegularExpressions;
using OneOf;
using Reezer.Domain.Entities.Yt;
using Reezer.Domain.Repositories;
using Reezer.Domain.Utils;

namespace Reezer.Application.UseCases;

public partial class AddYtSongUseCase(IYtService ytService, IYtSongRepository ytSongRepository)
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

        var downloadResult = await ytService.DownloadAsync(videoId, cancellationToken);

        return await downloadResult.Match(
            async result =>
            {
                var ytSong = new YtSong(videoId, result.Title);
                ytSong.SetCachedPath(result.AudioPath);
                ytSong.SetThumbnailPath(result.ThumbnailPath);

                var addResult = await ytSongRepository.AddAsync(ytSong, cancellationToken);
                return addResult.Match<OneOf<YtSong, BadRequest, NotFound, InternalError>>(
                    song => song,
                    error => error
                );
            },
            error => Task.FromResult<OneOf<YtSong, BadRequest, NotFound, InternalError>>(error)
        );
    }

    private static string? ExtractVideoId(string url)
    {
        var match = YoutubeVideoIdPattern().Match(url);
        return match.Success ? match.Groups["id"].Value : null;
    }

    [GeneratedRegex(
        @"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)(?<id>[a-zA-Z0-9_-]{11})",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex YoutubeVideoIdPattern();
}
