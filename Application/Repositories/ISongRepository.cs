using Reezer.Domain.Entities.Songs;

namespace Reezer.Application.Repositories;

public interface ISongRepository
{
    Task<IEnumerable<Song>> GetAllSongsAsync(CancellationToken cancellationToken = default);
    Task<Stream> GetSongStreamAsync(Guid songId, CancellationToken cancellationToken = default);
}
