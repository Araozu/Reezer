using OneOf;
using Reezer.Domain.Entities.Yt;
using Reezer.Domain.Utils;

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

    Task<
        OneOf<(Stream Stream, string ContentType), NotFound, InternalError>
    > GetThumbnailStreamAsync(string ytId, CancellationToken cancellationToken = default);

    Task<OneOf<YtSong, InternalError>> AddAsync(
        YtSong ytSong,
        CancellationToken cancellationToken = default
    );

    Task<OneOf<YtSong, NotFound>> GetByIdAsync(
        string ytId,
        CancellationToken cancellationToken = default
    );

    Task<OneOf<YtSong, InternalError>> UpdateAsync(
        YtSong ytSong,
        CancellationToken cancellationToken = default
    );
}
