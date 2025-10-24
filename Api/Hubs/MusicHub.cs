using Microsoft.AspNetCore.SignalR;

namespace Reezer.Api.Hubs;

public class MusicHub : Hub
{
    private static IHubContext<MusicHub>? _hubContext;
    private static PlayerState playerState = new(
        Guid.Parse("0199f710-7969-7860-bf2a-f9d1e74ba400")
    );

    public MusicHub(IHubContext<MusicHub> hubContext)
    {
        _hubContext = hubContext;
    }

    /// <summary>
    /// NTP-like synchronization method for calculating round-trip time and clock offset
    /// </summary>
    /// <param name="clientTimestamp">Client's timestamp when sending the sync request (T1)</param>
    /// <returns>Server timestamps: receive time (T2) and send time (T3)</returns>
    public Task<SyncResponse> SyncTime(long clientTimestamp)
    {
        // T2: Server receive timestamp
        var serverReceiveTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // T3: Server send timestamp (immediately after receiving)
        var serverSendTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        return Task.FromResult(new SyncResponse(serverReceiveTime, serverSendTime));
    }

    public Task<Guid> GeneratePlayerId()
    {
        return Task.FromResult(Guid.NewGuid());
    }

    public Task<PlayerState> GetPlayerState()
    {
        return Task.FromResult(playerState);
    }

    public Task PlaySong(Guid clientId, Guid songId)
    {
        playerState = playerState with { CurrentSongId = songId };
        _hubContext?.Clients.All.SendAsync("PlaySong", clientId, songId);
        return Task.CompletedTask;
    }
}

public record SyncResponse(long ServerReceiveTime, long ServerSendTime);

public record PlayerState(Guid? CurrentSongId);
