using MediatR;
using Microsoft.Extensions.Logging;
using OneOf;
using Reezer.Application.Notifications;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;
using Reezer.Domain.Utils;

namespace Reezer.Application.Commands;

public record UpdateRoomQueueCommand(string RoomCode, IEnumerable<RoomSong> Queue, int CurrentIndex)
    : IRequest<OneOf<Success, NotFound>>;

public class UpdateRoomQueueCommandHandler(
    IMusicRoomRepository roomRepository,
    IPublisher publisher,
    ILogger<UpdateRoomQueueCommandHandler> logger
) : IRequestHandler<UpdateRoomQueueCommand, OneOf<Success, NotFound>>
{
    public async Task<OneOf<Success, NotFound>> Handle(
        UpdateRoomQueueCommand request,
        CancellationToken cancellationToken
    )
    {
        var roomResult = await roomRepository.GetByCodeAsync(request.RoomCode, cancellationToken);

        logger.LogInformation(
            "Setting queue for Room:",
            request.RoomCode,
            string.Join(", ", request.Queue.Select(q => q.Name)),
            request.CurrentIndex
        );

        return await roomResult.Match<Task<OneOf<Success, NotFound>>>(
            async room =>
            {
                room.SetQueue(request.Queue, request.CurrentIndex);

                await publisher.Publish(
                    new RoomQueueChangedNotification(
                        room.Code,
                        room.Queue,
                        room.CurrentIndex,
                        room.IsPlaying
                    ),
                    cancellationToken
                );

                return new Success();
            },
            notFound => Task.FromResult<OneOf<Success, NotFound>>(notFound)
        );
    }
}
