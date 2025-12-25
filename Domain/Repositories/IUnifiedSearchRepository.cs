using Reezer.Domain.Entities;
using Reezer.Domain.Entities.Songs;
using Reezer.Domain.Entities.Yt;

namespace Reezer.Application.UseCases.Search;

public interface IUnifiedSearchRepository
{
    Task<(
        IEnumerable<Song> Songs,
        IEnumerable<YtSong> YtSongs,
        IEnumerable<Album> Albums,
        IEnumerable<Artist> Artists
    )> SearchAsync(string query, int limit = 10, CancellationToken cancellationToken = default);
}
