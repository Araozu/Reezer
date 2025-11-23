using Acide.Perucontrol.Domain.Utils;
using Microsoft.Extensions.Logging;
using OneOf;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class PrepareSongUseCase(ISongRepository songRepository, ILogger<PrepareSongUseCase> logger)
{
    public async Task<OneOf<Success, NotFound, InternalError>> PrepareSongAsync(Guid songId)
    {
        try
        {
            logger.LogInformation("Preparing song {SongId}", songId);
            _ = await songRepository.GetSongStreamWithContentTypeAsync(songId);
            logger.LogInformation("Song {SongId} prepared", songId);
            return new Success();
        }
        catch (KeyNotFoundException ex)
        {
            logger.LogWarning(ex, "Song {SongId} not found", songId);
            return new NotFound(ex.Message);
        }
        catch (FileNotFoundException ex)
        {
            logger.LogWarning(ex, "Song file {SongId} not found", songId);
            return new NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error preparing song {SongId}", songId);
            return new InternalError(ex.Message);
        }
    }
}
