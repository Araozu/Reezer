# Improved Music Player Architecture Proposal

## Vision

An **agnostic, headless music player** with three distinct playback strategies:
1. **Local Only** - Traditional browser-based playback
2. **Remote Solo** - Server-side playback controlled by client
3. **Remote Sync Multiplayer** - Synchronized playback across multiple clients

All modes support:
- ✅ Play / Pause / Seek
- ✅ Previous / Next
- ✅ Queue management
- ✅ Gapless playback
- ✅ Prefetching

## Core Architecture

### 1. Separation of Concerns

The architecture follows a layered approach with clear boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                           │
│         (player-root, controls, queue display)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ IMusicPlayer interface
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  MusicPlayerController                       │
│         (Facade, state management, event handling)           │
└──┬────────────────────┬─────────────────────┬───────────────┘
   │                    │                     │
   │ IPlaybackStrategy  │ IQueueManager      │ IPrefetcher
   ▼                    ▼                     ▼
┌────────────┐   ┌──────────────┐   ┌─────────────────┐
│  Strategy  │   │    Queue     │   │  Prefetch       │
│  Impl.     │   │  Manager     │   │  Manager        │
└────────────┘   └──────────────┘   └─────────────────┘
   │                                          │
   │ IAudioBackend                           │ IStreamProvider
   ▼                                          ▼
┌────────────┐                       ┌─────────────────┐
│HTML5 Audio │                       │   API Client    │
│ Backend    │                       └─────────────────┘
└────────────┘
```

### 2. Core Interfaces

#### IMusicPlayer (Public API)
```typescript
interface IMusicPlayer {
  // Playback Control
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(position: number): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;
  
  // Queue Management
  playSong(song: ISong): Promise<void>;
  playSongList(songs: ISong[]): Promise<void>;
  addNextSong(song: ISong): Promise<void>;
  addNextSongList(songs: ISong[]): Promise<void>;
  addLastSong(song: ISong): Promise<void>;
  addLastSongList(songs: ISong[]): Promise<void>;
  playQueueIndex(index: number): Promise<void>;
  removeFromQueue(index: number): Promise<void>;
  
  // State Observation (reactive)
  readonly state: Readable<PlayerState>;
  readonly queue: Readable<ISong[]>;
  readonly currentSong: Readable<ISong | null>;
  readonly currentIndex: Readable<number>;
  readonly position: Readable<number>;
  readonly duration: Readable<number>;
  readonly volume: Readable<number>;
  readonly isPlaying: Readable<boolean>;
  readonly isBuffering: Readable<boolean>;
  
  // Volume Control
  setVolume(level: number): void;
  
  // Strategy Switching
  switchStrategy(strategy: PlaybackStrategy): Promise<void>;
  getCurrentStrategy(): PlaybackStrategy;
}

interface PlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
}

enum PlaybackStrategy {
  LOCAL = "local",
  REMOTE_SOLO = "remote-solo",
  REMOTE_SYNC = "remote-sync"
}

enum RepeatMode {
  OFF = "off",
  ALL = "all",
  ONE = "one"
}
```

#### IPlaybackStrategy (Strategy Pattern)
```typescript
interface IPlaybackStrategy {
  readonly name: PlaybackStrategy;
  
  // Lifecycle
  initialize(backend: IAudioBackend): Promise<void>;
  dispose(): Promise<void>;
  
  // Playback Control
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(position: number): Promise<void>;
  loadSong(song: ISong): Promise<void>;
  
  // State
  getState(): PlaybackState;
  
  // Events
  on(event: PlaybackEvent, handler: Function): void;
  off(event: PlaybackEvent, handler: Function): void;
}

interface PlaybackState {
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
}

