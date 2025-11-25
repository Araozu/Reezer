# Current Music Player Architecture Review

## Overview

The Reezer application currently has a music player system that is partially implemented with three main components:
1. **HeadlessMusicPlayer** - A fully implemented local-only player
2. **SyncMusicPlayer** - A skeleton implementation (not functional)
3. **MusicHub** - SignalR-based remote synchronization infrastructure

## Architecture Components

### 1. Player Interface (`Web/src/player/IMusicPlayer.ts`)

Defines the core contract for all music player implementations:

**Queue Management:**
- `PlaySong(song, extra?)` - Play a single song immediately, clearing remaining queue
- `PlaySongList(songs, extra?)` - Play a list of songs, replacing the queue
- `AddLastSong(song, extra?)` - Append song to end of queue
- `AddLastSongList(songs, extra?)` - Append multiple songs to end
- `AddNextSong(song, extra?)` - Insert song after current track
- `AddNextSongList(songs, extra?)` - Insert multiple songs after current track

**Playback Controls:**
- `Next(extra?)` - Skip to next song
- `Prev(extra?)` - Go to previous song
- `PlayIdx(idx, extra?)` - Play song at specific queue index

**Design Notes:**
- Generic `Extras` type parameter allows implementation-specific metadata
- Interface is agnostic to playback strategy (local vs remote)
- Missing: explicit play/pause, seek functionality in interface

### 2. HeadlessMusicPlayer (`Web/src/player/HeadlessMusicPlayer.svelte.ts`)

The primary and only fully functional player implementation. Uses browser's `<audio>` element for local playback.

**Key Features:**

#### Playback Management
- Uses standard HTML5 Audio element
- Implements gapless playback via `ended` event auto-advancing to next track
- State management using Svelte 5 runes (`$state`, `$derived`)
- Reactive current song derived from queue and index

#### Prefetching System
- Timer-based prefetching (checks every 2.5 seconds)
- Prefetches next song when 20 seconds remain in current song
- Calls `/api/Songs/{songId}/prepare` endpoint
- Prevents duplicate prefetch requests via `lastPreloadId` tracking

#### MediaSession Integration
- Full OS-level media controls integration
- Supports: play, pause, next, previous, seek forward/backward, seek to position
- Updates metadata (title, artist, album, artwork)
- Updates position state for progress display in OS controls
- Throttles position updates to 1 second intervals

#### SignalR Integration
- Accepts `MusicHub` instance in constructor
- Sends `playSong` events to hub when user initiates playback
- Receives remote `PlaySong` events and applies them locally
- Filters out events originated by same client (via client ID)

#### State Tracking
- `audioReady` - Whether audio context is initialized (requires user interaction)
- `isBuffering` - Tracks loading state
- `currentSongIdx` - Current position in queue
- `queue` - Array of songs
- `currentSong` - Derived from queue[idx]

#### Volume & Position
- Uses Svelte writable stores passed from parent component
- Bound to audio element properties via component bindings
- Separate concerns: player handles logic, parent handles state

**Limitations:**
- Tightly coupled to local audio element
- Hard-coded to `/api/Songs/{id}/stream` endpoint
- No strategy pattern for different playback modes
- SignalR integration is bolted on, not abstracted
- No explicit gapless guarantee (relies on browser behavior)

### 3. SyncMusicPlayer (`Web/src/player/SyncMusicPlayer.svelte.ts`)

An incomplete implementation intended for synchronized remote playback.

**Current State:**
- Implements `IMusicPlayer` interface signature
- Has basic state structure (ready, idx, queue, current_song)
- Contains `Init(el: HTMLAudioElement)` method for audio tag setup
- Has `PlayCurrent()` private method stub marked `FIXME: implement`
- **All queue management methods inherited from interface are unimplemented**

**Observations:**
- Appears to be a work-in-progress
- Similar structure to HeadlessMusicPlayer but empty
- No connection to MusicHub or synchronization logic
- Not currently used in the application

### 4. MusicHub (`Web/src/lib/MusicHub.svelte.ts`)

SignalR hub client for real-time synchronization between players.

**Features:**

#### Connection Management
- Connects to `/api/hubs/music` endpoint
- Auto-reconnect support
- Generates unique player/client ID per session
- Tracks connection state

#### Time Synchronization
- NTP-like clock synchronization algorithm
- Takes 10 samples by default, uses best 75% (lowest RTT)
- Calculates:
  - Round-trip time (RTT)
  - Clock offset between client and server
  - Synchronized server time
  - Accuracy rating (high/medium/low) based on variance
- Manages drift over time (can check validity of sync)

#### Player State Sync
- `PlaySong(song)` - Broadcasts song to all connected clients
- `ReceivePlaySong(clientId, song)` - Receives and applies remote song changes
- `GetPlayerState()` - Retrieves current server-side player state
- Filters out own events to prevent loops

**Server-Side (`Api/Hubs/MusicHub.cs`):**
- Maintains global `PlayerState` with queue and current index
- Broadcasts PlaySong events to all connected clients
- Provides SyncTime method for clock synchronization
- Single shared state (not per-room/session)

**Limitations:**
- Only syncs song changes, not play/pause/seek/position
- Global state means only one "room" - all clients share same queue
- No actual synchronized playback timing (clock sync exists but unused)
- No position synchronization
- Missing queue manipulation sync

### 5. Player Context (`Web/src/player/index.svelte.ts`)

Simple Svelte context provider/consumer pattern.

