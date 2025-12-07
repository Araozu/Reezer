using Microsoft.AspNetCore.Mvc;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.System;

[ApiController]
[Route("api/[controller]")]
public class SystemController(SetYtCookiesUseCase setYtCookiesUseCase) : ControllerBase
{
    public record SetYtCookiesRequest(string Text);

    [EndpointSummary("Store YouTube cookies text")]
    [HttpPost("yt-cookies")]
    public async Task<ActionResult> SetYtCookies(
        [FromBody] SetYtCookiesRequest request,
        CancellationToken cancellationToken
    )
    {
        await setYtCookiesUseCase.ExecuteAsync(request.Text, cancellationToken);
        return Ok();
    }
}
