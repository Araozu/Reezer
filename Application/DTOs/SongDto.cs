namespace Reezer.Application.DTOs;

public record SongDto(
    Guid Id,
    string Name,
    string Artist,
    string Album,
    Guid ArtistId,
    Guid AlbumId
);
