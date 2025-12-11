using OneOf;
using Reezer.Domain.Utils;

namespace Reezer.Domain.Repositories;

public record YtDownloadResult(string Title, string AudioPath, string ThumbnailPath);

public interface IYtService
{
    Task SaveCookiesAsync(Stream stream, CancellationToken cancellationToken = default);

    Task<OneOf<YtDownloadResult, InternalError>> DownloadAsync(
        string ytId,
        CancellationToken cancellationToken = default
    );
}
