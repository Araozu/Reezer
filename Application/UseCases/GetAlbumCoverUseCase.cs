using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class GetAlbumCoverUseCase(IAlbumRepository albumRepository)
{
    public async Task<(Stream Stream, string ContentType)> GetAlbumCoverAsync(
        Guid albumId,
        CancellationToken cancellationToken = default
    )
    {
        return await albumRepository.GetAlbumCoverStreamAsync(albumId, cancellationToken);
    }
}
