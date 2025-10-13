using System.Collections.Generic;
using Reezer.Domain.Entities.Songs;

namespace Reezer.Domain.Entities;

public class Album
{
    public Guid Id { get; init; }
    public string Name { get; private set; }
    public string? CoverPath { get; private set; } = null;

    // Navigation properties
    public Artist Artist { get; private set; }
    public Guid ArtistId { get; private set; }
    public ICollection<Song> Songs { get; private set; }

    public static Album Create(string name, Artist artist, string? coverPath = null) =>
        new()
        {
            Name = name,
            Artist = artist,
            ArtistId = artist.Id,
            CoverPath = coverPath,
        };

    public void SetCoverPath(string? coverPath)
    {
        CoverPath = coverPath;
    }

    // Private EF constructor
#pragma warning disable CS8618
    private Album() { }
#pragma warning restore CS8618
}
