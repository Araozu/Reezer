using Microsoft.AspNetCore.Identity;
using Reezer.Application.DTOs.Auth;
using Reezer.Application.Services;

namespace Reezer.Infrastructure.Services;

public class AuthService(
    SignInManager<IdentityUser> signInManager,
    UserManager<IdentityUser> userManager
) : IAuthService
{
    public async Task<LoginResult> LoginAsync(
        LoginCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var user = await userManager.FindByEmailAsync(command.Email);
        if (user == null)
        {
            return new LoginResult(false, "Invalid email or password");
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
            return new LoginResult(false, "Account is locked out");
        }

        return new LoginResult(false, "Invalid email or password");
    }

    public async Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        await signInManager.SignOutAsync();
    }
}
