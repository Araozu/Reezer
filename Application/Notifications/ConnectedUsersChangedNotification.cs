using MediatR;

namespace Reezer.Application.Notifications;

public record ConnectedUsersChangedNotification(string RoomCode, List<Guid> UserIds)
    : INotification;
