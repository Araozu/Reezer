using MediatR;
using OneOf;
using Reezer.Application.Notifications;
using Reezer.Domain.Repositories.Room;
using Reezer.Domain.Utils;

namespace Reezer.Application.Commands;

public record UpdatePlayStateCommand(string RoomCode, bool IsPlaying, long? Position = null)
    : IRequest<OneOf<Success, NotFound>>;

public class UpdatePlayStateHandler(IMusicRoomRepository roomRepository, IPublisher publisher)
    : IRequestHandler<UpdatePlayStateCommand, OneOf<Success, NotFound>>
{
    public async Task<OneOf<Success, NotFound>> Handle(
        UpdatePlayStateCommand request,
        CancellationToken cancellationToken
    )
    {
        var roomResult = await roomRepository.GetByCodeAsync(request.RoomCode, cancellationToken);

        return await roomResult.Match<Task<OneOf<Success, NotFound>>>(
            async room =>
            {
                room.SetPlayState(request.IsPlaying, request.Position);
                
                // Get the position AFTER setting it to ensure we send the clamped/calculated value
                var currentPos = room.CurrentPosition;
                
                await publisher.Publish(
                    new PlayStateChangedNotification(
                        room.Code,
                        room.IsPlaying,
                        currentPos,
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
