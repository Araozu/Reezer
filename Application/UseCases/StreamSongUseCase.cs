using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public record StreamResult(Stream Stream, string ContentType);

public class StreamSongUseCase(ISongRepository songRepository)
{
    public async Task<StreamResult> StreamSongAsync(
        Guid songId,
        CancellationToken cancellationToken = default
    )
    {
        var (stream, contentType) = await songRepository.GetSongStreamWithContentTypeAsync(
            songId,
            cancellationToken
        );
        return new StreamResult(stream, contentType);
    }
}
