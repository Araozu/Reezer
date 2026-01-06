using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Reezer.Application.Commands;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;
using Reezer.Infrastructure.Identity;

namespace Reezer.Api.Hubs.Music;

public enum MusicRoomResponses
{
    Connected,
    RoomNotFound,
    UserNotFound,
    QueueChanged,
    InvalidRequest,
}

[Authorize]
public class MusicRoomHub(
    ILogger<MusicRoomHub> logger,
    ISender mediator,
    UserManager<User> userManager,
    IMusicRoomRepository roomRepository
) : Hub
{
    public const string Route = "/hub/MusicRoom";

    /// <summary>
    /// Connects a user to a room.
    /// </summary>
    /// <exception cref="HubException"></exception>
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var roomId = httpContext?.Request.Query["roomId"];
        if (string.IsNullOrEmpty(roomId))
        {
            throw new HubException("Room ID is required to connect");
        }

        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId))
        {
            throw new HubException("User is not authenticated");
        }

        // Try connect to room
        var result = await mediator.Send(
            new ConnectToRoomCommand(
                Code: roomId!,
                UserId: Guid.Parse(userId),
                ConnectionId: Context.ConnectionId
            )
        );

        await result.Match(
            async room =>
            {
                // Send the current queue state to the caller
                await Groups.AddToGroupAsync(Context.ConnectionId, room.Code);
                await Clients.Caller.SendAsync(
                    MusicRoomResponses.QueueChanged.ToString(),
                    room.Queue,
                    room.CurrentIndex
                );
            },
            notFound =>
            {
                throw new HubException($"Room with ID {roomId} not found");
            }
        );

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await mediator.Send(new DisconnectFromRoomCommand(Context.ConnectionId));
        await base.OnDisconnectedAsync(exception);
    }

    public long SyncClock()
    {
        return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    public async Task SendMessage(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            throw new HubException("Message cannot be empty");
        }

        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId))
        {
            throw new HubException("User is not authenticated");
        }

        var room = roomRepository.GetRoomByConnectionId(Context.ConnectionId);
        if (room == null)
        {
            throw new HubException("Room not found for this connection");
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new HubException("User not found");
        }

        var userName = user.Name ?? user.UserName ?? "Unknown";

        logger.LogInformation(
            $"Chat message from {userName} ({userId}) in room {room.Code}: {message}"
        );

        await mediator.Send(new SendChatMessageCommand(room.Code, userId, userName, message));
    }

    public async Task SetQueue(IEnumerable<RoomSong> queue, int currentIndex)
    {
        var room = roomRepository.GetRoomByConnectionId(Context.ConnectionId);
        if (room == null)
        {
            throw new HubException("Room not found for this connection");
        }

        var result = await mediator.Send(
            new UpdateRoomQueueCommand(room.Code, queue, currentIndex)
        );
        result.Switch(ok => { }, notFound => throw new HubException(notFound.Reason));
    }
}
