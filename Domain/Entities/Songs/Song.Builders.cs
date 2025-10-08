namespace Reezer.Domain.Entities.Songs;

public partial class Song
{
    public static Song CreateFromLibrary(string name, string rawPath, Album album) =>
        new()
        {
            Name = name,
            RawPath = rawPath,
            Album = album,
            AlbumId = album.Id,
        };
}
