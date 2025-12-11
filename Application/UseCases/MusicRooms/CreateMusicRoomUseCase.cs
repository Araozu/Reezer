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
        var newRoomCode = musicRoomRepository.GenerateRoomCode();
        var room = new MusicRoom(maestroId: ownerId, name: roomName, code: newRoomCode);

        await musicRoomRepository.AddAsync(room, cancellationToken);

        return new MusicRoomDto(
            Id: room.Id,
            RoomName: room.Name,
            RoomCode: room.Code,
            ConnectedUsers: room.Participants.Count()
        );
    }
}
