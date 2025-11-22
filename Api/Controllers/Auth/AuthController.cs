using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs.Auth;
using Reezer.Application.Services;

namespace Reezer.Api.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [EndpointSummary("Login with email and password")]
    public async Task<ActionResult<LoginResult>> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var result = await authService.LoginAsync(command, cancellationToken);

        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    [Authorize]
    [HttpPost("logout")]
    [EndpointSummary("Logout current user")]
    public async Task<ActionResult> Logout(CancellationToken cancellationToken = default)
    {
        await authService.LogoutAsync(cancellationToken);
        return Ok();
    }
}
