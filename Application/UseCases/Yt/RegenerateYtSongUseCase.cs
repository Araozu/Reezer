using OneOf;
using Reezer.Domain.Entities.Yt;
using Reezer.Domain.Repositories;
using Reezer.Domain.Utils;

namespace Reezer.Application.UseCases;

public class RegenerateYtSongUseCase(IYtService ytService, IYtSongRepository ytSongRepository)
{
    public async Task<OneOf<YtSong, NotFound, InternalError>> ExecuteAsync(
        string ytId,
        CancellationToken cancellationToken = default
    )
    {
        var existingResult = await ytSongRepository.GetByIdAsync(ytId, cancellationToken);
        if (existingResult.IsT1)
        {
            return new NotFound($"YouTube song with ID {ytId} not found.");
        }

        var downloadResult = await ytService.DownloadAsync(ytId, cancellationToken);

        return await downloadResult.Match(
            async result =>
            {
                var existingSong = existingResult.AsT0;
                existingSong.SetCachedPath(result.AudioPath);
                existingSong.SetThumbnailPath(result.ThumbnailPath);

                var updateResult = await ytSongRepository.UpdateAsync(
                    existingSong,
                    cancellationToken
                );
                return updateResult.Match<OneOf<YtSong, NotFound, InternalError>>(
                    song => song,
                    error => error
                );
            },
            error => Task.FromResult<OneOf<YtSong, NotFound, InternalError>>(error)
        );
    }
}
