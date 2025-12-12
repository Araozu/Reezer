using MediatR;
using Reezer.Application.Notifications;

namespace Reezer.Application.Commands;

public record SendChatMessageCommand(string UserId, string UserName, string Message) : IRequest;

public class SendChatMessageCommandHandler(IMediator mediator)
    : IRequestHandler<SendChatMessageCommand>
{
    public async Task Handle(SendChatMessageCommand request, CancellationToken cancellationToken)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        await mediator.Publish(
            new ChatMessageNotification(
                request.UserId,
                request.UserName,
                request.Message,
                timestamp
            ),
            cancellationToken
        );
    }
}
