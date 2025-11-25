# Reezer

A maleable music player with multiple play modes.

## Functionality

- Supports multiple play modes, all with the same features:
  - Standard play/pause/seek/prev/next
  - Queue management:
    - add/remove/reorder single tracks
    - add multiple tracks, next up or end of queue
    - Repeat modes: no repeat, repeat all, repeat one
    - Shuffle
  - Volume control
  - Auto play next track when current track ends
- Gapless playback
- Prefetching


## Audio format

The server is commited to serving only OPUS in a webm container.
The server is open to adding support for DASH if there is demand for it.


## Play modes

### Solo

The server serves tracks from the backend to a single client.
The client plays those tracks, and is provided with the above functionality.


### Multiplayer

The clients connect to a shared room with a Maestro and multiple Players.
The server becomes the source of truth for the player state.

The server mantains a remote queue for the room, receives & broadcasts player state updates,
commands, and serves tracks to the clients.

The Maestro has control over the room, and can manage the queue and playback for all players.

Either the Maestro or the players can "attach" to the actual audio playback, and they can
detach freely.


## Architecture

### Audio backend

Plays the actual audio files, be it via `<audio>`, Web Audio API, Media Source Extensions, or other means.
The contract requires it to implement some mechanism for preloading.


```cs
/// Contract for audio backends.
///
/// In order to support gapless playback, this interface defines the following:
/// - If `Play` is called with the same `id` as the currently playing track, nothing happens.
/// - If `Play` is called with a `id` set via `Prefetch`, playback should switch immediately.
/// - The backend stores the next track, and will play it immediately after the current track ends.
/// - The next track is set via the `Prefetch` method.
/// - The caller may clear the prefetched track via `ClearPrefetch`, to prevent it from playing next.
public interface IAudioBackend
{
    /// Raw volume between 0.0 and 1.0.
    /// The caller is responsible for mapping this to a logarithmic scale if needed.
    public double Volume { get; set; }

    /// Immediately starts playing, and clears any prefetched track.
    /// The `id` parameter identifies the audio track, and `data` contains the audio source.
    /// Implementors should coordinate with the `Prefetch` method to minimize playback delay.
    void Play(Guid id, IAudioSource source);

    void Pause();

    /// Seeks to the given position (in seconds) in the current track.
    void Seek(float position);

    /// Sets the next track to be played after the current one ends.
    void Prefetch(Guid id, IAudioSource source);

    /// Clears any prefetched data.
    void ClearPrefetch();

    void Dispose();
}

/// Goes fetch the actual audio data.
public interface IAudioSource
{
    // Open a stream to the audio data
    // The backend calls this when it needs data
    Stream OpenStream();

    // Optional: for backends that can handle URIs directly (mpv, etc)
    string? GetUri() => null;
}
```



