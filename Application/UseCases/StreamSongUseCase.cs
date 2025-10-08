using Reezer.Application.Repositories;

namespace Reezer.Application.UseCases;

public class StreamSongUseCase(ISongRepository songRepository)
{
    public async Task<Stream> StreamSongAsync(
        Guid songId,
        CancellationToken cancellationToken = default
    )
    {
        return await songRepository.GetSongStreamAsync(songId, cancellationToken);
    }
}
