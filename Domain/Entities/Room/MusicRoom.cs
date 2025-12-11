namespace Reezer.Domain.Entities.Room;

public class MusicRoom
{
    public MusicRoom(Guid maestroId, string name, string code)
    {
        MaestroId = maestroId;
        Name = name;
        Code = code;
    }

    public Guid Id { get; private set; }

    /// <summary>
    /// The Maestro of the room. Has full control.
    /// </summary>
    public Guid MaestroId { get; private set; }

    /// <summary>
    /// 6 hex character code used to join the room.
    /// </summary>
    public string Code { get; private set; } = null!;

    /// <summary>
    /// A friendly name for the room.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// The participants in the room. Each participant is represented by their UserId and SignalR ConnectionId.
    /// This allows tracking multiple connections per user.
    /// </summary>
    private HashSet<(Guid, string)> _participants = [];

    public IReadOnlyCollection<(Guid UserId, string ConnectionId)> Participants => _participants;

    public void AddConnection(Guid userId, string connectionId)
    {
        _participants.Add((userId, connectionId));
    }

    public void RemoveParticipant(Guid userId, string connectionId)
    {
        _participants.Remove((userId, connectionId));
    }
}
