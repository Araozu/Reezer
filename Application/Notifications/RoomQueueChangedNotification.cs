using MediatR;
using Reezer.Domain.Entities.Room;

namespace Reezer.Application.Notifications;

public record RoomQueueChangedNotification(
    string RoomCode,
    IEnumerable<RoomSong> Queue,
    int CurrentIndex
) : INotification;
