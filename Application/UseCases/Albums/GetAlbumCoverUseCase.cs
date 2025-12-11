using OneOf;
using Reezer.Domain.Repositories;
using Reezer.Domain.Utils;

namespace Reezer.Application.UseCases;

public class GetAlbumCoverUseCase(IAlbumRepository albumRepository)
{
    public async Task<
        OneOf<(Stream Stream, string ContentType), NotFound, InternalError>
    > GetAlbumCoverAsync(Guid albumId, CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await albumRepository.GetAlbumCoverStreamAsync(albumId, cancellationToken);
            return result;
        }
        catch (KeyNotFoundException ex)
        {
            return new NotFound(ex.Message);
        }
        catch (FileNotFoundException ex)
        {
            return new NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return new InternalError(ex.Message);
        }
    }
}
