using System.Collections.Concurrent;
using OneOf;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;
using Reezer.Domain.Utils;

namespace Reezer.Infrastructure.Repositories.Room;

public class MusicRoomRepository : IMusicRoomRepository
{
    private readonly ConcurrentDictionary<string, MusicRoom> _rooms = new();

    public Task<IEnumerable<MusicRoom>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_rooms.Values.AsEnumerable());
    }

    public Task<OneOf<MusicRoom, NotFound>> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken = default
    )
    {
        if (_rooms.TryGetValue(code, out var room))
        {
            return Task.FromResult<OneOf<MusicRoom, NotFound>>(room);
        }
        return Task.FromResult<OneOf<MusicRoom, NotFound>>(new NotFound("Room not found"));
    }

    public Task AddAsync(MusicRoom room, CancellationToken cancellationToken = default)
    {
        _rooms.TryAdd(room.Code, room);
        return Task.CompletedTask;
    }

    public async Task<OneOf<MusicRoom, NotFound>> AddConnection(
        string roomCode,
        Guid userId,
        string connectionId
    )
    {
        var roomResult = await GetByCodeAsync(roomCode);
        return roomResult.Match<OneOf<MusicRoom, NotFound>>(
            room =>
            {
                room.AddConnection(userId, connectionId);
                return room;
            },
            notFound => notFound
        );
    }

    public MusicRoom? RemoveConnection(string connectionId)
    {
        foreach (var room in _rooms.Values)
        {
            var participantToRemove = room.Participants.FirstOrDefault(p =>
                p.ConnectionId == connectionId
            );

            if (participantToRemove != default)
            {
                room.RemoveParticipant(
                    participantToRemove.UserId,
                    participantToRemove.ConnectionId
                );
                return room;
            }
        }
        return null;
    }

    public MusicRoom? GetRoomByConnectionId(string connectionId)
    {
        return _rooms.Values.FirstOrDefault(room =>
            room.Participants.Any(p => p.ConnectionId == connectionId)
        );
    }

    public IEnumerable<string> GetConnections(string userId)
    {
        throw new NotImplementedException();
        //
    }

    public IEnumerable<string> GetOnlineUsers()
    {
        throw new NotImplementedException();
        //
    }

    public Task<OneOf<Success, NotFound>> RemoveAsync(
        string code,
        CancellationToken cancellationToken = default
    )
    {
        throw new NotImplementedException();
    }

    public string GenerateRoomCode()
    {
        int maxAttempts = 10000;
        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            string code = GenCode();
            if (!_rooms.Values.Any(r => r.Code == code))
            {
                return code;
            }
        }
        throw new Exception("Failed to generate a unique room code after maximum attempts.");
    }

    private static string GenCode()
    {
        var random = new Random();
        var chars = "0123456789ABCDEF";
        return new string(
            Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray()
        );
    }
}
