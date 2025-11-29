using MediatR;

namespace Reezer.Application.Notifications;

public record HelloNotification(string Name) : INotification;
