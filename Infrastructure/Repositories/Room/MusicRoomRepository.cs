using System.Collections.Concurrent;
using Acide.Perucontrol.Domain.Utils;
using OneOf;
using Reezer.Application.Services;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;

namespace Reezer.Infrastructure.Repositories.Room;

public class MusicRoomRepository : IMusicRoomRepository, IConnectionManager
{
    private readonly ConcurrentDictionary<Guid, MusicRoom> _rooms = new();

    // ConnectionManager logic
    // Map UserId -> Set of ConnectionIds
    private readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();

    // Map ConnectionId -> UserId (for fast removal)
    private readonly ConcurrentDictionary<string, string> _connectionUserMap = new();

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

    public Task AddAsync(MusicRoom room, CancellationToken cancellationToken = default)
    {
        _rooms.TryAdd(room.Id, room);
        return Task.CompletedTask;
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

    // IConnectionManager implementation
    public void AddConnection(string userId, string connectionId)
    {
        _userConnections.AddOrUpdate(
            userId,
            _ => [connectionId],
            (_, connections) =>
            {
                lock (connections)
                {
                    connections.Add(connectionId);
                }
                return connections;
            }
        );

        _connectionUserMap[connectionId] = userId;
    }

    public void RemoveConnection(string connectionId)
    {
        if (_connectionUserMap.TryRemove(connectionId, out var userId))
        {
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                lock (connections)
                {
                    connections.Remove(connectionId);
                }

                if (connections.Count == 0)
                {
                    _userConnections.TryRemove(userId, out _);
                }
            }
        }
    }

    public IEnumerable<string> GetConnections(string userId)
    {
        if (_userConnections.TryGetValue(userId, out var connections))
        {
            lock (connections)
            {
                return [.. connections];
            }
        }
        return [];
    }

    public IEnumerable<string> GetOnlineUsers()
    {
        return _userConnections.Keys;
    }
}
