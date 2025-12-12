using OneOf;
using Reezer.Domain.Entities.Room;
using Reezer.Domain.Utils;

namespace Reezer.Domain.Repositories.Room;

public interface IMusicRoomRepository
{
    string GenerateRoomCode();

    Task<IEnumerable<MusicRoom>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<OneOf<MusicRoom, NotFound>> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken = default
    );
    Task AddAsync(MusicRoom room, CancellationToken cancellationToken = default);
    Task<OneOf<Success, NotFound>> RemoveAsync(
        string code,
        CancellationToken cancellationToken = default
    );

    Task<OneOf<MusicRoom, NotFound>> AddConnection(
        string roomCode,
        Guid userId,
        string connectionId
    );
    MusicRoom? RemoveConnection(string connectionId);
    MusicRoom? GetRoomByConnectionId(string connectionId);
    IEnumerable<string> GetConnections(string userId);
    IEnumerable<string> GetOnlineUsers();
}
