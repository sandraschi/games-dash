# Phase 7: Multiplayer & Social Platform

**Target**: 3-4 weeks  
**Priority**: HIGH  
**Date**: 2025-12-03

---

## Vision

Transform games collection into a **full multiplayer social gaming platform** where you can:
- Play with friends/family over internet (e.g., brother Steve)
- Local multiplayer (same device)
- Alternating turns for single-player games
- Full statistics and leaderboards
- User accounts and authentication
- Game replays and sharing

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  Games     │  │  WebRTC    │  │  Firebase/Supabase   │  │
│  │  Engine    │  │  P2P       │  │  Backend             │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────┐
│                 Signaling Server                             │
│  (WebRTC connection establishment)                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────┐
│                 Game Server (Optional)                       │
│  - Turn-based games (Chess, Cards)                          │
│  - Real-time relay (if P2P fails)                           │
│  - Matchmaking                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Options

### Option A: Firebase (Recommended for Quick Start)

**Pros**:
- Quick setup (hours, not days)
- Free tier generous (Spark Plan)
- Real-time database
- Authentication built-in
- Hosting included
- No server maintenance

**Cons**:
- Vendor lock-in
- Limited control
- Costs scale with usage

**Services Used**:
```
- Firebase Authentication (email, Google, anonymous)
- Firestore (database for users, games, stats)
- Firebase Realtime Database (for live game state)
- Firebase Hosting (deploy app)
- Firebase Functions (server-side logic, optional)
```

**Setup Time**: ~4 hours

### Option B: Supabase (Open Source Firebase Alternative)

**Pros**:
- Open source (can self-host)
- PostgreSQL database (more powerful)
- Real-time subscriptions
- Built-in authentication
- Free tier generous

**Cons**:
- Newer ecosystem
- Less documentation
- Self-hosting requires server

**Setup Time**: ~6 hours

### Option C: Custom Node.js Server (Maximum Control)

**Pros**:
- Full control
- Can self-host on your AMD server
- No vendor lock-in
- Custom logic

**Cons**:
- Most development time
- Maintenance burden
- Need to implement auth, DB, etc.

**Setup Time**: ~2-3 weeks

**Recommendation**: Start with **Firebase**, migrate to Supabase later if needed, or self-host on your AMD server.

---

## Database Schema

### Users Collection

```javascript
users: {
  uid: "firebase_user_id",
  username: "steve_vienna",
  email: "steve@example.com",
  displayName: "Steve",
  avatar: "url_or_emoji",
  createdAt: timestamp,
  lastLogin: timestamp,
  stats: {
    gamesPlayed: 150,
    gamesWon: 75,
    totalPlayTime: 36000000, // milliseconds
    favoriteGame: "chess",
    achievements: ["first_win", "chess_master", "tetris_1000"]
  },
  settings: {
    theme: "dark",
    soundEnabled: true,
    notificationsEnabled: true,
    privacy: "friends_only"
  },
  friends: ["uid1", "uid2"], // Array of friend UIDs
  blocked: [],
  elo: {
    chess: 1500,
    checkers: 1400,
    poker: 1600
  }
}
```

### Games Collection (Game History)

```javascript
games: {
  gameId: "uuid",
  gameType: "chess", // chess, poker, tetris, etc.
  mode: "online_multiplayer", // solo, local_multiplayer, online_multiplayer, alternating
  players: [
    {
      uid: "user1",
      username: "sandra",
      color: "white", // for chess
      position: 1, // for poker
      score: 1234,
      result: "win", // win, loss, draw
      eloChange: +15
    },
    {
      uid: "user2",
      username: "steve",
      color: "black",
      position: 2,
      score: 987,
      result: "loss",
      eloChange: -15
    }
  ],
  startTime: timestamp,
  endTime: timestamp,
  duration: 1800000, // milliseconds
  moves: [], // Array of move objects (for replay)
  status: "completed", // waiting, in_progress, completed, abandoned
  settings: {
    difficulty: 5,
    timeControl: "10+5", // 10 min + 5 sec increment
    variant: "standard"
  },
  winner: "user1",
  replay: "url_to_replay_file", // or embedded in moves
  shared: false,
  comments: []
}
```

### Live Games Collection (Active Games)

