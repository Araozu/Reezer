namespace Reezer.Domain.Entities.Yt;

public class YtSong
{
    public string YtId { get; init; }
    public string Name { get; private set; }
    public string? CachedPath { get; private set; }
    public string? ThumbnailPath { get; private set; }
    public double Duration { get; private set; }

    public YtSong(string ytId, string name, double duration = 0)
    {
        YtId = ytId;
        Name = name;
        Duration = duration;
        CachedPath = null;
        ThumbnailPath = null;
    }

    public void SetCachedPath(string cachedPath)
    {
        CachedPath = cachedPath;
    }

    public void SetThumbnailPath(string? thumbnailPath)
    {
        ThumbnailPath = thumbnailPath;
    }

#pragma warning disable CS8618
    private YtSong() { }
#pragma warning restore CS8618
}
