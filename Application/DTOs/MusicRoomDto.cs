namespace Reezer.Application.DTOs;

public record MusicRoomDto(Guid Id, string RoomCode, string RoomName, int ConnectedUsers);

public record CreateMusicRoomDto(string? RoomName);

public record MusicRoomStateDto(
    IEnumerable<Domain.Entities.Room.RoomSong> Queue,
    int CurrentIndex,
    bool IsPlaying,
    long CurrentPosition,
    long LastUpdateServerTime
);
