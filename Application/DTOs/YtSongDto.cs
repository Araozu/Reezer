namespace Reezer.Application.DTOs;

public record YtSongDto(string YtId, string Name, string? CachedPath, long Duration);
