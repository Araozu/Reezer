using MediatR;
using Microsoft.Extensions.Logging;
using Reezer.Application.Notifications;

namespace Reezer.Application.Commands;

public record MusicRoomHelloCommand(string Name) : IRequest;

public class MusicRoomHelloCommandHandler(
    IMediator mediator,
    ILogger<MusicRoomHelloCommandHandler> logger
) : IRequestHandler<MusicRoomHelloCommand>
{
    public async Task Handle(MusicRoomHelloCommand request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Hello from MusicRoomHelloCommandHandler, {Name}!", request.Name);
        await mediator.Publish(new HelloNotification(request.Name));
    }
}
