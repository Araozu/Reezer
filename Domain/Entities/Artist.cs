using Reezer.Domain.Entities.Songs;

namespace Reezer.Domain.Entities;

public class Artist
{
    public Guid Id { get; init; }
    public string Name { get; private set; }

    // Navigation properties
    public ICollection<Song> Songs { get; private set; } = [];

    public static Artist Create(string name) => new() { Name = name };

    // Private EF constructor
#pragma warning disable CS8618
    private Artist() { }
#pragma warning restore CS8618
}
