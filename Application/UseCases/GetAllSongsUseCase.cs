using Reezer.Application.DTOs;
using Reezer.Application.Repositories;

namespace Reezer.Application.UseCases;

public class GetAllSongsUseCase(ISongRepository songRepository)
{
    public async Task<IEnumerable<SongDto>> GetAllSongsAsync(
        CancellationToken cancellationToken = default
    )
    {
        var songs = await songRepository.GetAllSongsAsync(cancellationToken);
        return songs.Select(song => new SongDto(song.Id, song.Name));
    }
}
