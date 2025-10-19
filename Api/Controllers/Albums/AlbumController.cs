using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers;

[ApiController]
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
        CancellationToken cancellationToken = default
    )
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1 || pageSize > 100)
        {
            pageSize = 20;
        }

        var result = await getPaginatedAlbumsUseCase.GetPaginatedAlbumsAsync(
            page,
            pageSize,
            cancellationToken
        );

        Response.Headers.CacheControl = "public, max-age=1800"; // 30 minutes
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
        Response.Headers.CacheControl = "public, max-age=1800"; // 30 minutes
        return Ok(result);
    }

    [EndpointSummary("Get album cover by album ID")]
    [HttpGet("{albumId:guid}/cover")]
    public async Task<IActionResult> GetAlbumCover(
        Guid albumId,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var result = await getAlbumCoverUseCase.GetAlbumCoverAsync(albumId, cancellationToken);
            Response.Headers.CacheControl = "public, max-age=2592000";
            return File(result.Stream, result.ContentType);
        }
        catch (FileNotFoundException)
        {
            return NotFound();
        }
    }
}
