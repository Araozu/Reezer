using MediatR;
using Microsoft.AspNetCore.SignalR;
using Reezer.Api.Hubs.Music;
using Reezer.Application.Notifications;

public class HelloNotificationHandler(
    IHubContext<MusicRoomHub> hubContext,
    ILogger<HelloNotificationHandler> logger
) : INotificationHandler<HelloNotification>
{
    public async Task Handle(HelloNotification notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("HelloNotification received with Name: {Name}", notification.Name);
        await hubContext.Clients.All.SendAsync(
            "MessageReceived",
            new { Hello = notification.Name },
            cancellationToken
        );
    }
}