```javascript
liveGames: {
  gameId: "uuid",
  gameType: "poker",
  hostUid: "user1",
  players: [
    {
      uid: "user1",
      username: "sandra",
      status: "ready", // waiting, ready, playing, disconnected
      lastHeartbeat: timestamp
    },
    {
      uid: "user2",
      username: "steve",
      status: "playing",
      lastHeartbeat: timestamp
    }
  ],
  maxPlayers: 4,
  currentPlayers: 2,
  status: "waiting", // waiting, starting, in_progress, paused, finished
  gameState: {
    // Game-specific state (board position, cards, etc.)
    // Updated in real-time
  },
  currentTurn: "user1",
  turnStartTime: timestamp,
  turnTimeLimit: 30000, // 30 seconds
  spectators: ["user3", "user4"],
  allowSpectators: true,
  settings: {},
  createdAt: timestamp,
  webrtcOffer: null, // For P2P connection
  webrtcAnswer: null
}
```

### Stats Collection (Detailed Statistics)

```javascript
stats: {
  uid: "user1",
  gameType: "tetris",
  
  // Overall stats
  gamesPlayed: 50,
  wins: 30,
  losses: 15,
  draws: 5,
  winRate: 0.60,
  
  // Performance metrics
  averageScore: 5000,
  highScore: 12000,
  averageTime: 300000, // 5 minutes
  fastestWin: 120000, // 2 minutes
  longestGame: 600000, // 10 minutes
  
  // Skill progression
  elo: 1550,
  eloHistory: [
    { date: timestamp, elo: 1500 },
    { date: timestamp, elo: 1550 }
  ],
  
  // Streaks
  currentWinStreak: 5,
  longestWinStreak: 12,
  currentLossStreak: 0,
  
  // Time-based
  playTimeByDay: {
    "2025-12-01": 3600000,
    "2025-12-02": 7200000
  },
  
  // Game-specific stats
  gameSpecific: {
    // For Tetris
    linesCleared: 5000,
    tetrisCount: 50,
    
    // For Chess
    checkmates: 25,
    stalemates: 3,
    openingsPlayed: { "e4": 20, "d4": 15 },
    
    // For Poker
    handsPlayed: 200,
    biggestPot: 5000,
    bluffSuccess: 0.40
  }
}
```

### Achievements Collection

```javascript
achievements: {
  id: "first_win",
  name: "First Victory",
  description: "Win your first game",
  icon: "🏆",
  category: "milestone",
  gameType: "all",
  condition: {
    type: "wins",
    value: 1
  },
  rarity: "common", // common, rare, epic, legendary
  points: 10,
  unlockedBy: ["user1", "user2"], // Array of UIDs who unlocked it
  unlockedAt: { user1: timestamp, user2: timestamp }
}
```

### Friends Collection

```javascript
friendships: {
  id: "uuid",
  user1: "uid1",
  user2: "uid2",
  status: "accepted", // pending, accepted, blocked
  requestedBy: "uid1",
  requestedAt: timestamp,
  acceptedAt: timestamp,
  lastPlayedTogether: timestamp,
  gamesPlayedTogether: 25
}
```

### Invitations Collection

```javascript
invitations: {
  id: "uuid",
  from: "uid1",
  to: "uid2", // or null for public lobby
  gameType: "poker",
  gameId: "live_game_uuid",
  message: "Want to play poker?",
  status: "pending", // pending, accepted, declined, expired
  createdAt: timestamp,
  expiresAt: timestamp,
  settings: {}
}
```

---

## Authentication System

### Firebase Authentication Setup

