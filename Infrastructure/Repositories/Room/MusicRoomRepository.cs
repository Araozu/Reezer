using System.Collections.Concurrent;
using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;

namespace Reezer.Infrastructure.Repositories.Room;

public class MusicRoomRepository : IMusicRoomRepository
{
    private static readonly ConcurrentDictionary<Guid, MusicRoom> _rooms = new();

    public Task<IEnumerable<MusicRoom>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_rooms.Values.AsEnumerable());
    }

    public Task<OneOf<MusicRoom, NotFound>> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        if (_rooms.TryGetValue(id, out var room))
        {
            return Task.FromResult<OneOf<MusicRoom, NotFound>>(room);
        }

        return Task.FromResult<OneOf<MusicRoom, NotFound>>(
            new NotFound($"MusicRoom with ID {id} not found.")
        );
    }

    public Task<OneOf<Success, NotFound>> RemoveAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        if (_rooms.TryRemove(id, out _))
        {
            return Task.FromResult<OneOf<Success, NotFound>>(new Success());
        }

        return Task.FromResult<OneOf<Success, NotFound>>(
            new NotFound($"MusicRoom with ID {id} not found.")
        );
    }
}
