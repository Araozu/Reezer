using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.Albums;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class AlbumsController(
    GetAlbumCoverUseCase getAlbumCoverUseCase,
    GetPaginatedAlbumsUseCase getPaginatedAlbumsUseCase,
    GetAlbumWithTracklistUseCase getAlbumWithTracklistUseCase
) : ControllerBase
{
    [EndpointSummary("Get paginated list of albums")]
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<AlbumDto>>> GetAlbums(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default
    )
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize is < 1 or > 100)
        {
            pageSize = 20;
        }

        var result = await getPaginatedAlbumsUseCase.GetPaginatedAlbumsAsync(
            page,
            pageSize,
            search,
            cancellationToken
        );

        Response.Headers.CacheControl = "public, max-age=1800";
        return Ok(result);
    }

    [EndpointSummary("Get album with tracklist by album ID")]
    [HttpGet("{albumId}")]
    public async Task<ActionResult<AlbumWithTracklistDto>> GetAlbum(
        Guid albumId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await getAlbumWithTracklistUseCase.GetAlbumWithTracklistAsync(
            albumId,
            cancellationToken
        );

        return result.Match<ActionResult<AlbumWithTracklistDto>>(
            album =>
            {
                Response.Headers.CacheControl = "public, max-age=1800";
                return Ok(album);
            },
            notFound => NotFound(new ProblemDetails { Detail = notFound.Reason })
        );
    }

    [EndpointSummary("Get album cover by album ID")]
    [HttpGet("{albumId:guid}/cover")]
    public async Task<IActionResult> GetAlbumCover(
        Guid albumId,
        CancellationToken cancellationToken
    )
    {
        var result = await getAlbumCoverUseCase.GetAlbumCoverAsync(albumId, cancellationToken);

        return result.Match<IActionResult>(
            success =>
            {
                Response.Headers.CacheControl = "public, max-age=2592000";
                return File(success.Stream, success.ContentType);
            },
            notFound => NotFound(new ProblemDetails { Detail = notFound.Reason }),
            internalError => StatusCode(500, new ProblemDetails { Detail = internalError.Reason })
        );
    }
}