```javascript
// auth.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "games-collection.firebaseapp.com",
  projectId: "games-collection",
  storageBucket: "games-collection.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class AuthManager {
  constructor() {
    this.user = null;
    this.onAuthChange = null;
    
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      if (this.onAuthChange) {
        this.onAuthChange(user);
      }
    });
  }
  
  // Email/Password Registration
  async register(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await this.createUserProfile(user.uid, username, email);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Email/Password Login
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Google Sign-In
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile exists, create if not
      const profileExists = await this.checkUserProfile(user.uid);
      if (!profileExists) {
        await this.createUserProfile(user.uid, user.displayName, user.email);
      }
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Anonymous Login (Guest Play)
  async loginAnonymously() {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      // Create guest profile
      await this.createUserProfile(user.uid, `Guest${Date.now()}`, null);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Check if logged in
  isLoggedIn() {
    return this.user !== null;
  }
  
  // Get current user
  getCurrentUser() {
    return this.user;
  }
  
  // Create user profile in Firestore
  async createUserProfile(uid, username, email) {
    const db = getFirestore();
    await setDoc(doc(db, 'users', uid), {
      uid,
      username,
      email,
      displayName: username,
      avatar: '👤',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalPlayTime: 0,
        achievements: []
      },
      settings: {
        theme: 'dark',
        soundEnabled: true,
        notificationsEnabled: true
      },
      friends: [],
      blocked: [],
      elo: {}
    });
  }
  
  async checkUserProfile(uid) {
    const db = getFirestore();
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  }
}

export const authManager = new AuthManager();
```

### Onboarding Flow

```html
<!-- onboarding.html -->
<div id="onboarding-modal" class="modal">
  <div class="modal-content">
    <!-- Step 1: Welcome -->
    <div class="onboarding-step" id="step-1">
      <h2>Welcome to Games Collection! 🎮</h2>
      <p>Play classic games with friends, compete with AI, and track your progress.</p>
      <button onclick="nextStep()">Get Started</button>
      <button onclick="skipOnboarding()">Skip Tour</button>
    </div>
    
    <!-- Step 2: Account Choice -->
    <div class="onboarding-step hidden" id="step-2">
      <h2>Choose Your Experience</h2>
      
      <div class="auth-options">
        <button class="auth-option" onclick="showRegister()">
          <span class="icon">✉️</span>
          <h3>Create Account</h3>
          <p>Save progress, play online, compete on leaderboards</p>
        </button>
        
        <button class="auth-option" onclick="loginWithGoogle()">
          <span class="icon">🔐</span>
          <h3>Sign in with Google</h3>
          <p>Quick login with your Google account</p>
        </button>
        
        <button class="auth-option" onclick="playAsGuest()">
          <span class="icon">👤</span>
          <h3>Play as Guest</h3>
          <p>Try games without an account (limited features)</p>
        </button>
      </div>
    </div>
    
    <!-- Step 3: Registration Form -->
    <div class="onboarding-step hidden" id="step-3">
      <h2>Create Your Account</h2>
      <form id="register-form">
        <input type="text" id="username" placeholder="Username" required>
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password (min 6 chars)" required minlength="6">
        <button type="submit">Create Account</button>
      </form>
      <p>Already have an account? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
    
    <!-- Step 4: Feature Tour -->
    <div class="onboarding-step hidden" id="step-4">
      <h2>What You Can Do</h2>
      <div class="features-grid">
        <div class="feature">
          <span class="icon">🎮</span>
          <h3>15+ Games</h3>
          <p>Chess, Poker, Tetris, and more</p>
        </div>
        <div class="feature">
          <span class="icon">🤖</span>
          <h3>AI Opponents</h3>
          <p>From beginner to grandmaster level</p>
        </div>
        <div class="feature">
          <span class="icon">👥</span>
          <h3>Multiplayer</h3>
          <p>Play with friends online or locally</p>
        </div>
        <div class="feature">
          <span class="icon">📊</span>
          <h3>Track Progress</h3>
          <p>Stats, achievements, leaderboards</p>
        </div>
      </div>
      <button onclick="completeOnboarding()">Start Playing!</button>
    </div>
  </div>
</div>
```

---

## Multiplayer Implementation

### 1. WebRTC P2P (Real-Time Games)

**For**: Fast action games (Pong, Tetris alternating, real-time card games)

