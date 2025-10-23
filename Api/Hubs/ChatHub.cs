using Microsoft.AspNetCore.SignalR;

namespace Reezer.Api.Hubs;

public class ChatHub : Hub
{
    private static System.Timers.Timer? _timer;
    private static IHubContext<ChatHub>? _hubContext;

    public ChatHub(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;

        if (_timer == null)
        {
            _timer = new System.Timers.Timer(1000);
            _timer.Elapsed += async (sender, e) =>
            {
                await _hubContext.Clients.All.SendAsync(
                    "serverTimeUpdate",
                    DateTime.UtcNow.ToString("O")
                );
            };
            _timer.Start();
        }
    }

    public async Task RequestServerTime()
    {
        await Clients.Caller.SendAsync("serverTimeUpdate", DateTime.UtcNow.ToString("O"));
    }

    public async Task<string> SyncTime(long clientTimestamp)
    {
        return DateTime.UtcNow.Ticks.ToString();
    }
}
