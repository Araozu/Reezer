using Reezer.Application.DTOs;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class GetPaginatedAlbumsUseCase(ISongRepository songRepository)
{
    public async Task<PaginatedResult<AlbumDto>> GetPaginatedAlbumsAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        CancellationToken cancellationToken = default
    )
    {
        var (albums, totalCount) = await songRepository.GetPaginatedAlbumsAsync(
            page,
            pageSize,
            search,
            cancellationToken
        );

        var albumDtos = albums.Select(album => new AlbumDto(
            album.Id,
            album.Name,
            album.ArtistId,
            album.Artist.Name,
            album.CoverPath
        ));

        return new PaginatedResult<AlbumDto>(albumDtos, page, pageSize, totalCount);
    }
}
