using Reezer.Application.DTOs;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class GetAllSongsUseCase(ISongRepository songRepository)
{
    public async Task<IEnumerable<SongDto>> ExecuteAsync(
        CancellationToken cancellationToken = default
    )
    {
        var songs = await songRepository.GetAllSongsAsync(cancellationToken);
        return songs.Select(s => new SongDto(
            s.Id,
            s.Name,
            s.TrackNumber,
            s.DiscNumber,
            s.Album.Artist.Name,
            s.Album.Name,
            s.Album.Artist.Id,
            s.Album.Id
        ));
    }
}
