using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Infrastructure.Identity;

namespace Reezer.Api.Controllers.User;

[ApiController]
[Route("api/[controller]")]
public class UserController(UserManager<Infrastructure.Identity.User> userManager) : ControllerBase
{
    [Authorize]
    [HttpGet("me")]
    [EndpointSummary("Get current user information")]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized(
                new ProblemDetails
                {
                    Detail = "User not authenticated",
                    Status = StatusCodes.Status401Unauthorized,
                }
            );
        }

        return Ok(new UserDto(user.Id, user.Email, user.Name, user.UserName));
    }
}
