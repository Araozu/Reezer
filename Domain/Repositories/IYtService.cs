using Acide.Perucontrol.Domain.Utils;
using OneOf;

namespace Reezer.Domain.Repositories;

public interface IYtService
{
    Task SaveCookiesAsync(Stream stream, CancellationToken cancellationToken = default);

    Task<OneOf<string, InternalError>> DownloadAndCacheAsync(
        string ytId,
        CancellationToken cancellationToken = default
    );

    Task<OneOf<string, InternalError>> DownloadAndEncodeThumbnailAsync(
        string ytId,
        CancellationToken cancellationToken = default
    );
}
