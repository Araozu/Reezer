using OneOf;
using Reezer.Domain.Repositories;
using Reezer.Domain.Utils;

namespace Reezer.Application.UseCases.Yt;

public class DeleteYtSongUseCase(IYtSongRepository ytSongRepository)
{
    public async Task<OneOf<Success, NotFound, InternalError>> ExecuteAsync(
        string ytId,
        CancellationToken cancellationToken = default
    )
    {
        return await ytSongRepository.DeleteAsync(ytId, cancellationToken);
    }
}
