using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases.Search;

namespace Reezer.Api.Controllers.Search;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SearchController(UnifiedSearchUseCase unifiedSearchUseCase) : ControllerBase
{
    [EndpointSummary("Unified search across songs, YouTube songs, albums, and artists")]
    [HttpGet]
    public async Task<ActionResult<UnifiedSearchResultDto>> Search(
        [FromQuery] string q,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest(new ProblemDetails { Detail = "Search query cannot be empty" });
        }

        if (limit is < 1 or > 50)
        {
            limit = 10;
        }

        var result = await unifiedSearchUseCase.SearchAsync(q, limit, cancellationToken);

        Response.Headers.CacheControl = "public, max-age=300";
        return Ok(result);
    }
}
