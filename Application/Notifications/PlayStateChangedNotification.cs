using MediatR;

namespace Reezer.Application.Notifications;

public record PlayStateChangedNotification(
    string RoomCode,
    bool IsPlaying,
    double Position,
    long ServerTime
) : INotification;
