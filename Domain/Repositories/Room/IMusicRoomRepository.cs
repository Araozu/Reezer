using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Domain.Entities.Room;

namespace Reezer.Domain.Repositories.Room;

public interface IMusicRoomRepository
{
    Task<IEnumerable<MusicRoom>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<OneOf<MusicRoom, NotFound>> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );
    Task AddAsync(MusicRoom room, CancellationToken cancellationToken = default);
    Task<OneOf<Success, NotFound>> RemoveAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );
}
