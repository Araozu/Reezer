namespace Reezer.Application.DTOs;

public record UnifiedSearchResultDto(
    IEnumerable<SongDto> Songs,
    IEnumerable<YtSongDto> YtSongs,
    IEnumerable<AlbumDto> Albums,
    IEnumerable<ArtistDto> Artists
);
