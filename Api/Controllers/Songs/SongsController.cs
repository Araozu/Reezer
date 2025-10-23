using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.Songs;

[ApiController]
[Route("api/[controller]")]
public class SongsController(
    GetAllSongsUseCase getAllSongsUseCase,
    StreamSongUseCase streamSongUseCase,
    PrepareSongUseCase prepareSongUseCase
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

        Response.Headers.CacheControl = "public, max-age=2592000"; // 30 days
        return File(result.Stream, result.ContentType, enableRangeProcessing: true);
    }

    [EndpointSummary("Prepare a song for streaming by transcoding it in the background")]
    [HttpPost("{songId}/prepare")]
    public async Task<IActionResult> PrepareSong(Guid songId)
    {
        await prepareSongUseCase.PrepareSongAsync(songId);
        return Ok();
    }
}