```javascript
// webrtc-manager.js
class WebRTCManager {
  constructor(signalingServer) {
    this.signalingServer = signalingServer;
    this.peerConnection = null;
    this.dataChannel = null;
    this.onMessage = null;
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }
  
  // Create offer (host)
  async createOffer(gameId) {
    this.peerConnection = new RTCPeerConnection(this.configuration);
    this.dataChannel = this.peerConnection.createDataChannel('game');
    
    this.setupDataChannel();
    this.setupIceCandidates(gameId);
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    // Send offer to signaling server
    await this.signalingServer.sendOffer(gameId, offer);
  }
  
  // Accept offer (guest)
  async acceptOffer(gameId, offer) {
    this.peerConnection = new RTCPeerConnection(this.configuration);
    
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
    
    this.setupIceCandidates(gameId);
    
    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    // Send answer to signaling server
    await this.signalingServer.sendAnswer(gameId, answer);
  }
  
  setupDataChannel() {
    this.dataChannel.onopen = () => {
      console.log('Data channel open');
    };
    
    this.dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (this.onMessage) {
        this.onMessage(message);
      }
    };
  }
  
  setupIceCandidates(gameId) {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingServer.sendIceCandidate(gameId, event.candidate);
      }
    };
  }
  
  send(data) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(data));
    }
  }
  
  close() {
    if (this.dataChannel) this.dataChannel.close();
    if (this.peerConnection) this.peerConnection.close();
  }
}
```

### 2. Firebase Realtime Database (Turn-Based Games)

**For**: Chess, Poker, Card games, Board games

```javascript
// multiplayer-manager.js
import { getDatabase, ref, set, onValue, off, update } from 'firebase/database';

class MultiplayerManager {
  constructor() {
    this.db = getDatabase();
    this.currentGameId = null;
    this.listeners = {};
  }
  
  // Create game lobby
  async createGame(gameType, settings) {
    const gameId = this.generateGameId();
    const user = authManager.getCurrentUser();
    
    const gameRef = ref(this.db, `liveGames/${gameId}`);
    await set(gameRef, {
      gameId,
      gameType,
      hostUid: user.uid,
      players: [{
        uid: user.uid,
        username: user.displayName,
        status: 'ready',
        lastHeartbeat: Date.now()
      }],
      maxPlayers: settings.maxPlayers || 2,
      currentPlayers: 1,
      status: 'waiting',
      gameState: this.getInitialGameState(gameType),
      currentTurn: null,
      settings,
      createdAt: Date.now(),
      allowSpectators: settings.allowSpectators !== false
    });
    
    this.currentGameId = gameId;
    return gameId;
  }
  
  // Join existing game
  async joinGame(gameId) {
    const user = authManager.getCurrentUser();
    const gameRef = ref(this.db, `liveGames/${gameId}`);
    
    // Check if game exists and has space
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) {
      throw new Error('Game not found');
    }
    
    const game = snapshot.val();
    if (game.currentPlayers >= game.maxPlayers) {
      throw new Error('Game is full');
    }
    
    // Add player
    const players = game.players || [];
    players.push({
      uid: user.uid,
      username: user.displayName,
      status: 'ready',
      lastHeartbeat: Date.now()
    });
    
    await update(gameRef, {
      players,
      currentPlayers: players.length,
      status: players.length === game.maxPlayers ? 'starting' : 'waiting'
    });
    
    this.currentGameId = gameId;
  }
  
  // Listen for game state changes
  listenToGame(gameId, callback) {
    const gameRef = ref(this.db, `liveGames/${gameId}`);
    
    onValue(gameRef, (snapshot) => {
      const game = snapshot.val();
      if (game) {
        callback(game);
      }
    });
    
    this.listeners[gameId] = gameRef;
  }
  
  // Update game state (make a move)
  async updateGameState(gameId, newState, nextTurn) {
    const gameRef = ref(this.db, `liveGames/${gameId}`);
    await update(gameRef, {
      gameState: newState,
      currentTurn: nextTurn,
      turnStartTime: Date.now()
    });
  }
  
  // Send move
  async makeMove(gameId, move) {
    const user = authManager.getCurrentUser();
    const gameRef = ref(this.db, `liveGames/${gameId}`);
    
    // Get current game state
    const snapshot = await get(gameRef);
    const game = snapshot.val();
    
    // Validate it's player's turn
    if (game.currentTurn !== user.uid) {
      throw new Error('Not your turn');
    }
    
    // Process move (game-specific logic)
    const newState = this.processMove(game.gameState, move, game.gameType);
    const nextTurn = this.getNextPlayer(game.players, user.uid);
    
    await this.updateGameState(gameId, newState, nextTurn);
    
    // Log move for replay
    await this.logMove(gameId, user.uid, move);
  }
  
  // End game
  async endGame(gameId, results) {
    const gameRef = ref(this.db, `liveGames/${gameId}`);
    await update(gameRef, {
      status: 'finished',
      endTime: Date.now(),
      results
    });
    
    // Save to game history
    await this.saveGameHistory(gameId, results);
    
    // Update player stats
    await this.updatePlayerStats(results);
  }
  
  // Leave game
  async leaveGame(gameId) {
    const user = authManager.getCurrentUser();
    const gameRef = ref(this.db, `liveGames/${gameId}/players`);
    
    const snapshot = await get(gameRef);
    const players = snapshot.val();
    const updatedPlayers = players.filter(p => p.uid !== user.uid);
    
    await set(gameRef, updatedPlayers);
    
    // Stop listening
    if (this.listeners[gameId]) {
      off(this.listeners[gameId]);
      delete this.listeners[gameId];
    }
  }
  
  generateGameId() {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getInitialGameState(gameType) {
    // Return initial state based on game type
    switch(gameType) {
      case 'chess':
        return { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' };
      case 'poker':
        return { deck: [], hands: {}, pot: 0, currentBet: 0 };
      // ... other games
    }
  }
}

export const multiplayerManager = new MultiplayerManager();
```

