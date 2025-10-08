namespace Reezer.Domain.Entities;

public class Album
{
    public Guid Id { get; init; }
    public string Name { get; private set; }

    // Navigation properties
    public Artist Artist { get; private set; }
    public Guid ArtistId { get; private set; }

    public static Album Create(string name, Artist artist) =>
        new()
        {
            Name = name,
            Artist = artist,
            ArtistId = artist.Id,
        };

    // Private EF constructor
#pragma warning disable CS8618
    private Album() { }
#pragma warning restore CS8618
}
