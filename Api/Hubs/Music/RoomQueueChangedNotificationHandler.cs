using MediatR;
using Microsoft.AspNetCore.SignalR;
using Reezer.Application.Notifications;

namespace Reezer.Api.Hubs.Music;

public class RoomQueueChangedNotificationHandler(IHubContext<MusicRoomHub> hubContext)
    : INotificationHandler<RoomQueueChangedNotification>
{
    public async Task Handle(
        RoomQueueChangedNotification notification,
        CancellationToken cancellationToken
    )
    {
        await hubContext
            .Clients.Group(notification.RoomCode)
            .SendAsync(
                MusicRoomResponses.QueueChanged.ToString(),
                notification.Queue,
                notification.CurrentIndex,
                notification.IsPlaying,
                notification.Position,
                notification.ServerTime,
                cancellationToken
            );
    }
}
