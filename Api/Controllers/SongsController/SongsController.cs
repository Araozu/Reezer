using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController(
    GetAllSongsUseCase getAllSongsUseCase,
    StreamSongUseCase streamSongUseCase
) : ControllerBase
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

    [EndpointSummary("Stream a song by ID")]
    [HttpGet("{songId}/stream")]
    public async Task<IActionResult> StreamSong(Guid songId, CancellationToken cancellationToken)
    {
        var result = await streamSongUseCase.StreamSongAsync(songId, cancellationToken);
        return File(result.Stream, result.ContentType, enableRangeProcessing: true);
    }
}
