using MediatR;
using Microsoft.Extensions.Logging;

namespace Reezer.Application.Commands;

public record MusicRoomHelloCommand(string Name) : IRequest;

public class MusicRoomHelloCommandHandler(ILogger<MusicRoomHelloCommandHandler> logger)
    : IRequestHandler<MusicRoomHelloCommand>
{
    public Task Handle(MusicRoomHelloCommand request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Hello from MusicRoomHelloCommandHandler, {Name}!", request.Name);
        return Task.CompletedTask;
    }
}
