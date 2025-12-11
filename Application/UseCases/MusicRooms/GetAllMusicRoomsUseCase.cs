using Reezer.Application.DTOs;
using Reezer.Domain.Repositories.Room;

namespace Reezer.Application.UseCases;

public class GetAllMusicRoomsUseCase(IMusicRoomRepository musicRoomRepository)
{
    public async Task<IEnumerable<MusicRoomDto>> ExecuteAsync(
        CancellationToken cancellationToken = default
    )
    {
        var rooms = await musicRoomRepository.GetAllAsync(cancellationToken);
        return rooms.Select(r => new MusicRoomDto(r.Id, r.Name, r.Participants.Count()));
    }
}
