using MediatR;
using Microsoft.AspNetCore.SignalR;
using Reezer.Application.Notifications;

namespace Reezer.Api.Hubs.Music;

public class PlayStateChangedNotificationHandler(IHubContext<MusicRoomHub> hubContext)
    : INotificationHandler<PlayStateChangedNotification>
{
    public async Task Handle(
        PlayStateChangedNotification notification,
        CancellationToken cancellationToken
    )
    {
        await hubContext
            .Clients.Group(notification.RoomCode)
            .SendAsync(
                MusicRoomResponses.PlayStateChanged.ToString(),
                notification.IsPlaying,
                notification.Position,
                notification.ServerTime
            );
    }
}
