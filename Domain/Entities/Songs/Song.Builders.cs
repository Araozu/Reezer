namespace Reezer.Domain.Entities.Songs;

public partial class Song
{
    public static Song CreateFromLibrary(string name, string rawPath) =>
        new() { Name = name, RawPath = rawPath };
}