enum PlaybackEvent {
  SONG_ENDED = "song-ended",
  PLAYBACK_STARTED = "playback-started",
  PLAYBACK_PAUSED = "playback-paused",
  POSITION_CHANGED = "position-changed",
  DURATION_CHANGED = "duration-changed",
  BUFFERING_STARTED = "buffering-started",
  BUFFERING_ENDED = "buffering-ended",
  ERROR = "error"
}
```

#### IAudioBackend (Audio Abstraction)
```typescript
interface IAudioBackend {
  // Playback
  load(url: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(position: number): void;

  // State
  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;

  // Volume
  setVolume(level: number): void;
  getVolume(): number;

  // Events
  on(event: AudioEvent, handler: Function): void;
  off(event: AudioEvent, handler: Function): void;

  // Cleanup
  dispose(): void;
}

enum AudioEvent {
  LOADED = "loaded",
  ENDED = "ended",
  PLAYING = "playing",
  PAUSED = "paused",
  TIME_UPDATE = "timeupdate",
  DURATION_CHANGE = "durationchange",
  WAITING = "waiting",
  CAN_PLAY = "canplay",
  ERROR = "error"
}
```

#### IQueueManager
```typescript
interface IQueueManager {
  // Queue Operations
  setQueue(songs: ISong[]): void;
  addNext(songs: ISong[]): void;
  addLast(songs: ISong[]): void;
  remove(index: number): void;
  clear(): void;
  move(from: number, to: number): void;
  
  // Navigation
  getCurrentIndex(): number;
  setCurrentIndex(index: number): void;
  hasNext(): boolean;
  hasPrevious(): boolean;
  getNext(): ISong | null;
  getPrevious(): ISong | null;
  getCurrent(): ISong | null;
  
  // Modes
  setRepeatMode(mode: RepeatMode): void;
  setShuffleEnabled(enabled: boolean): void;
  
  // State
  getQueue(): ISong[];
  
  // Events
  on(event: QueueEvent, handler: Function): void;
  off(event: QueueEvent, handler: Function): void;
}

enum QueueEvent {
  QUEUE_CHANGED = "queue-changed",
  INDEX_CHANGED = "index-changed",
  SONG_ADDED = "song-added",
  SONG_REMOVED = "song-removed"
}
```

#### IPrefetcher
```typescript
interface IPrefetcher {
  // Configuration
  configure(options: PrefetchOptions): void;
  
  // Control
  start(): void;
  stop(): void;
  
  // Manual
  prefetchSong(songId: string): Promise<void>;
  
  // State
  isPrefetching(songId: string): boolean;
  getPrefetchedSongs(): Set<string>;
}

interface PrefetchOptions {
  enabled: boolean;
  triggerThreshold: number; // seconds before end
  checkInterval: number; // milliseconds
  maxConcurrent: number;
}
```

#### IStreamProvider
```typescript
interface IStreamProvider {
  // URL generation
  getStreamUrl(songId: string): string;
  
  // Prefetch
  prefetchSong(songId: string): Promise<void>;
  
  // Metadata
  getSongInfo(songId: string): Promise<SongMetadata>;
}
```

#### ISyncService (for remote sync strategy)
```typescript
interface ISyncService {
  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Room/Session
  joinRoom(roomId: string): Promise<void>;
  leaveRoom(): Promise<void>;
  createRoom(): Promise<string>;
  
  // State Sync
  sendPlaybackState(state: SyncPlaybackState): Promise<void>;
  onPlaybackStateReceived(handler: (state: SyncPlaybackState) => void): void;
  
  // Time Sync
  synchronizeTime(): Promise<TimeSyncResult>;
  getCurrentSyncedTime(): number;
  
  // Events
  on(event: SyncEvent, handler: Function): void;
  off(event: SyncEvent, handler: Function): void;
}

interface SyncPlaybackState {
  songId: string;
  position: number;
  isPlaying: boolean;
  timestamp: number; // synced server time
  initiatorId: string;
}

interface TimeSyncResult {
  roundTripTime: number;
  clockOffset: number;
  serverTime: number;
  accuracy: "high" | "medium" | "low";
}

enum SyncEvent {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ROOM_JOINED = "room-joined",
  ROOM_LEFT = "room-left",
  PEER_JOINED = "peer-joined",
  PEER_LEFT = "peer-left",
  STATE_RECEIVED = "state-received",
  SYNC_ERROR = "sync-error"
}
```

## Implementation Strategy

### Strategy 1: Local Playback Strategy

**Responsibilities:**
- Load and play audio files directly in browser
- Manage HTML5 Audio element lifecycle
- Provide immediate playback control

**Implementation:**
```typescript
class LocalPlaybackStrategy implements IPlaybackStrategy {
  private backend: IAudioBackend | null = null;
  private streamProvider: IStreamProvider;
  private state: PlaybackState;
  private eventEmitter: EventEmitter;
  
  async initialize(backend: IAudioBackend) {
    this.backend = backend;
    this.setupBackendListeners();
  }
  
