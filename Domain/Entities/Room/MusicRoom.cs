namespace Reezer.Domain.Entities.Room;

public class MusicRoom
{
    public MusicRoom(Guid id, Guid ownerId, string name)
    {
        Id = id;
        OwnerId = ownerId;
        Name = name;
    }

    public Guid Id { get; private set; }
    public Guid OwnerId { get; private set; }
    public string Name { get; private set; } = null!;
    public IEnumerable<Guid> Participants { get; private set; } = [];
}
