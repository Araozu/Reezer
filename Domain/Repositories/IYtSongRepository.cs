using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Domain.Entities.Yt;

namespace Reezer.Domain.Repositories;

public interface IYtSongRepository
{
    Task<OneOf<IEnumerable<YtSong>, InternalError>> GetPaginatedAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    );

    Task<OneOf<(Stream Stream, string ContentType), NotFound, InternalError>> GetSongStreamAsync(
        string ytId,
        CancellationToken cancellationToken = default
    );
}
