using MediatR;
using OneOf;
using Reezer.Application.Notifications;
using Reezer.Domain.Repositories.Room;
using Reezer.Domain.Utils;

namespace Reezer.Application.Commands;

public record UpdateSeekCommand(string RoomCode, long Position)
    : IRequest<OneOf<Success, NotFound>>;

public class UpdateSeekHandler(IMusicRoomRepository roomRepository, IPublisher publisher)
    : IRequestHandler<UpdateSeekCommand, OneOf<Success, NotFound>>
{
    public async Task<OneOf<Success, NotFound>> Handle(
        UpdateSeekCommand request,
        CancellationToken cancellationToken
    )
    {
        var roomResult = await roomRepository.GetByCodeAsync(request.RoomCode, cancellationToken);

        return await roomResult.Match<Task<OneOf<Success, NotFound>>>(
            async room =>
            {
                room.SetPosition(request.Position);
                await publisher.Publish(
                    new PlayStateChangedNotification(
                        room.Code,
                        room.IsPlaying,
                        room.CurrentPosition,
                        room.LastUpdateServerTime
                    ),
                    cancellationToken
                );
                return new Success();
            },
            notFound => Task.FromResult<OneOf<Success, NotFound>>(notFound)
        );
    }
}
