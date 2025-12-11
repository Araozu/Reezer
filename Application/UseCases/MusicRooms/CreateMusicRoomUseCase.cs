using Reezer.Application.DTOs;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Repositories.Room;

namespace Reezer.Application.UseCases;

public class CreateMusicRoomUseCase(IMusicRoomRepository musicRoomRepository)
{
    public async Task<MusicRoomDto> ExecuteAsync(
        Guid ownerId,
        CancellationToken cancellationToken = default
    )
    {
        var roomCode = GenerateRoomCode();
        var room = new MusicRoom(Guid.NewGuid(), ownerId, roomCode);

        await musicRoomRepository.AddAsync(room, cancellationToken);

        return new MusicRoomDto(room.Id, room.Name, room.Participants.Count());
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
