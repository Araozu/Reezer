using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Reezer.Application.Commands;
using Reezer.Application.Services;

namespace Reezer.Api.Hubs.Music;

[Authorize]
public class MusicRoomHub(
    ILogger<MusicRoomHub> logger,
    ISender mediator,
    IConnectionManager connectionManager
) : Hub
{
    public const string Route = "/hub/MusicRoom";

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var roomId = httpContext?.Request.Query["roomId"];

        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId))
        {
            throw new HubException("User is not authenticated");
        }

        connectionManager.AddConnection(userId, Context.ConnectionId);
        logger.LogInformation(
            "User {UserId} connected with ConnectionId {ConnectionId} to room {RoomId}",
            userId,
            Context.ConnectionId,
            roomId
        );
        // Add connection to the room

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        connectionManager.RemoveConnection(Context.ConnectionId);
        logger.LogInformation("Connection {ConnectionId} disconnected", Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }

    public async Task Hello(string name)
    {
        logger.LogInformation("Data received in MusicRoomHub.Hello: {Name}", name);
        await mediator.Send(new MusicRoomHelloCommand(name));
    }

    public long SyncClock()
    {
        return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }
}
