using MediatR;
using Reezer.Domain.Entities.Room;

namespace Reezer.Application.Notifications;

public record RoomQueueChangedNotification(
    string RoomCode,
    IEnumerable<RoomSong> Queue,
    int CurrentIndex,
    bool IsPlaying,
    long Position,
    long ServerTime
) : INotification;
