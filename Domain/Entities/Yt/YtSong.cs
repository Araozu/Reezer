namespace Reezer.Domain.Entities.Yt;

public class YtSong
{
    public string YtId { get; init; }
    public string Name { get; private set; }
    public string? CachedPath { get; private set; }

    public void SetCachedPath(string cachedPath)
    {
        CachedPath = cachedPath;
    }

#pragma warning disable CS8618
    private YtSong() { }
#pragma warning restore CS8618
}
