using Microsoft.AspNetCore.Mvc;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumController(GetAlbumCoverUseCase getAlbumCoverUseCase) : ControllerBase
{
    [EndpointSummary("Get album cover by album ID")]
    [HttpGet("{albumId}/cover")]
    public async Task<IActionResult> GetAlbumCover(
        Guid albumId,
        CancellationToken cancellationToken
    )
    {
        var result = await getAlbumCoverUseCase.GetAlbumCoverAsync(albumId, cancellationToken);
        return File(result.Stream, result.ContentType);
    }
}
