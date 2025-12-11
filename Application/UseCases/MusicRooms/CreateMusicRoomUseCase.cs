using Reezer.Application.DTOs;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;

namespace Reezer.Application.UseCases;

public class CreateMusicRoomUseCase(IMusicRoomRepository musicRoomRepository)
{
    public async Task<MusicRoomDto> ExecuteAsync(
        Guid ownerId,
        string roomName,
        CancellationToken cancellationToken = default
    )
    {
        var roomCode = GenerateRoomCode();
        var room = new MusicRoom(
            id: Guid.NewGuid(),
            maestroId: ownerId,
            name: roomName,
            code: roomCode
        );

        await musicRoomRepository.AddAsync(room, cancellationToken);

        return new MusicRoomDto(
            Id: room.Id,
            RoomName: room.Name,
            RoomCode: room.Code,
            ConnectedUsers: room.Participants.Count()
        );
    }

    private static string GenerateRoomCode()
    {
        var random = new Random();
        var chars = "0123456789ABCDEF";
        return new string(
            Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray()
        );
    }
}
