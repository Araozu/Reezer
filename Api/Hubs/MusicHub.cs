using Microsoft.AspNetCore.Components.HtmlRendering.Infrastructure;
using Microsoft.AspNetCore.SignalR;

namespace Reezer.Api.Hubs;

public class MusicHub : Hub
{
    private static IHubContext<MusicHub>? _hubContext;
    private static PlayerState playerState = new(null);

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

    public Task<ISong?> GetPlayerState()
    {
        return Task.FromResult(playerState.CurrentSong);
    }

    public Task PlaySong(Guid clientId, ISong songState)
    {
        playerState = playerState with { CurrentSong = songState };
        _hubContext?.Clients.All.SendAsync("PlaySong", clientId, songState);
        return Task.CompletedTask;
    }
}

public record SyncResponse(long ServerReceiveTime, long ServerSendTime);

public record PlayerState(ISong? CurrentSong);

public record ISong(Guid Id, string Name, string Artist, string Album, Guid ArtistId, Guid AlbumId);
