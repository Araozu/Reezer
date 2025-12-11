using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Reezer.Application.Commands;
using Reezer.Domain.Repositories.Room;
using Reezer.Infrastructure.Identity;

namespace Reezer.Api.Hubs.Music;

[Authorize]
public class MusicRoomHub(
    ILogger<MusicRoomHub> logger,
    ISender mediator,
    IMusicRoomRepository musicRoomRepository,
    UserManager<User> userManager
) : Hub
{
    public const string Route = "/hub/MusicRoom";

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
                code: roomId!,
                userId: Guid.Parse(userId),
                connectionId: Context.ConnectionId
            )
        );
        result.Switch(
            ok => { },
            notFound =>
            {
                throw new HubException($"Room with ID {roomId} not found");
            }
        );

        await base.OnConnectedAsync();
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

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new HubException("User not found");
        }

        var userName = user.Name ?? user.UserName ?? "Unknown";

        logger.LogInformation(
            "Chat message from {UserName} ({UserId}): {Message}",
            userName,
            userId,
            message
        );

        await mediator.Send(new SendChatMessageCommand(userId, userName, message));
    }
}
