using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.Artists;

[ApiController]
[Route("api/[controller]")]
public class ArtistsController(GetArtistByIdUseCase getArtistByIdUseCase) : ControllerBase
{
    [EndpointSummary("Get artist by ID")]
    [HttpGet("{artistId}")]
    public async Task<ActionResult<ArtistDto>> GetArtist(
        Guid artistId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await getArtistByIdUseCase.GetArtistByIdAsync(artistId, cancellationToken);
        Response.Headers.CacheControl = "public, max-age=1800";
        return Ok(result);
    }
}