  async loadSong(song: ISong) {
    const url = this.streamProvider.getStreamUrl(song.id);
    await this.backend!.load(url);
  }
  
  async play() {
    await this.backend!.play();
  }
  
  async pause() {
    await this.backend!.pause();
  }
  
  async seek(position: number) {
    this.backend!.seek(position);
  }
  
  private setupBackendListeners() {
    this.backend!.on(AudioEvent.ENDED, () => {
      this.emit(PlaybackEvent.SONG_ENDED);
    });
    // ... more listeners
  }
}
```

**Gapless Implementation:**
- Use two audio elements (A/B switching)
- Preload next song in inactive element
- Seamlessly switch elements on song end
- Reset and prepare previous element for next song

```typescript
class GaplessAudioBackend implements IAudioBackend {
  private audioElements: [HTMLAudioElement, HTMLAudioElement];
  private activeIndex: 0 | 1 = 0;
  private nextPreloaded: string | null = null;
  
  constructor() {
    this.audioElements = [
      new Audio(),
      new Audio()
    ];
    this.setupGaplessTransition();
  }
  
  private setupGaplessTransition() {
    this.audioElements[0].addEventListener('ended', () => {
      if (this.nextPreloaded) {
        this.switchToInactive();
      }
    });
    // Mirror for element 1
  }
  
  async preloadNext(url: string) {
    const inactiveIndex = this.activeIndex === 0 ? 1 : 0;
    const inactive = this.audioElements[inactiveIndex];
    inactive.src = url;
    inactive.load();
    this.nextPreloaded = url;
  }
  
  private switchToInactive() {
    this.activeIndex = this.activeIndex === 0 ? 1 : 0;
    this.audioElements[this.activeIndex].play();
    this.emit(AudioEvent.PLAYING);
  }
}
```

### Strategy 2: Remote Solo Strategy

**Responsibilities:**
- Server maintains playback state
- Client sends commands to server
- Server executes playback (e.g., to speakers/output device)
- Client receives state updates for UI

**Use Cases:**
- Playing through server's audio output (home server with speakers)
- Raspberry Pi media player controlled by phone
- Server-side audio processing/effects

**Implementation:**
```typescript
class RemoteSoloStrategy implements IPlaybackStrategy {
  private remoteConnection: IRemotePlaybackService;
  private state: PlaybackState;
  private statePollingInterval: number | null = null;
  
  async initialize(backend: IAudioBackend) {
    await this.remoteConnection.connect();
    this.startStatePolling();
  }
  
  async play() {
    await this.remoteConnection.sendCommand({
      type: 'PLAY',
      timestamp: Date.now()
    });
  }
  
  async loadSong(song: ISong) {
    await this.remoteConnection.sendCommand({
      type: 'LOAD_SONG',
      songId: song.id
    });
  }
  
  private startStatePolling() {
    this.statePollingInterval = setInterval(async () => {
      const state = await this.remoteConnection.getPlaybackState();
      this.updateLocalState(state);
    }, 500); // Poll every 500ms
  }
  
  private updateLocalState(remoteState: RemotePlaybackState) {
    this.state = {
      isPlaying: remoteState.isPlaying,
      position: remoteState.position,
      duration: remoteState.duration,
      isBuffering: remoteState.isBuffering
    };
    this.emit(PlaybackEvent.POSITION_CHANGED, this.state.position);
  }
}

interface IRemotePlaybackService {
  connect(): Promise<void>;
  sendCommand(command: PlaybackCommand): Promise<void>;
  getPlaybackState(): Promise<RemotePlaybackState>;
}
```

**Server-Side Requirements:**
- Audio playback capability (using ffmpeg, MPV, or OS audio APIs)
- WebSocket or SignalR endpoint for commands
- State broadcasting to connected client
- Audio output configuration

### Strategy 3: Remote Sync Multiplayer Strategy

**Responsibilities:**
- Synchronize playback across multiple clients
- Coordinate song transitions
- Handle timing offsets
- Manage room/session state

**Implementation:**
```typescript
class RemoteSyncStrategy implements IPlaybackStrategy {
  private backend: IAudioBackend;
  private syncService: ISyncService;
  private timeSyncResult: TimeSyncResult | null = null;
  private lastSyncedState: SyncPlaybackState | null = null;
  private isInitiator: boolean = false;
  private roomId: string | null = null;
  
