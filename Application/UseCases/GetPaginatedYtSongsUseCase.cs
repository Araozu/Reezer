using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Application.DTOs;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class GetPaginatedYtSongsUseCase(IYtSongRepository ytSongRepository)
{
    public async Task<OneOf<PaginatedResult<YtSongDto>, InternalError>> GetPaginatedAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        var result = await ytSongRepository.GetPaginatedAsync(page, pageSize, cancellationToken);

        return result.Match<OneOf<PaginatedResult<YtSongDto>, InternalError>>(
            songs =>
            {
                var dtos = songs.Select(s => new YtSongDto(s.YtId, s.Name, s.CachedPath));
                return new PaginatedResult<YtSongDto>(dtos, page, pageSize, dtos.Count());
            },
            error => error
        );
    }
}
