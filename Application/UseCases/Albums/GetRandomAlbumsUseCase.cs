using Reezer.Application.DTOs;
using Reezer.Domain.Repositories;

namespace Reezer.Application.UseCases;

public class GetRandomAlbumsUseCase(IAlbumRepository albumRepository)
{
    public async Task<PaginatedResult<AlbumDto>> GetRandomAlbumsAsync(
        int page = 1,
        int pageSize = 20,
        int? seed = null,
        CancellationToken cancellationToken = default
    )
    {
        var actualSeed = seed ?? DateTime.UtcNow.Date.GetHashCode();

        var (albums, totalCount) = await albumRepository.GetRandomAlbumsAsync(
            page,
            pageSize,
            actualSeed,
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
