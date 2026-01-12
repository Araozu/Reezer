using MediatR;
using OneOf;
using Reezer.Application.Notifications;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;
using Reezer.Domain.Utils;

namespace Reezer.Application.Commands;

public enum AddPosition
{
    Next,
    Last,
}

public record AddSongsToQueueCommand(
    string ConnectionId,
    IEnumerable<RoomSong> Songs,
    AddPosition Position
) : IRequest<OneOf<Success, NotFound>>;

public class AddSongsToQueueCommandHandler(
    IMusicRoomRepository roomRepository,
    IPublisher publisher
) : IRequestHandler<AddSongsToQueueCommand, OneOf<Success, NotFound>>
{
    public async Task<OneOf<Success, NotFound>> Handle(
        AddSongsToQueueCommand request,
        CancellationToken cancellationToken
    )
    {
        var room = roomRepository.GetRoomByConnectionId(request.ConnectionId);
        if (room == null)
        {
            return new NotFound("Room not found");
        }

        if (request.Position == AddPosition.Last)
        {
            room.AddLastSongList(request.Songs);
        }
        else
        {
            room.AddNextSongList(request.Songs);
        }

        await publisher.Publish(
            new RoomQueueChangedNotification(
                room.Code,
                room.Queue,
                room.CurrentIndex,
                room.IsPlaying,
                room.CurrentPosition,
                room.LastUpdateServerTime
            ),
            cancellationToken
        );

        return new Success();
    }
}
