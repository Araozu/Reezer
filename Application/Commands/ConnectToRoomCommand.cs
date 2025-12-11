using MediatR;
using Microsoft.Extensions.Logging;
using OneOf;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;

namespace Reezer.Application.Commands;

public record ConnectToRoomCommand(string code, Guid userId, string connectionId)
    : IRequest<OneOf<MusicRoom, Domain.Utils.NotFound>>;

public class ConnectToRoomCommandHandler(
    ILogger<ConnectToRoomCommandHandler> logger,
    IMusicRoomRepository roomRepository
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

        return addResult;
    }
}
