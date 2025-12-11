namespace Reezer.Application.DTOs;

public record MusicRoomDto(Guid Id, string RoomCode, string RoomName, int ConnectedUsers);

public record CreateMusicRoomDto(string? RoomName);
