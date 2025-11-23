using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace Reezer.Api.Hubs;

public record RoomState(string RoomCode, HashSet<string> ConnectedUsers, PlayerState PlayerState);

public class MusicRoomHub(ILogger<MusicRoomHub> logger) : Hub
{
    public const string Route = "/hubs/MusicRoom";
    private static readonly ConcurrentDictionary<string, RoomState> rooms = new();

    public static IEnumerable<RoomState> GetRooms() => rooms.Values;

    public static RoomState CreateRoom(string roomCode)
    {
        var playerState = new PlayerState { Queue = [], CurrentSongIndex = 0 };
        var room = new RoomState(roomCode, [], playerState);
        rooms.TryAdd(roomCode, room);
        return room;
    }

    public async Task<string> JoinRoom(string roomCode, string username)
    {
        var playerState = new PlayerState { Queue = [], CurrentSongIndex = 0 };
        var room = rooms.GetOrAdd(roomCode, _ => new RoomState(roomCode, [], playerState));

        room.ConnectedUsers.Add(Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        await Clients.Group(roomCode).SendAsync("UserJoined", username);

        logger.LogInformation("User {Username} joined room {RoomCode}", username, roomCode);

        return roomCode;
    }

    public Task<SyncResponse> SyncTime(long clientTimestamp)
    {
        var serverReceiveTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var serverSendTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        return Task.FromResult(new SyncResponse(serverReceiveTime, serverSendTime));
    }

    public Task<Guid> GeneratePlayerId()
    {
        return Task.FromResult(Guid.NewGuid());
    }

    public Task<PlayerState?> GetPlayerState(string roomCode)
    {
        if (rooms.TryGetValue(roomCode, out var room))
        {
            return Task.FromResult<PlayerState?>(room.PlayerState);
        }
        return Task.FromResult<PlayerState?>(null);
    }

    public async Task PlaySong(string roomCode, Guid clientId, ISong songState)
    {
        if (!rooms.TryGetValue(roomCode, out var room))
        {
            logger.LogWarning("Attempted to play song in non-existent room {RoomCode}", roomCode);
            return;
        }

        room.PlayerState.Queue.Add(songState);
        room.PlayerState.CurrentSongIndex++;

        await Clients.Group(roomCode).SendAsync("PlaySong", clientId, songState);
        logger.LogInformation(
            "Playing song {SongName} in room {RoomCode}",
            songState.Name,
            roomCode
        );
    }
}

public record SyncResponse(long ServerReceiveTime, long ServerSendTime);

public class PlayerState
{
    public required List<ISong> Queue { get; set; }
    public required uint CurrentSongIndex { get; set; }
}

public record ISong(Guid Id, string Name, string Artist, string Album, Guid ArtistId, Guid AlbumId);
