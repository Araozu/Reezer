using MediatR;

namespace Reezer.Application.Notifications;

public record PlayStateChangedNotification(
    string RoomCode,
    bool IsPlaying,
    long Position,
    long ServerTime
) : INotification;
