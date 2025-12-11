using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.Songs;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SongsController(
    StreamSongUseCase streamSongUseCase,
    PrepareSongUseCase prepareSongUseCase
) : ControllerBase
{
    [EndpointSummary("Stream a song by ID")]
    [AllowAnonymous]
    [HttpGet("{songId}/stream")]
    public async Task<IActionResult> StreamSong(Guid songId, CancellationToken cancellationToken)
    {
        var result = await streamSongUseCase.StreamSongAsync(songId, cancellationToken);

        return result.Match<IActionResult>(
            success =>
            {
                Response.Headers.CacheControl = "public, max-age=2592000";
                return File(success.Stream, success.ContentType, enableRangeProcessing: true);
            },
            notFound =>
                NotFound(
                    new ProblemDetails
                    {
                        Detail = notFound.Reason,
                        Status = StatusCodes.Status404NotFound,
                    }
                ),
            internalError =>
                StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new ProblemDetails
                    {
                        Detail = internalError.Reason,
                        Status = StatusCodes.Status500InternalServerError,
                    }
                )
        );
    }

    [EndpointSummary("Prepare a song for streaming by transcoding it in the background")]
    [HttpPost("{songId}/prepare")]
    public async Task<IActionResult> PrepareSong(Guid songId)
    {
        var result = await prepareSongUseCase.PrepareSongAsync(songId);

        return result.Match<IActionResult>(
            success => Ok(),
            notFound =>
                NotFound(
                    new ProblemDetails
                    {
                        Detail = notFound.Reason,
                        Status = StatusCodes.Status404NotFound,
                    }
                ),
            internalError =>
                StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new ProblemDetails
                    {
                        Detail = internalError.Reason,
                        Status = StatusCodes.Status500InternalServerError,
                    }
                )
        );
    }
}
