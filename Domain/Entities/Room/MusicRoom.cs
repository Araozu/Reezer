namespace Reezer.Domain.Entities.Room;

public class MusicRoom(Guid maestroId, string name, string code)
{
    public Guid Id { get; private set; }

    /// <summary>
    /// The Maestro of the room. Has full control.
    /// </summary>
    public Guid MaestroId { get; private set; } = maestroId;

    /// <summary>
    /// 6 hex character code used to join the room.
    /// </summary>
    public string Code { get; private set; } = code;

    /// <summary>
    /// A friendly name for the room.
    /// </summary>
    public string Name { get; private set; } = name;

    /// <summary>
    /// The current queue of songs in the room.
    /// </summary>
    private List<RoomSong> _queue = [];
    public IReadOnlyList<RoomSong> Queue => _queue;

    /// <summary>
    /// The index of the currently playing song in the queue.
    /// </summary>
    public int CurrentIndex { get; private set; } = 0;

    /// <summary>
    /// Whether the music is currently playing.
    /// </summary>
    public bool IsPlaying { get; private set; } = false;

    /// <summary>
    /// The server time when the current song started playing (Unix milliseconds).
    /// Used to calculate the current position for new participants.
    /// </summary>
    private long _songStartTime = 0;

    /// <summary>
    /// The current position of the song, in milliseconds.
    /// </summary>
    public long CurrentPosition
    {
        get
        {
            if (_queue.Count == 0)
            {
                return 0;
            }

            return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - _songStartTime;
        }
    }

    /// <summary>
    /// The server time when the play state or position was last updated (Unix milliseconds).
    /// </summary>
    public long LastUpdateServerTime { get; private set; } =
        DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    /// <summary>
    /// The participants in the room. Each participant is represented by their UserId and SignalR ConnectionId.
    /// This allows tracking multiple connections per user.
    /// </summary>
    private readonly HashSet<(Guid, string)> _participants = [];

    public IReadOnlyCollection<(Guid UserId, string ConnectionId)> Participants => _participants;

    public void AddConnection(Guid userId, string connectionId)
    {
        _participants.Add((userId, connectionId));
    }

    public void RemoveParticipant(Guid userId, string connectionId)
    {
        _participants.Remove((userId, connectionId));
    }

    /// <summary>
    ///  Adds a list of songs to the queue & plays them.
    /// </summary>
    public void PlaySongList(IEnumerable<RoomSong> songs)
    {
        var currentLen = _queue.Count;
        _queue.AddRange(songs);
        CurrentIndex = currentLen;
        _songStartTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        IsPlaying = true;
        LastUpdateServerTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    public void SetQueue(IEnumerable<RoomSong> queue, int currentIndex)
    {
        _queue = [.. queue];
        CurrentIndex = currentIndex;
        LastUpdateServerTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    /// <summary>
    /// Sets play/pause state, and optionally the position. If `position` is provided, it is in seconds.
    /// </summary>
    public void SetPlayState(bool isPlaying, double? position = null)
    {
        if (position.HasValue)
        {
            SetPosition(position.Value);
        }
        IsPlaying = isPlaying;
        LastUpdateServerTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    /// <summary>
    /// Sets the current position of the song. `position` is in seconds
    /// </summary>
    public void SetPosition(double position)
    {
        // To set the position, we just alter the song start time based on the new position.
        var positionMs = (long)(position * 1000);
        _songStartTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - positionMs;
        LastUpdateServerTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    public void AddLastSong(RoomSong song)
    {
        _queue.Add(song);
        LastUpdateServerTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    public void AddLastSongList(IEnumerable<RoomSong> songs)
    {
        _queue.AddRange(songs);
        LastUpdateServerTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    public void AddNextSong(RoomSong song)
    {
        _queue.Insert(CurrentIndex + 1, song);
        LastUpdateServerTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    public void AddNextSongList(IEnumerable<RoomSong> songs)
    {
        _queue.InsertRange(CurrentIndex + 1, songs);
        LastUpdateServerTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }
}
