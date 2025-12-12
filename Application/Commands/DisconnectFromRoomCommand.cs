using MediatR;
using Microsoft.Extensions.Logging;
using Reezer.Domain.Repositories.Room;

namespace Reezer.Application.Commands;

public record DisconnectFromRoomCommand(string connectionId) : IRequest;

public class DisconnectFromRoomCommandHandler(
    ILogger<DisconnectFromRoomCommandHandler> logger,
    IMusicRoomRepository roomRepository
) : IRequestHandler<DisconnectFromRoomCommand>
{
    public Task Handle(DisconnectFromRoomCommand request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Disconnecting connection {ConnectionId}", request.connectionId);
        roomRepository.RemoveConnection(request.connectionId);
        return Task.CompletedTask;
    }
}
