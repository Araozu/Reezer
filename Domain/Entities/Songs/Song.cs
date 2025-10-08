namespace Reezer.Domain.Entities.Songs;

public partial class Song
{
    public Guid Id { get; init; }
    public string Name { get; private set; }
    public string? TranscodedPath { get; private set; } = null;
    public string? RawPath { get; private set; } = null;
    public bool Raw => TranscodedPath is null;

    // Private EF constructor
#pragma warning disable CS8618
    private Song() { }
#pragma warning restore CS8618
}
