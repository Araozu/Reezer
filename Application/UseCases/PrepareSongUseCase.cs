using Microsoft.Extensions.Logging;
using Reezer.Application.Repositories;

namespace Reezer.Application.UseCases;

public class PrepareSongUseCase(ISongRepository songRepository, ILogger<PrepareSongUseCase> logger)
{
    public async Task PrepareSongAsync(Guid songId)
    {
        try
        {
            logger.LogInformation("Preparing song {SongId}", songId);
            _ = await songRepository.GetSongStreamWithContentTypeAsync(songId);
            logger.LogInformation("Song {SongId} prepared", songId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error preparing song {SongId}", songId);
            throw;
        }
    }
}
