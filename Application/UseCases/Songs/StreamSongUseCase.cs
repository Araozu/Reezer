using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public record StreamResult(Stream Stream, string ContentType);

public class StreamSongUseCase(ISongRepository songRepository)
{
    public async Task<OneOf<StreamResult, NotFound, InternalError>> StreamSongAsync(
        Guid songId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var (stream, contentType) = await songRepository.GetSongStreamWithContentTypeAsync(
                songId,
                cancellationToken
            );
            return new StreamResult(stream, contentType);
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