**Functions:**
- `CreatePlayerContext()` - Instantiates HeadlessMusicPlayer and sets in context
- `GetCurrentPlayer()` - Retrieves player from context with error checking

**Notes:**
- Hard-coded to return `HeadlessMusicPlayer` type
- No abstraction for different player types
- Context is set at route layout level (`routes/(main)/(sync)/+layout.svelte`)

### 6. UI Components (`Web/src/components/music-player/`)

Collection of Svelte components for player visualization and control:

- `index.svelte` - Root component, delegates to mobile/desktop variants
- `player-root-desktop.svelte` / `player-root-mobile.svelte` - Platform-specific layouts
- `player-contents-playing.svelte` - Now playing view with controls
- `player-contents-queue.svelte` - Queue management interface
- `player-contents-collapsed.svelte` - Minimized player view
- `position-slider.svelte` - Seekbar component
- `volume-slider.svelte` - Volume control

**Integration:**
- Uses `GetCurrentPlayer()` to access player instance
- Directly calls player methods (PlaySong, Next, Prev, etc.)
- Binds to audio element state (paused, volume, currentTime, duration)

### 7. Backend API (`Api/Controllers/Songs/SongsController.cs`)

REST endpoints for song data and streaming:

**Endpoints:**
- `GET /api/Songs` - List all songs
- `GET /api/Songs/{id}/stream` - Stream song audio with range support
- `POST /api/Songs/{id}/prepare` - Trigger background transcoding/preparation

**Features:**
- Range request support for seeking
- 30-day cache headers on streams
- Background preparation for upcoming songs

## Current Capabilities

### ✅ What Works
1. **Local Playback:** Full-featured local music playback
2. **Queue Management:** Add, play, skip, previous functionality
3. **MediaSession:** OS-level media controls integration
4. **Prefetching:** Smart prefetching of upcoming songs
5. **Basic Remote Sync:** Broadcasting song changes to other clients
6. **Clock Sync:** NTP-like time synchronization infrastructure

### ❌ What's Missing
1. **Gapless Playback Guarantee:** Relies on browser, not explicitly managed
2. **Remote Solo Mode:** Playing from server without sync
3. **Synchronized Multiplayer:** True synchronized playback timing across clients
4. **Position Sync:** Play/pause/seek synchronization across clients
5. **Strategy Pattern:** No abstraction for switching playback modes
6. **Headless Architecture:** Player is not truly headless (audio element coupled)
7. **Room/Session Support:** All clients share one global state

## Architectural Issues

### 1. Tight Coupling
- HeadlessMusicPlayer directly manages HTML5 Audio element
- Player logic intertwined with audio element lifecycle
- UI components directly depend on HeadlessMusicPlayer type
- No dependency injection or strategy pattern

### 2. Mixed Concerns
- HeadlessMusicPlayer handles both local playback AND remote sync logic
- MusicHub knows about player implementation details
- No clear separation between transport layer and playback logic

### 3. Incomplete Strategy
- Three strategies envisioned (local, remote solo, remote sync) but only one implemented
- SyncMusicPlayer exists but is empty
- No way to switch between strategies at runtime
- Context system hard-coded to one player type

### 4. Sync Limitations
- MusicHub only syncs song changes, not playback state
- Clock synchronization exists but isn't used for coordinated playback
- No offset calculation for synchronized start times
- Missing distributed state management for pause/seek

### 5. Interface Gaps
- `IMusicPlayer` doesn't include play/pause/seek methods
- No events/callbacks for state changes
- No error handling contract
- Extra parameter unused in most implementations

## Data Flow

### Current Song Playback Flow
```
User clicks play
  → UI Component calls player.PlaySong(song)
    → HeadlessMusicPlayer.PlaySong()
      → Sets audio.src
      → Calls audio.play()
      → Calls hub.playSong() [if connected]
        → Server broadcasts to all clients
          → Other clients receive ReceivePlaySong()
            → Call their player.PlaySong(song, fromServer=true)
              → Updates their local queue and plays
```

### Prefetch Flow
```
Timer (every 2.5s)
  → Check if <20s remaining
    → Check if next song exists
      → Check if not already prefetched
        → POST /api/Songs/{id}/prepare
          → Server transcodes in background
```

## Technology Stack

**Frontend:**
- Svelte 5 (with runes)
- TypeScript
- SignalR client (`@microsoft/signalr`)
- HTML5 Audio API
- MediaSession API

**Backend:**
- ASP.NET Core
- SignalR Hub
- OneOf for result types

## File Structure
```
Web/src/
├── player/
│   ├── IMusicPlayer.ts              # Interface definition
│   ├── HeadlessMusicPlayer.svelte.ts # Main implementation
│   ├── SyncMusicPlayer.svelte.ts    # Stub implementation
│   └── index.svelte.ts              # Context provider
├── lib/
│   ├── MusicHub.svelte.ts           # SignalR client
│   └── sync-utils.ts                # Time sync utilities
└── components/music-player/         # UI components

Api/
├── Controllers/Songs/
│   └── SongsController.cs           # REST endpoints
└── Hubs/
    └── MusicHub.cs                  # SignalR hub
```

## Summary

The current implementation has a solid foundation for local playback with good UX features (MediaSession, prefetching). However, it lacks:
1. True headless/agnostic architecture
2. Multiple playback strategies
3. Complete synchronization capabilities
4. Clean separation of concerns

The vision of supporting three distinct modes (local only, remote solo, remote sync multiplayer) with full playback control is not yet realized. The infrastructure exists but needs significant refactoring to achieve the stated goals.
