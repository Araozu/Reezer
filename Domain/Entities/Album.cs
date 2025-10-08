namespace Reezer.Domain.Entities;

public class Album
{
    public Guid Id { get; init; }
    public string Name { get; private set; }

    // Navigation properties
    public Artist Artist { get; private set; }
    public Guid ArtistId { get; private set; }

    // Private EF constructor
#pragma warning disable CS8618
    private Album() { }
#pragma warning restore CS8618
}
