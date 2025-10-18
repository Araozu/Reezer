using Reezer.Application.Repositories;

namespace Reezer.Application.UseCases;

public class PrepareSongUseCase(ISongRepository songRepository)
{
    public void PrepareSongAsync(Guid songId)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                var (stream, _) = await songRepository.GetSongStreamWithContentTypeAsync(
                    songId,
                    CancellationToken.None
                );
                await stream.DisposeAsync();
            }
            catch
            {
                // Silently ignore errors in background preparation
            }
        });
    }
}
