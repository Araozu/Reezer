using Reezer.Application.DTOs.Auth;

namespace Reezer.Application.Services;

public interface IAuthService
{
    Task<LoginResult> LoginAsync(
        LoginCommand command,
        CancellationToken cancellationToken = default
    );
    Task LogoutAsync(CancellationToken cancellationToken = default);
}
