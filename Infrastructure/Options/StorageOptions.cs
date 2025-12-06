namespace Reezer.Infrastructure.Options;

public class StorageOptions
{
    public required string LibraryInitPath { get; set; }
    public required string LibraryTranscodedPath { get; set; }
    public required string LibraryYtPath { get; set; }

    //
    public required string AlbumCoverPath { get; set; }
    public required string YtThumbnailPath { get; set; }
}
