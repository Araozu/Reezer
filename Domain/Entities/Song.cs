namespace Reezer.Domain.Entities;

public class Song
{
    public Guid Id { get; init; }
    public string Name { get; private set; }
    public bool Raw { get; private set; } = true;
    public string? TranscodedPath { get; private set; } = null;
    public string? RawPath { get; private set; } = null;

    // Private EF constructor
    private Song() { }
}
