using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.Artists;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ArtistsController(
    GetArtistByIdUseCase getArtistByIdUseCase,
    GetPaginatedArtistsUseCase getPaginatedArtistsUseCase
) : ControllerBase
{
    [EndpointSummary("Get paginated list of artists")]
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<ArtistDto>>> GetArtists(
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

        var result = await getPaginatedArtistsUseCase.GetPaginatedArtistsAsync(
            page,
            pageSize,
            search,
            cancellationToken
        );

        Response.Headers.CacheControl = "public, max-age=1800";
        return Ok(result);
    }

    [EndpointSummary("Get artist by ID")]
    [HttpGet("{artistId}")]
    public async Task<ActionResult<ArtistDto>> GetArtist(
        Guid artistId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await getArtistByIdUseCase.GetArtistByIdAsync(artistId, cancellationToken);

        return result.Match<ActionResult<ArtistDto>>(
            artist =>
            {
                Response.Headers.CacheControl = "public, max-age=1800";
                return Ok(artist);
            },
            notFound => NotFound(new ProblemDetails { Detail = notFound.Reason })
        );
    }
}
