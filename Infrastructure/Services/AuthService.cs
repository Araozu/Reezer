using System.Security.Claims;
using Acide.Perucontrol.Domain.Utils;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using OneOf;
using Reezer.Application.DTOs.Auth;
using Reezer.Application.Services;
using Reezer.Infrastructure.Identity;

namespace Reezer.Infrastructure.Services;

public class AuthService(
    SignInManager<User> signInManager,
    UserManager<User> userManager,
    IHttpContextAccessor httpContextAccessor
) : IAuthService
{
    public async Task<OneOf<LoginResult, Unauthorized>> LoginAsync(
        LoginCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var user = await userManager.FindByEmailAsync(command.Email);
        if (user == null)
        {
            return new Unauthorized("Invalid email or password");
        }

        var result = await signInManager.PasswordSignInAsync(
            user,
            command.Password,
            isPersistent: true,
            lockoutOnFailure: true
        );

        if (result.Succeeded)
        {
            return new LoginResult(true);
        }

        if (result.IsLockedOut)
        {
            return new Unauthorized("Account is locked out");
        }

        return new Unauthorized("Invalid email or password");
    }

    public async Task<LoginResult> GoogleLoginAsync(
        string returnUrl,
        CancellationToken cancellationToken = default
    )
    {
        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return new LoginResult(false, "HTTP context not available");
        }

        var encodedReturnUrl = Uri.EscapeDataString(returnUrl);

        await httpContext.ChallengeAsync(
            GoogleDefaults.AuthenticationScheme,
            new()
            {
                RedirectUri = $"/api/auth/google-internal-callback?returnUrl={encodedReturnUrl}",
            }
        );
        return new LoginResult(true);
    }

    public async Task<OneOf<LoginResult, Unauthorized, InternalError>> HandleGoogleCallbackAsync(
        CancellationToken cancellationToken = default
    )
    {
        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return new InternalError("HTTP context not available");
        }

        var authenticateResult = await httpContext.AuthenticateAsync(
            IdentityConstants.ExternalScheme
        );
        if (!authenticateResult.Succeeded)
        {
            return new Unauthorized("External authentication failed");
        }

        var externalUser = authenticateResult.Principal;
        if (externalUser == null)
        {
            return new Unauthorized("External user information not found");
        }

        var email = externalUser.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return new Unauthorized("Email not provided by Google");
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            var name = externalUser.FindFirstValue(ClaimTypes.Name);

            user = new User
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                Name = name,
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return new InternalError("Failed to create user account");
            }
        }

        await signInManager.SignInAsync(user, isPersistent: true);
        await httpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        return new LoginResult(true);
    }

    public async Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        await signInManager.SignOutAsync();
    }
}
