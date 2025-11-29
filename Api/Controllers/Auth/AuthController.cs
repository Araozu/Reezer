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

        return result.Match<ActionResult<LoginResult>>(
            success => Ok(success),
            unauthorized =>
                Unauthorized(
                    new ProblemDetails
                    {
                        Detail = unauthorized.Reason,
                        Status = StatusCodes.Status401Unauthorized,
                    }
                )
        );
    }

    [HttpGet("google")]
    [EndpointSummary("Initiate Google OAuth login")]
    public async Task<ActionResult> GoogleLogin(
        [FromQuery] string returnUrl,
        CancellationToken cancellationToken = default
    )
    {
        await authService.GoogleLoginAsync(returnUrl, cancellationToken);
        return new EmptyResult();
    }

    [HttpGet("google-internal-callback")]
    [EndpointSummary("Handle Google OAuth callback")]
    public async Task<ActionResult> GoogleCallback(
        [FromQuery] string returnUrl,
        CancellationToken cancellationToken = default
    )
    {
        var result = await authService.HandleGoogleCallbackAsync(cancellationToken);

        return result.Match<ActionResult>(
            success => Redirect(returnUrl),
            unauthorized => Redirect($"/?error={Uri.EscapeDataString(unauthorized.Reason)}"),
            internalError => Redirect($"/?error={Uri.EscapeDataString(internalError.Reason)}")
        );
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
