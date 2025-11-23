using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace Reezer.Api.Hubs;

public record RoomState(string RoomCode, HashSet<string> ConnectedUsers);

public class MusicRoomHub(ILogger<MusicRoomHub> logger) : Hub
{
    public const string Route = "/hubs/MusicRoom";
    private static readonly ConcurrentDictionary<string, RoomState> rooms = new();

    public static IEnumerable<RoomState> GetRooms() => rooms.Values;

    public static RoomState CreateRoom(string roomCode)
    {
        var room = new RoomState(roomCode, []);
        rooms.TryAdd(roomCode, room);
        return room;
    }

    public async Task<string> JoinRoom(string roomCode, string username)
    {
        var room = rooms.GetOrAdd(roomCode, _ => new RoomState(roomCode, []));

        room.ConnectedUsers.Add(Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        await Clients.Group(roomCode).SendAsync("UserJoined", username);

        logger.LogInformation("User {Username} joined room {RoomCode}", username, roomCode);

        return roomCode;
    }
}
