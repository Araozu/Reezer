using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.System;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SystemController(SetYtCookiesUseCase setYtCookiesUseCase) : ControllerBase
{
    [EndpointSummary("Store YouTube cookies file")]
    [HttpPost("yt-cookies")]
    public async Task<ActionResult> SetYtCookies(
        IFormFile file,
        CancellationToken cancellationToken
    )
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ProblemDetails { Detail = "No file uploaded or file is empty" });
        }

        await using var stream = file.OpenReadStream();
        await setYtCookiesUseCase.ExecuteAsync(stream, cancellationToken);
        return Ok();
    }
}
