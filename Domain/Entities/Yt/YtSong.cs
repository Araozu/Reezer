namespace Reezer.Domain.Entities.Yt;

public class YtSong
{
    public string YtId { get; init; }
    public string Name { get; private set; }
    public string? CachedPath { get; private set; }
    public string? ThumbnailPath { get; private set; }

    public YtSong(string ytId, string name)
    {
        YtId = ytId;
        Name = name;
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
