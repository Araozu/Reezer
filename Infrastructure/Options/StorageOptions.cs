using System.ComponentModel.DataAnnotations;

namespace Reezer.Infrastructure.Options;

public class StorageOptions
{
    [Required]
    public required string LibraryInitPath { get; set; }

    [Required]
    public required string LibraryTranscodedPath { get; set; }

    [Required]
    public required string LibraryYtPath { get; set; }

    [Required]
    public required string AlbumCoverPath { get; set; }

    [Required]
    public required string YtCookiesFile { get; set; }
}
