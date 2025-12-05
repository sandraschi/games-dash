# Multiplayer Implementation

**Last Updated:** 2025-12-04

## Overview

**⚠️ IMPORTANT:** This WebSocket server is for **LOCAL NETWORK PLAY ONLY**. 

For playing with players in different locations (like Steve in Hollabrunn), you need **Firebase** or cloud hosting. See `MULTIPLAYER_OPTIONS.md` for details.

The multiplayer system can use either:
1. **WebSocket server** (local network only) - `multiplayer-server.py`
2. **Firebase** (internet play) - See `FIREBASE_SETUP_GUIDE.md`

## WebSocket Server (Local Network Only)

This WebSocket-based architecture works for players on the **same network**. No external services required - everything runs locally.

## Architecture

### Components

1. **`multiplayer-server.py`** - WebSocket server (port 9877)
   - Handles player connections
   - Manages game matching
   - Synchronizes game state
   - Handles disconnections

2. **`multiplayer-simple.js`** - Client library
   - Connects to WebSocket server
   - Handles game matching
   - Sends/receives moves
   - Manages UI updates

3. **`multiplayer.html`** - Multiplayer lobby page
   - Connection interface
   - Game type selection
   - Active games display

## How It Works

### Player Matching

1. Player connects to WebSocket server
2. Player selects a game type (Chess, Shogi, Go, etc.)
3. Server checks for waiting players with same game type
4. If match found: creates game and notifies both players
5. If no match: adds player to waiting list

### Game Flow

1. **Connection:**
   ```
   Client → Server: {type: 'register', name: 'Player1'}
   Server → Client: {type: 'registered', player_id: 'abc123', name: 'Player1'}
   ```

2. **Joining Game:**
   ```
   Client → Server: {type: 'join', game_type: 'chess'}
   Server → Client: {type: 'waiting'} OR {type: 'game_started', ...}
   ```

3. **Making Moves:**
   ```
   Client → Server: {type: 'move', game_id: 'xyz789', move: 'e2e4'}
   Server → Client: {type: 'move_applied', ...}
   Server → Opponent: {type: 'opponent_move', move: 'e2e4', ...}
   ```

4. **Chat:**
   ```
   Client → Server: {type: 'chat', game_id: 'xyz789', message: 'Hello!'}
   Server → Opponent: {type: 'chat', from: 'Player1', message: 'Hello!'}
   ```

## Setup

### 1. Install Dependencies

```powershell
pip install websockets
```

Or use requirements.txt:
```powershell
pip install -r requirements.txt
```

### 2. Start the Server

```powershell
python multiplayer-server.py
```

Server will start on `ws://localhost:9877`

### 3. Open Multiplayer Page

Open `multiplayer.html` in your browser and click "Connect & Play"

## Integration with Games

### Basic Integration

To add multiplayer to a game (e.g., chess.html):

1. **Include the client library:**
   ```html
   <script src="multiplayer-simple.js"></script>
   ```

2. **Check for multiplayer mode:**
   ```javascript
   const urlParams = new URLSearchParams(window.location.search);
   const isMultiplayer = urlParams.get('multiplayer') === 'true';
   const gameId = urlParams.get('game_id');
   const myColor = urlParams.get('color');
   ```

3. **Send moves:**
   ```javascript
   if (isMultiplayer && window.sendMove) {
       window.sendMove(gameId, moveNotation);
   }
   ```

4. **Handle opponent moves:**
   ```javascript
   window.handleOpponentMove = function(move) {
       // Apply opponent's move to board
       applyMove(move);
   };
   ```

### Example: Chess Integration

```javascript
// In chess.html
function makeMove(fromRow, fromCol, toRow, toCol) {
    // ... existing move logic ...
    
    // If multiplayer, send move to server
    if (window.currentGame && window.currentGame().game_id) {
        const moveNotation = convertToNotation(fromRow, fromCol, toRow, toCol);
        window.sendMove(window.currentGame().game_id, moveNotation);
    }
}

// Handle incoming moves
window.handleOpponentMove = function(move) {
    const [from, to] = parseMoveNotation(move);
    if (window.currentGame().my_turn) {
        makeMove(from.row, from.col, to.row, to.col);
    }
};
```

## Message Types

### Client → Server

- `register` - Register new player
- `join` - Join/create game
- `move` - Send move
- `chat` - Send chat message
- `ping` - Keep-alive

### Server → Client

- `registered` - Registration confirmed
- `waiting` - Waiting for opponent
- `game_started` - Game matched and started
- `move_applied` - Move accepted
- `opponent_move` - Opponent made a move
- `opponent_disconnected` - Opponent left
- `chat` - Chat message received
- `error` - Error occurred
- `pong` - Keep-alive response

## Game State Management

Game state is stored **in-memory** on the server:
- Games reset when server restarts
- Suitable for local/private network play
- For persistence, add SQLite database (optional)

## Advantages Over Firebase (Local Network Only)

✅ **No Configuration** - No API keys or setup needed  
✅ **No External Dependencies** - Works completely offline  
✅ **Faster** - Direct connection, no cloud latency  
✅ **Simpler** - Just WebSocket, no complex SDK  
✅ **Private** - All data stays on your network  
✅ **Free** - No usage limits or costs

**BUT:** Only works on same network. For internet play, Firebase is better!  

## Limitations

- ⚠️ **LOCAL NETWORK ONLY** - Players must be on same WiFi/LAN
- ⚠️ **NOT for internet play** - Won't work with players in different locations
- Games reset on server restart (in-memory storage)
- Requires port forwarding for internet access (complex setup)
- No persistent user accounts (uses session IDs)
- No matchmaking ratings/ELO system

**For internet play (different locations), use Firebase instead!** See `MULTIPLAYER_OPTIONS.md`

## Future Enhancements (Optional)

1. **Persistence:**
   - Add SQLite database for game history
   - Save player profiles and statistics

2. **Features:**
   - Game rooms/lobbies
   - Spectator mode
   - Replay system
   - Rating system

3. **Network:**
   - NAT traversal for internet play
   - Relay server option
   - Connection encryption (WSS)

## Troubleshooting

**Server won't start:**
- Check if port 9877 is already in use
- Ensure websockets package is installed

**Can't connect:**
- Verify server is running
- Check browser console for errors
- Ensure firewall allows WebSocket connections

**No opponent found:**
- Open multiplayer.html in second browser/incognito window
- Select same game type
- Should match automatically

## Migration from Firebase

The old Firebase-based multiplayer has been replaced. To migrate:

1. Remove Firebase SDK scripts from HTML
2. Replace `multiplayer.js` with `multiplayer-simple.js`
3. Start `multiplayer-server.py` instead of configuring Firebase
4. Update game integration code (see Integration section above)

Old Firebase files can be removed:
- `firebase-config.js` (no longer needed)
- `multiplayer.js` (replaced by `multiplayer-simple.js`)
