using Reezer.Domain.Entities.Songs;

namespace Reezer.Domain.Repositories;

public interface ISongRepository
{
    Task<IEnumerable<Song>> GetAllSongsAsync(CancellationToken cancellationToken = default);
    Task<Stream> GetSongStreamAsync(Guid songId, CancellationToken cancellationToken = default);
    Task<(Stream Stream, string ContentType)> GetSongStreamWithContentTypeAsync(
        Guid songId,
        CancellationToken cancellationToken = default
    );
}
