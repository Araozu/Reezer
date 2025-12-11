using OneOf;
using Reezer.Domain.Repositories;
using Reezer.Domain.Utils;

namespace Reezer.Application.UseCases;

public class GetYtThumbnailUseCase(IYtSongRepository ytSongRepository)
{
    public async Task<
        OneOf<(Stream Stream, string ContentType), NotFound, InternalError>
    > GetThumbnailAsync(string ytId, CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await ytSongRepository.GetThumbnailStreamAsync(ytId, cancellationToken);
            return result;
        }
        catch (Exception ex)
        {
            return new InternalError(ex.Message);
        }
    }
}
