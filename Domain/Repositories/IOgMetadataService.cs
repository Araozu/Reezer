using Acide.Perucontrol.Domain.Utils;
using OneOf;

namespace Reezer.Domain.Repositories;

public record OgMetadata(string Title, string? Description, string? ImageUrl, string? ThumbnailPath);

public interface IOgMetadataService
{
    Task<OneOf<OgMetadata, NotFound, InternalError>> GetMetadataAsync(
        string url,
        CancellationToken cancellationToken = default
    );
}
