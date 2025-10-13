namespace Reezer.Application.DTOs;

public record SongDto(
    Guid Id,
    string Name,
    string Artist,
    string Album,
    Guid ArtistId,
    Guid AlbumId
);

public record AlbumDto(Guid Id, string Name, Guid ArtistId, string ArtistName, string? CoverPath);

public record AlbumWithTracklistDto(
    Guid Id,
    string Name,
    Guid ArtistId,
    string ArtistName,
    string? CoverPath,
    IEnumerable<SongDto> Songs
);
