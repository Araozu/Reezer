using MediatR;
using Microsoft.Extensions.Logging;
using OneOf;
using Reezer.Application.Notifications;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;
using Reezer.Domain.Utils;

namespace Reezer.Application.Commands;

public record PlaySongListCommand(string ConnectionId, IEnumerable<RoomSong> Songs)
    : IRequest<OneOf<Success, NotFound>>;

public class PlaySongListCommandHandler(
    IMusicRoomRepository roomRepository,
    IPublisher publisher,
    ILogger<PlaySongListCommandHandler> logger
) : IRequestHandler<PlaySongListCommand, OneOf<Success, NotFound>>
{
    public async Task<OneOf<Success, NotFound>> Handle(
        PlaySongListCommand request,
        CancellationToken cancellationToken
    )
    {
        var room = roomRepository.GetRoomByConnectionId(request.ConnectionId);
        if (room == null)
        {
            return new NotFound("Room not found");
        }

        // TODO: validate permissions & belonging to the room

        // add to the room & play
        room.PlaySongList(request.Songs);

        // notify the room
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