  async initialize(backend: IAudioBackend) {
    this.backend = backend;
    await this.syncService.connect();
    
    // Perform initial time synchronization
    this.timeSyncResult = await this.syncService.synchronizeTime();
    
    // Listen for state updates from other clients
    this.syncService.onPlaybackStateReceived((state) => {
      this.handleSyncedPlaybackState(state);
    });
  }
  
  async play() {
    if (this.isInitiator) {
      // Send play command to all peers
      const syncedTime = this.syncService.getCurrentSyncedTime();
      await this.syncService.sendPlaybackState({
        songId: this.currentSongId!,
        position: this.backend.getCurrentTime(),
        isPlaying: true,
        timestamp: syncedTime + 200, // Schedule 200ms in future
        initiatorId: this.clientId
      });
    }
    await this.backend.play();
  }
  
  async loadSong(song: ISong) {
    await this.backend.load(
      this.streamProvider.getStreamUrl(song.id)
    );
    
    if (this.isInitiator) {
      // Broadcast song change
      const syncedTime = this.syncService.getCurrentSyncedTime();
      await this.syncService.sendPlaybackState({
        songId: song.id,
        position: 0,
        isPlaying: false,
        timestamp: syncedTime,
        initiatorId: this.clientId
      });
    }
  }
  
  private async handleSyncedPlaybackState(state: SyncPlaybackState) {
    // Ignore our own events
    if (state.initiatorId === this.clientId) return;
    
    this.lastSyncedState = state;
    
    // Load song if different
    const currentSong = this.getCurrentSong();
    if (!currentSong || currentSong.id !== state.songId) {
      const song = await this.fetchSongById(state.songId);
      await this.backend.load(
        this.streamProvider.getStreamUrl(song.id)
      );
    }
    
    // Calculate when to start playback
    const currentSyncedTime = this.syncService.getCurrentSyncedTime();
    const delay = state.timestamp - currentSyncedTime;
    
    if (delay > 0 && delay < 5000) {
      // Schedule future playback
      setTimeout(async () => {
        this.backend.seek(state.position);
        if (state.isPlaying) {
          await this.backend.play();
        } else {
          await this.backend.pause();
        }
      }, delay);
    } else {
      // Immediate sync (missed scheduled time or too far in future)
      // Calculate current position based on elapsed time
      const elapsed = (currentSyncedTime - state.timestamp) / 1000;
      const targetPosition = state.position + (state.isPlaying ? elapsed : 0);
      
      this.backend.seek(targetPosition);
      if (state.isPlaying) {
        await this.backend.play();
      } else {
        await this.backend.pause();
      }
    }
  }
  
  async seek(position: number) {
    if (this.isInitiator) {
      const syncedTime = this.syncService.getCurrentSyncedTime();
      await this.syncService.sendPlaybackState({
        songId: this.currentSongId!,
        position,
        isPlaying: this.backend.isPlaying(),
        timestamp: syncedTime + 100, // Small delay for propagation
        initiatorId: this.clientId
      });
    }
    this.backend.seek(position);
  }
}
```

**Synchronization Approach:**
1. **Clock Sync:** Use NTP-like protocol to sync client clocks with server
2. **Scheduled Start:** Commands include future timestamp for coordinated execution
3. **Position Calculation:** Calculate position based on elapsed time since command
4. **Drift Correction:** Periodically check and adjust for drift
5. **Buffering Coordination:** Wait for all clients to buffer before starting

**Room/Session Management:**
```typescript
class RoomManager {
  private syncService: ISyncService;
  private currentRoom: string | null = null;
  private peers: Set<string> = new Set();
  
  async createAndJoinRoom(): Promise<string> {
    const roomId = await this.syncService.createRoom();
    await this.joinRoom(roomId);
    return roomId;
  }
  
  async joinRoom(roomId: string): Promise<void> {
    await this.syncService.joinRoom(roomId);
    this.currentRoom = roomId;
    
    // Listen for peer events
    this.syncService.on(SyncEvent.PEER_JOINED, (peerId) => {
      this.peers.add(peerId);
    });
    
    this.syncService.on(SyncEvent.PEER_LEFT, (peerId) => {
      this.peers.delete(peerId);
    });
  }
  
  async leaveRoom(): Promise<void> {
    if (this.currentRoom) {
      await this.syncService.leaveRoom();
      this.currentRoom = null;
      this.peers.clear();
    }
  }
  
