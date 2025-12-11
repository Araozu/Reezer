using Reezer.Domain.Entities;

namespace Reezer.Domain.Repositories;

public interface IAlbumRepository
{
    Task<(Stream Stream, string ContentType)> GetAlbumCoverStreamAsync(
        Guid albumId,
        CancellationToken cancellationToken = default
    );
    Task<(IEnumerable<Album> Albums, int TotalCount)> GetPaginatedAlbumsAsync(
        int page,
        int pageSize,
        string? search = null,
        CancellationToken cancellationToken = default
    );
    Task<Album> GetAlbumWithSongsAsync(Guid albumId, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Album> Albums, int TotalCount)> GetRandomAlbumsAsync(
        int page,
        int pageSize,
        int seed,
        CancellationToken cancellationToken = default
    );
}
