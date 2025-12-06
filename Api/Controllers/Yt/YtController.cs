using Microsoft.AspNetCore.Mvc;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.Yt;

[ApiController]
[Route("api/[controller]")]
public class YtController(AddYtSongUseCase addYtSongUseCase) : ControllerBase
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
}
