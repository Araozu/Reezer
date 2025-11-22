using Reezer.Application.DTOs.Auth;

namespace Reezer.Application.Services;

public interface IAuthService
{
    Task<LoginResult> LoginAsync(
        LoginCommand command,
        CancellationToken cancellationToken = default
    );
    Task<LoginResult> GoogleLoginAsync(
        string returnUrl,
        CancellationToken cancellationToken = default
    );
    Task<LoginResult> HandleGoogleCallbackAsync(CancellationToken cancellationToken = default);
    Task LogoutAsync(CancellationToken cancellationToken = default);
}
