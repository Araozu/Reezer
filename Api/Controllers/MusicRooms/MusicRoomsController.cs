using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reezer.Application.DTOs;
using Reezer.Application.UseCases;

namespace Reezer.Api.Controllers.MusicRooms;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class MusicRoomsController(
    GetAllMusicRoomsUseCase getAllMusicRoomsUseCase,
    CreateMusicRoomUseCase createMusicRoomUseCase
) : ControllerBase
{
    [EndpointSummary("Get list of all active music rooms")]
    [HttpGet]
    public async Task<ActionResult<List<MusicRoomDto>>> GetRooms(
        CancellationToken cancellationToken
    )
    {
        var rooms = await getAllMusicRoomsUseCase.ExecuteAsync(cancellationToken);
        return Ok(rooms);
    }

    [EndpointSummary("Create a new music room")]
    [HttpPost]
    public async Task<ActionResult<MusicRoomDto>> CreateRoom(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var room = await createMusicRoomUseCase.ExecuteAsync(userId, cancellationToken);
        return Ok(room);
    }
}
