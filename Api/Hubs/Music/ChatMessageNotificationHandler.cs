using MediatR;
using Microsoft.AspNetCore.SignalR;
using Reezer.Application.Notifications;

namespace Reezer.Api.Hubs.Music;

public class ChatMessageNotificationHandler(
    IHubContext<MusicRoomHub> hubContext,
    ILogger<ChatMessageNotificationHandler> logger
) : INotificationHandler<ChatMessageNotification>
{
    public async Task Handle(
        ChatMessageNotification notification,
        CancellationToken cancellationToken
    )
    {
        logger.LogInformation(
            "ChatMessageNotification received from {UserName}: {Message}",
            notification.UserName,
            notification.Message
        );
        await hubContext.Clients.All.SendAsync(
            "ChatMessage",
            new
            {
                userId = notification.UserId,
                userName = notification.UserName,
                message = notification.Message,
                timestamp = notification.Timestamp
            },
            cancellationToken
        );
    }
}
