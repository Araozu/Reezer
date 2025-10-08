using Reezer.Application.Repositories;

namespace Reezer.Application.UseCases;

public class GetAlbumCoverUseCase(ISongRepository songRepository)
{
    public async Task<(Stream Stream, string ContentType)> GetAlbumCoverAsync(
        Guid albumId,
        CancellationToken cancellationToken = default
    )
    {
        return await songRepository.GetAlbumCoverStreamAsync(albumId, cancellationToken);
    }
}
