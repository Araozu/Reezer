using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController(GetAllSongsUseCase getAllSongsUseCase) : ControllerBase
{
    [EndpointSummary("Get all songs")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SongDto>>> GetAllSongs(
        CancellationToken cancellationToken
    )
    {
        var songs = await getAllSongsUseCase.GetAllSongsAsync(cancellationToken);
        return Ok(songs);
    }
}
