using Microsoft.AspNetCore.Mvc;
using Reezer.Api.Hubs;

namespace Reezer.Api.Controllers.MusicRooms;

public record MusicRoomDto(string RoomCode, int ConnectedUsers);

[ApiController]
[Route("api/[controller]")]
public class MusicRoomsController : ControllerBase
{
    // [EndpointSummary("Get list of all active music rooms")]
    // [HttpGet]
    // public ActionResult<List<MusicRoomDto>> GetRooms()
    // {
    //     var rooms = MusicRoomHub
    //         .GetRooms()
    //         .Select(r => new MusicRoomDto(r.RoomCode, r.ConnectedUsers.Count))
    //         .ToList();
    //
    //     return Ok(rooms);
    // }

    // [EndpointSummary("Create a new music room")]
    // [HttpPost]
    // public ActionResult<MusicRoomDto> CreateRoom()
    // {
    //     var roomCode = GenerateRoomCode();
    //     var room = MusicRoomHub.CreateRoom(roomCode);
    //
    //     return Ok(new MusicRoomDto(room.RoomCode, 0));
    // }

    private static string GenerateRoomCode()
    {
        var random = new Random();
        var chars = "0123456789ABCDEF";
        return new string(
            Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray()
        );
    }
}
