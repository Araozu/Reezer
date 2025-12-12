using MediatR;
using Microsoft.Extensions.Logging;
using OneOf;
using Reezer.Application.Notifications;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;

namespace Reezer.Application.Commands;

public record ConnectToRoomCommand(string code, Guid userId, string connectionId)
    : IRequest<OneOf<MusicRoom, Domain.Utils.NotFound>>;

public class ConnectToRoomCommandHandler(
    ILogger<ConnectToRoomCommandHandler> logger,
    IMusicRoomRepository roomRepository,
    IPublisher publisher
) : IRequestHandler<ConnectToRoomCommand, OneOf<MusicRoom, Domain.Utils.NotFound>>
{
    public async Task<OneOf<MusicRoom, Domain.Utils.NotFound>> Handle(
        ConnectToRoomCommand request,
        CancellationToken cancellationToken
    )
    {
        logger.LogInformation(
            "User {UserId} is connecting to room with code {Code}",
            request.userId,
            request.code
        );

        var addResult = await roomRepository.AddConnection(
            roomCode: request.code,
            userId: request.userId,
            connectionId: request.connectionId
        );

        await addResult.Match(
            async room =>
            {
                var uniqueUserIds = room.Participants.Select(p => p.UserId).Distinct().ToList();
                await publisher.Publish(
                    new ConnectedUsersChangedNotification(room.Code, uniqueUserIds),
                    cancellationToken
                );
            },
            _ => Task.CompletedTask
        );

        return addResult;
    }
}
