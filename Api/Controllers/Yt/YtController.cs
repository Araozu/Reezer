using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.Yt;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class YtController(
    AddYtSongUseCase addYtSongUseCase,
    GetPaginatedYtSongsUseCase getPaginatedYtSongsUseCase,
    StreamYtSongUseCase streamYtSongUseCase,
    GetYtThumbnailUseCase getYtThumbnailUseCase,
    RegenerateYtSongUseCase regenerateYtSongUseCase,
    SetYtCookiesUseCase setYtCookiesUseCase
) : ControllerBase
{
    public record AddYtSongRequest(string Url);

    public record YtSongResponse(string YtId, string Name);

    [EndpointSummary("Add a YouTube song by URL")]
    [HttpPost]
    public async Task<ActionResult<YtSongResponse>> AddYtSong(
        [FromBody] AddYtSongRequest request,
        CancellationToken cancellationToken
    )
    {
        var result = await addYtSongUseCase.ExecuteAsync(request.Url, cancellationToken);

        return result.Match<ActionResult<YtSongResponse>>(
            song => Created($"/api/yt/{song.YtId}", new YtSongResponse(song.YtId, song.Name)),
            badRequest => BadRequest(new ProblemDetails { Detail = badRequest.Reason }),
            notFound => NotFound(new ProblemDetails { Detail = notFound.Reason }),
            error => StatusCode(500, new ProblemDetails { Detail = error.Reason })
        );
    }

    [EndpointSummary("Get paginated YouTube songs")]
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<YtSongDto>>> GetPaginatedYtSongs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default
    )
    {
        var result = await getPaginatedYtSongsUseCase.GetPaginatedAsync(
            page,
            pageSize,
            cancellationToken
        );

        return result.Match<ActionResult<PaginatedResult<YtSongDto>>>(
            songs => Ok(songs),
            error =>
                StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new ProblemDetails
                    {
                        Detail = error.Reason,
                        Status = StatusCodes.Status500InternalServerError,
                    }
                )
        );
    }

    [EndpointSummary("Stream a YouTube song by ID")]
    [HttpGet("{ytId}/stream")]
    public async Task<IActionResult> StreamYtSong(string ytId, CancellationToken cancellationToken)
    {
        var result = await streamYtSongUseCase.StreamYtSongAsync(ytId, cancellationToken);

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

    [EndpointSummary("Get YouTube video thumbnail by ID")]
    [HttpGet("{ytId}/thumbnail")]
    public async Task<IActionResult> GetYtThumbnail(
        string ytId,
        CancellationToken cancellationToken
    )
    {
        var result = await getYtThumbnailUseCase.GetThumbnailAsync(ytId, cancellationToken);

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

    [EndpointSummary("Regenerate a YouTube song from its ID")]
    [HttpPost("{ytId}/regenerate")]
    public async Task<ActionResult<YtSongResponse>> RegenerateYtSong(
        string ytId,
        CancellationToken cancellationToken
    )
    {
        var result = await regenerateYtSongUseCase.ExecuteAsync(ytId, cancellationToken);

        return result.Match<ActionResult<YtSongResponse>>(
            song => Ok(new YtSongResponse(song.YtId, song.Name)),
            notFound => NotFound(new ProblemDetails { Detail = notFound.Reason }),
            internalError => StatusCode(500, new ProblemDetails { Detail = internalError.Reason })
        );
    }

    [EndpointSummary("Set YouTube cookies from file")]
    [HttpPost("cookies")]
    public async Task<IActionResult> SetYtCookies(
        IFormFile file,
        CancellationToken cancellationToken
    )
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ProblemDetails { Detail = "No file provided" });
        }

        await using var stream = file.OpenReadStream();
        await setYtCookiesUseCase.ExecuteAsync(stream, cancellationToken);
        return Ok();
    }
}
