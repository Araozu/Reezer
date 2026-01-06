namespace Reezer.Domain.Entities.Room;

public record RoomSong(
    string Id,
    string Name,
    string? Artist,
    string? Album,
    string? ArtistId,
    string? AlbumId,
    string Type // "regular" or "youtube"
);
