using Acide.Perucontrol.Domain.Utils;
using OneOf;

namespace Reezer.Domain.Repositories;

public interface IYtService
{
    Task<OneOf<string, InternalError>> DownloadAndCacheAsync(
        string ytId,
        CancellationToken cancellationToken = default
    );
}
