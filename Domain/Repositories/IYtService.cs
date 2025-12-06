using Acide.Perucontrol.Domain.Utils;
using OneOf;

namespace Reezer.Domain.Repositories;

public interface IYtService
{
    Task<OneOf<(Stream Stream, string ContentType), BadRequest, NotFound>> GetYtStreamAsync(
        string youtubeUrl,
        CancellationToken cancellationToken = default
    );
}
