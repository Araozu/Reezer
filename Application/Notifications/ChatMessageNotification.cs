using MediatR;

namespace Reezer.Application.Notifications;

public record ChatMessageNotification(
    string UserId,
    string UserName,
    string Message,
    long Timestamp
) : INotification;
