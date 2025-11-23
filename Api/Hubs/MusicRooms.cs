using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace Reezer.Api.Hubs;

public class MusicRoomHub(ILogger<MusicRoomHub> logger) : Hub { }
