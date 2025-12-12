using MediatR;
using Microsoft.Extensions.Logging;
using Reezer.Application.Notifications;
using Reezer.Domain.Repositories.Room;

namespace Reezer.Application.Commands;

public record DisconnectFromRoomCommand(string connectionId) : IRequest;

public class DisconnectFromRoomCommandHandler(
    ILogger<DisconnectFromRoomCommandHandler> logger,
    IMusicRoomRepository roomRepository,
    IPublisher publisher
) : IRequestHandler<DisconnectFromRoomCommand>
{
    public async Task Handle(DisconnectFromRoomCommand request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Disconnecting connection {ConnectionId}", request.connectionId);
        var room = roomRepository.RemoveConnection(request.connectionId);

        if (room != null)
        {
            var uniqueUserIds = room.Participants.Select(p => p.UserId).Distinct().ToList();
            await publisher.Publish(
                new ConnectedUsersChangedNotification(room.Code, uniqueUserIds),
                cancellationToken
            );
        }
    }
}
