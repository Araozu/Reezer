using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Application.DTOs.Auth;

namespace Reezer.Application.Services;

public interface IAuthService
{
    Task<OneOf<LoginResult, Unauthorized>> LoginAsync(
        LoginCommand command,
        CancellationToken cancellationToken = default
    );
    Task<LoginResult> GoogleLoginAsync(
        string returnUrl,
        CancellationToken cancellationToken = default
    );
    Task<OneOf<LoginResult, Unauthorized, InternalError>> HandleGoogleCallbackAsync(
        CancellationToken cancellationToken = default
    );
    Task LogoutAsync(CancellationToken cancellationToken = default);
}
