using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Reezer.Application.Notifications;
using Reezer.Infrastructure.Identity;

namespace Reezer.Api.Hubs.Music;

public class ConnectedUsersChangedNotificationHandler(
    IHubContext<MusicRoomHub> hubContext,
    ILogger<ConnectedUsersChangedNotificationHandler> logger,
    UserManager<User> userManager
) : INotificationHandler<ConnectedUsersChangedNotification>
{
    public async Task Handle(
        ConnectedUsersChangedNotification notification,
        CancellationToken cancellationToken
    )
    {
        logger.LogInformation(
            "Connected users changed in room {RoomCode}: {Count} users",
            notification.RoomCode,
            notification.UserIds.Count
        );

        var connectedUsers = new List<object>();
        foreach (var userId in notification.UserIds)
        {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user != null)
            {
                connectedUsers.Add(
                    new
                    {
                        userId = userId.ToString(),
                        userName = user.Name ?? user.UserName ?? "Unknown",
                    }
                );
            }
        }

        await hubContext.Clients.All.SendAsync(
            "ConnectedUsersChanged",
            connectedUsers,
            cancellationToken
        );
    }
}