  getPeers(): string[] {
    return Array.from(this.peers);
  }
}
```

### MusicPlayerController (Facade)

Coordinates all components and provides the public API:

```typescript
class MusicPlayerController implements IMusicPlayer {
  private strategy: IPlaybackStrategy;
  private queueManager: IQueueManager;
  private prefetcher: IPrefetcher;
  private mediaSessionManager: IMediaSessionManager;
  private backend: IAudioBackend;
  
  // State stores
  private stateStore: Writable<PlayerState>;
  private queueStore: Readable<ISong[]>;
  private currentSongStore: Readable<ISong | null>;
  private currentIndexStore: Readable<number>;
  
  constructor(
    initialStrategy: IPlaybackStrategy,
    queueManager: IQueueManager,
    prefetcher: IPrefetcher,
    backend: IAudioBackend
  ) {
    this.strategy = initialStrategy;
    this.queueManager = queueManager;
    this.prefetcher = prefetcher;
    this.backend = backend;
    
    this.initializeStores();
    this.setupEventHandlers();
    this.strategy.initialize(backend);
  }
  
  async play(): Promise<void> {
    await this.strategy.play();
  }
  
  async pause(): Promise<void> {
    await this.strategy.pause();
  }
  
  async next(): Promise<void> {
    if (this.queueManager.hasNext()) {
      const nextIndex = this.queueManager.getCurrentIndex() + 1;
      this.queueManager.setCurrentIndex(nextIndex);
      const song = this.queueManager.getCurrent()!;
      await this.strategy.loadSong(song);
      await this.strategy.play();
    }
  }
  
  async playSong(song: ISong): Promise<void> {
    // Clear remaining queue
    const currentIdx = this.queueManager.getCurrentIndex();
    const queue = this.queueManager.getQueue();
    
    // Remove everything after current
    for (let i = queue.length - 1; i > currentIdx; i--) {
      this.queueManager.remove(i);
    }
    
    // Add new song
    this.queueManager.addLast([song]);
    this.queueManager.setCurrentIndex(this.queueManager.getQueue().length - 1);
    
    // Load and play
    await this.strategy.loadSong(song);
    await this.strategy.play();
  }
  
  async switchStrategy(strategyType: PlaybackStrategy): Promise<void> {
    // Save current state
    const state = this.strategy.getState();
    const currentSong = this.queueManager.getCurrent();
    
    // Dispose old strategy
    await this.strategy.dispose();
    
    // Create and initialize new strategy
    const newStrategy = this.createStrategy(strategyType);
    await newStrategy.initialize(this.backend);
    this.strategy = newStrategy;
    
    // Restore state if possible
    if (currentSong) {
      await this.strategy.loadSong(currentSong);
      await this.strategy.seek(state.position);
      if (state.isPlaying) {
        await this.strategy.play();
      }
    }
  }
  
  private setupEventHandlers(): void {
    // Strategy events
    this.strategy.on(PlaybackEvent.SONG_ENDED, () => {
      this.next();
    });
    
    this.strategy.on(PlaybackEvent.POSITION_CHANGED, (position: number) => {
      this.checkPrefetch(position);
    });
    
    // Queue events
    this.queueManager.on(QueueEvent.INDEX_CHANGED, () => {
      const song = this.queueManager.getCurrent();
      if (song) {
        this.mediaSessionManager.updateMetadata(song);
      }
    });
  }
  
