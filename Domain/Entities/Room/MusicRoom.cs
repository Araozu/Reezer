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
    public long SongStartTime { get; private set; } = 0;

    /// <summary>
    /// The position of the song when it was last paused or updated (Unix milliseconds).
    /// </summary>
    public long PositionAtLastUpdate { get; private set; } = 0;

    /// <summary>
    /// The current position of the song, in milliseconds.
    /// </summary>
    public long CurrentPosition
    {
        get
        {
            if (_queue.Count == 0 || CurrentIndex < 0 || CurrentIndex >= _queue.Count)
            {
                return 0;
            }

            if (!IsPlaying)
            {
                return PositionAtLastUpdate;
            }

            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var position = now - SongStartTime;
            var duration = _queue[CurrentIndex].Duration;

            return Math.Clamp(position, 0, duration);
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
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        this._queue.Clear();
        this._queue.AddRange(songs);
        this.CurrentIndex = 0;
        this.PositionAtLastUpdate = 0;
        this.SongStartTime = now;
        this.IsPlaying = true;
        this.LastUpdateServerTime = now;
    }

    public void SetQueue(IEnumerable<RoomSong> queue, int currentIndex)
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        this._queue.Clear();
        this._queue.AddRange(queue);
        this.CurrentIndex = currentIndex;
        
        // Reset anchor points to the current position to keep interpolation stable
        if (IsPlaying) 
        {
            this.PositionAtLastUpdate = now - this.SongStartTime;
            this.SongStartTime = now - this.PositionAtLastUpdate;
        }
        
        this.LastUpdateServerTime = now;
    }

    /// <summary>
    /// Sets play/pause state, and optionally the position. If `position` is provided, it is in milliseconds.
    /// </summary>
    public void SetPlayState(bool isPlaying, long? position = null)
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        if (position.HasValue)
        {
            var duration = (_queue.Count > 0 && CurrentIndex >= 0 && CurrentIndex < _queue.Count) 
                ? _queue[CurrentIndex].Duration 
                : long.MaxValue;
                
            this.PositionAtLastUpdate = Math.Clamp(position.Value, 0, duration);
            this.SongStartTime = now - this.PositionAtLastUpdate;
        }
        else if (isPlaying != IsPlaying)
        {
            // If toggling state without a new position, sync the anchor points
            if (isPlaying)
            {
                // Resuming: move the start time anchor to account for the time spent paused
                this.SongStartTime = now - this.PositionAtLastUpdate;
            }
            else
            {
                // Pausing: capture the exact position at the moment of pause
                // Ensure we clamp it so we don't save a negative or past-duration position
                var duration = (_queue.Count > 0 && CurrentIndex >= 0 && CurrentIndex < _queue.Count) 
                    ? _queue[CurrentIndex].Duration 
                    : long.MaxValue;
                this.PositionAtLastUpdate = Math.Clamp(now - this.SongStartTime, 0, duration);
            }
        }

        this.IsPlaying = isPlaying;
        this.LastUpdateServerTime = now;
    }

    /// <summary>
    /// Sets the current position of the song. `position` is in milliseconds.
    /// </summary>
    public void SetPosition(long position)
    {
        if (_queue.Count == 0 || CurrentIndex < 0 || CurrentIndex >= _queue.Count)
        {
            return;
        }

        var duration = _queue[CurrentIndex].Duration;
        // Clamp position between 0 and song duration
        var clampedPosition = Math.Clamp(position, 0, duration);

        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        this.PositionAtLastUpdate = clampedPosition;
        
        if (IsPlaying)
        {
            this.SongStartTime = now - clampedPosition;
        }
        
        this.LastUpdateServerTime = now;
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