### 3. Alternating Play Mode (Single-Player Games)

**Concept**: Sandra plays Tetris until game over, then Steve's turn automatically

```javascript
// alternating-mode.js
class AlternatingPlayManager {
  constructor() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.scores = {};
    this.sessionId = null;
  }
  
  // Start alternating session
  async startSession(gameType, players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.scores = {};
    this.sessionId = `session_${Date.now()}`;
    
    players.forEach(player => {
      this.scores[player.uid] = [];
    });
    
    // Save session to database
    await this.saveSession();
    
    return {
      sessionId: this.sessionId,
      currentPlayer: this.getCurrentPlayer()
    };
  }
  
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }
  
  // Player finished their turn
  async endTurn(score, duration) {
    const currentPlayer = this.getCurrentPlayer();
    
    // Record score
    this.scores[currentPlayer.uid].push({
      score,
      duration,
      timestamp: Date.now()
    });
    
    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    // Update database
    await this.updateSession();
    
    // Check if session should end
    if (this.shouldEndSession()) {
      await this.endSession();
      return {
        sessionEnded: true,
        winner: this.getWinner(),
        finalScores: this.getFinalScores()
      };
    }
    
    return {
      sessionEnded: false,
      nextPlayer: this.getCurrentPlayer(),
      currentScores: this.getCurrentScores()
    };
  }
  
  getCurrentScores() {
    const scores = {};
    for (const [uid, playerScores] of Object.entries(this.scores)) {
      scores[uid] = {
        bestScore: Math.max(...playerScores.map(s => s.score)),
        averageScore: playerScores.reduce((sum, s) => sum + s.score, 0) / playerScores.length,
        turnsPlayed: playerScores.length
      };
    }
    return scores;
  }
  
  getWinner() {
    const scores = this.getCurrentScores();
    let winner = null;
    let highestScore = -Infinity;
    
    for (const [uid, stats] of Object.entries(scores)) {
      if (stats.bestScore > highestScore) {
        highestScore = stats.bestScore;
        winner = uid;
      }
    }
    
    return winner;
  }
  
  shouldEndSession() {
    // End after each player has had X turns
    const turnsPerPlayer = 3;
    return this.players.every(player => 
      this.scores[player.uid].length >= turnsPerPlayer
    );
  }
  
  async saveSession() {
    const db = getFirestore();
    await setDoc(doc(db, 'alternatingSessions', this.sessionId), {
      sessionId: this.sessionId,
      players: this.players,
      scores: this.scores,
      currentPlayerIndex: this.currentPlayerIndex,
      startTime: Date.now(),
      status: 'active'
    });
  }
  
  async updateSession() {
    const db = getFirestore();
    await updateDoc(doc(db, 'alternatingSessions', this.sessionId), {
      scores: this.scores,
      currentPlayerIndex: this.currentPlayerIndex,
      lastUpdate: Date.now()
    });
  }
  
  async endSession() {
    const db = getFirestore();
    await updateDoc(doc(db, 'alternatingSessions', this.sessionId), {
      status: 'completed',
      endTime: Date.now(),
      winner: this.getWinner(),
      finalScores: this.getFinalScores()
    });
  }
}
```

---

## Continue in next file due to length...

**Next**: Card Games, Settings Modals, Statistics Dashboard

