using Reezer.Domain.Entities;
using Reezer.Domain.Entities.Songs;

namespace Reezer.Application.Repositories;

public interface ISongRepository
{
    Task<IEnumerable<Song>> GetAllSongsAsync(CancellationToken cancellationToken = default);
    Task<Stream> GetSongStreamAsync(Guid songId, CancellationToken cancellationToken = default);
    Task<(Stream Stream, string ContentType)> GetSongStreamWithContentTypeAsync(
        Guid songId,
        CancellationToken cancellationToken = default
    );
    Task<(Stream Stream, string ContentType)> GetAlbumCoverStreamAsync(
        Guid albumId,
        CancellationToken cancellationToken = default
    );
    Task<(IEnumerable<Album> Albums, int TotalCount)> GetPaginatedAlbumsAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    );
    Task<Album> GetAlbumWithSongsAsync(Guid albumId, CancellationToken cancellationToken = default);
}
