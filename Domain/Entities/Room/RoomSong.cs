namespace Reezer.Domain.Entities.Room;

public record RoomSong(
    string Id,
    string Name,
    string? Artist,
    string? Album,
    string? ArtistId,
    string? AlbumId,
    double Duration,
    string Type // "regular" or "youtube"
);