  private checkPrefetch(position: number): void {
    const duration = this.strategy.getState().duration;
    const remaining = duration - position;
    
    if (remaining < 20 && this.queueManager.hasNext()) {
      const nextSong = this.queueManager.getNext();
      if (nextSong && !this.prefetcher.isPrefetching(nextSong.id)) {
        this.prefetcher.prefetchSong(nextSong.id);
      }
    }
  }
}
```

## File Structure (Proposed)

```
Web/src/player/
├── index.ts                          # Public API exports
├── MusicPlayerController.ts          # Main controller/facade
│
├── interfaces/
│   ├── IMusicPlayer.ts              # Public player interface
│   ├── IPlaybackStrategy.ts         # Strategy interface
│   ├── IAudioBackend.ts             # Audio abstraction
│   ├── IQueueManager.ts             # Queue interface
│   ├── IPrefetcher.ts               # Prefetch interface
│   ├── IStreamProvider.ts           # Stream URL provider
│   └── ISyncService.ts              # Sync service interface
│
├── strategies/
│   ├── LocalPlaybackStrategy.ts     # Local playback
│   ├── RemoteSoloStrategy.ts        # Remote solo
│   └── RemoteSyncStrategy.ts        # Remote multiplayer
│
├── backends/
│   ├── HTML5AudioBackend.ts         # Basic HTML5 audio
│   └── GaplessAudioBackend.ts       # Dual-element gapless
│
├── core/
│   ├── QueueManager.ts              # Queue management
│   ├── PrefetchManager.ts           # Prefetch logic
│   ├── MediaSessionManager.ts       # OS media controls
│   └── EventEmitter.ts              # Event handling utility
│
├── sync/
│   ├── SyncService.ts               # SignalR sync service
│   ├── TimeSync.ts                  # Clock synchronization
│   └── RoomManager.ts               # Room/session management
│
├── services/
│   ├── StreamProvider.ts            # API-based stream URLs
│   └── RemotePlaybackService.ts     # Remote solo communication
│
└── types/
    ├── PlayerState.ts               # State types
    ├── Song.ts                      # Song types
    └── Events.ts                    # Event types
```

## Migration Path

### Phase 1: Refactor Current Implementation
1. Extract HTML5 audio logic into `HTML5AudioBackend`
2. Create `LocalPlaybackStrategy` wrapping current logic
3. Extract queue management into `QueueManager`
4. Extract prefetching into `PrefetchManager`
5. Create `MusicPlayerController` wrapping existing `HeadlessMusicPlayer`
6. Update UI components to use new controller (backwards compatible)

### Phase 2: Add Gapless Support
1. Implement `GaplessAudioBackend` with A/B switching
2. Make backend configurable in controller
3. Test gapless transitions

### Phase 3: Implement Remote Solo Strategy
1. Design server-side playback API
2. Implement `RemotePlaybackService`
3. Implement `RemoteSoloStrategy`
4. Add strategy switcher UI

### Phase 4: Implement Remote Sync Strategy
1. Enhance `MusicHub` for room support
2. Implement `RoomManager`
3. Implement `RemoteSyncStrategy` with scheduled playback
4. Add room management UI
5. Test multi-client synchronization

### Phase 5: Polish & Optimize
1. Add error handling and recovery
2. Optimize prefetching logic
3. Add telemetry and diagnostics
4. Performance testing
5. Documentation

## Key Benefits

### 1. True Headless Architecture
- Player logic completely separated from UI
- Can be used in any context (web, Node.js, Electron, etc.)
- Testable in isolation

### 2. Strategy Pattern
- Easy to switch between playback modes
- Each strategy can be developed independently
- New strategies can be added without modifying core

### 3. Clean Separation of Concerns
- Audio backend handles only audio
- Queue manager handles only queue
- Strategies handle only playback coordination
- Controller orchestrates everything

### 4. Extensibility
- New audio backends (Web Audio API, MediaSource Extensions)
- New strategies (P2P sync, broadcast mode, etc.)
- Plugin system for features

### 5. Testability
- Each component can be unit tested
- Strategies can be integration tested
- Mock implementations for testing

### 6. Maintainability
- Clear responsibilities
- Well-defined interfaces
- Easier to reason about
- Easier to debug

## Advanced Features (Future)

### Gapless Playback Improvements
- MediaSource Extensions for better control
- Custom buffering logic
- Crossfade support

### Enhanced Synchronization
- Jitter buffer for network variance
- Adaptive sync based on connection quality
- Peer-to-peer sync (no server)
- Broadcast mode (one leader, many followers)

### Audio Processing
- Equalizer support
- Audio effects (reverb, echo, etc.)
- Volume normalization
- Crossfading

### Advanced Queue Features
- Smart shuffle (avoid repetition)
- Weighted random (play favorites more)
- Dynamic queue based on listening history
- Collaborative queue editing in sync mode

### Analytics & Telemetry
- Playback history
- Skip patterns
- Buffer performance metrics
- Sync accuracy measurements

## Testing Strategy

### Unit Tests
- Each interface implementation
- Queue operations
- Event handling
- Time synchronization math

### Integration Tests
- Strategy switching
- Gapless transitions
- Prefetch coordination
- Sync message flow

### End-to-End Tests
- Multi-client synchronization scenarios
- Network failure recovery
- Room joining/leaving
- Strategy migration

### Performance Tests
- Memory usage over time
- CPU usage during playback
- Network bandwidth for sync
- Buffer efficiency

## Conclusion

This improved architecture provides:
- ✅ Agnostic, headless music player
- ✅ Three distinct playback strategies
- ✅ Complete playback control (play/pause/seek/prev/next)
- ✅ Queue management
- ✅ Gapless playback support
- ✅ Prefetching support
- ✅ Extensible and maintainable design
- ✅ Clean separation of concerns
- ✅ Easy testing and debugging

The architecture supports the vision while maintaining flexibility for future enhancements and ensuring each component has a single, well-defined responsibility.


### 1. The "Brain" (Controller & Facade)

**`MusicPlayerController`**
*   **What it is:** The main entry point and coordinator.
*   **Role:** It is the "boss" that the UI (buttons, play bars) talks to. It doesn't actually play music itself; it delegates tasks to the other components.
*   **Key Tasks:**
    *   Receives commands like "Play" or "Next" from the UI.
    *   Updates reactive state stores (so the UI knows the current song, time, etc.).
    *   Decides when to switch strategies (e.g., going from playing locally to controlling a remote server).
    *   Tells the *Prefetcher* when the song is almost over so it can grab the next one.

### 2. The "Ways to Play" (Strategies)

These are the interchangeable logic blocks for *how* music plays. The controller only uses one at a time.

**`LocalPlaybackStrategy`**
*   **Role:** Standard browser behavior.
*   **Action:** It takes a song URL and feeds it directly to the browser's audio engine. It listens for "song ended" events to tell the controller to play the next track.

**`RemoteSoloStrategy`**
*   **Role:** Remote Control.
*   **Action:** Instead of making noise on your device, it sends commands (via WebSocket/SignalR) to a server (like a Raspberry Pi or a desktop app). It asks the server "What time is it?" to keep your UI progress bar in sync with the remote audio.

**`RemoteSyncStrategy`**
*   **Role:** "Watch Party" mode.
*   **Action:** It ensures everyone in a "Room" hears the same thing at the exact same time. It calculates network lag (ping) and schedules music to start in the future (e.g., "Everyone hit play at timestamp X") so that even if one user has slow internet, the music stays synchronized.

### 3. The "Engine Room" (Backends)

These components touch the actual audio APIs.

**`IAudioBackend` (Interface)**
*   **Role:** The standard plug. It ensures the Strategy doesn't care if it's talking to an HTML `<audio>` tag or a complex Web Audio API setup.

**`HTML5AudioBackend`**
*   **Role:** The basic implementation. It wraps the standard HTML5 `<audio>` element.

**`GaplessAudioBackend`**
*   **Role:** The smooth operator.
*   **Action:** It manages *two* `<audio>` elements. While one plays, it loads the next song into the second one. When the first ends, it instantly switches to the second, eliminating that brief silence between tracks.

### 4. The "Logistics" (Managers & Services)

**`QueueManager`**
*   **Role:** The Playlist Master.
*   **Action:** It holds the list of songs (Previous, Current, Next). It handles shuffling, repeating, and moving items around (drag-and-drop reordering).

**`IPrefetcher` / `PrefetchManager`**
*   **Role:** The buffer loader.
*   **Action:** It looks ahead in the queue. If the current song is ending, it downloads the beginning of the next song so playback starts instantly when the track changes.

**`IStreamProvider`**
*   **Role:** The URL fetcher.
*   **Action:** It translates a generic `SongID` into a specific, playable URL (potentially handling API tokens or signed URLs).

**`ISyncService` & `TimeSync`**
*   **Role:** The Network Clock.
*   **Action:** Used specifically for the *Remote Sync Strategy*. It handles the heavy math required to figure out the exact time difference between the client and the server to ensure millisecond-perfect synchronization.

### Summary of the Flow

1.  **UI** clicks "Play".
2.  **Controller** tells the **Queue Manager** to get the current song.
3.  **Controller** hands that song to the active **Strategy** (e.g., Local).
4.  **Strategy** asks the **Stream Provider** for the URL.
5.  **Strategy** hands the URL to the **Audio Backend**.
6.  **Audio Backend** makes the noise.
7.  While this happens, **Prefetcher** is already downloading the next song in the background.

