using OneOf;
using Reezer.Domain.Repositories;
using Reezer.Domain.Utils;

namespace Reezer.Application.UseCases;

public class StreamYtSongUseCase(IYtSongRepository ytSongRepository)
{
    public async Task<OneOf<StreamResult, NotFound, InternalError>> StreamYtSongAsync(
        string ytId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await ytSongRepository.GetSongStreamAsync(ytId, cancellationToken);

        return result.Match<OneOf<StreamResult, NotFound, InternalError>>(
            success => new StreamResult(success.Stream, success.ContentType),
            notFound => notFound,
            error => error
        );
    }
}
