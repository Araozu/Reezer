using MediatR;
using Microsoft.AspNetCore.SignalR;
using Reezer.Application.Commands;

namespace Reezer.Api.Hubs;

public class MusicRoomHub(ILogger<MusicRoomHub> logger, ISender mediator) : Hub
{
    public const string Route = "/hub/MusicRoom";

    public async Task Hello(string name)
    {
        logger.LogInformation("Data received in MusicRoomHub.Hello: {Name}", name);
        await mediator.Send(new MusicRoomHelloCommand(name));
    }
}
