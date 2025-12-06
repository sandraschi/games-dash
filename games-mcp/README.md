# Games MCP Server

**Correspondence Chess and Game Analysis via Claude/Cursor**

## Overview

Play correspondence chess and get game analysis through Claude/Cursor, even when you're away from your computer!

**Perfect for:**
- 🎯 Correspondence chess (turn-based, async)
- 🌍 Playing with physical board while traveling (e.g., in Caracas)
- 🤖 Getting AI analysis and move suggestions
- 📱 Turn-based games via text/voice

## Use Case

**Scenario:** You're in Caracas with a physical chessboard. You want to play correspondence chess with Claude.

1. **You:** "I moved rook from e1 to e4"
2. **Claude:** Records move, consults Stockfish
3. **Claude:** "Stockfish suggests Nf6. The position is equal (+0.2)."
4. **You:** Make move on physical board, tell Claude
5. **Repeat...**

## Installation

```powershell
cd games-app/games-mcp
pip install -e .
```

## Prerequisites

The game engines must be running:

```powershell
# In games-app directory
python stockfish-server.py  # Port 9543
python shogi-server.py      # Port 9544
python go-server.py         # Port 9545
```

Or use the start script:

```powershell
.\START_ALL_SERVERS.ps1
```

## MCP Configuration

Add to your MCP settings (Claude Desktop or Cursor):

```json
{
  "mcpServers": {
    "games-mcp": {
      "command": "python",
      "args": ["-m", "games_mcp.mcp_server"],
      "cwd": "D:\\Dev\\repos\\games-app\\games-mcp"
    }
  }
}
```

## Available Tools

### `make_move`
Record a move in a correspondence game.

**Example:**
```
User: "I moved rook from e1 to e4"
Claude: Uses make_move(game_id="chess_1", move="e2e4")
```

### `get_ai_move`
Get AI move suggestion from Stockfish/Shogi/Go engine.

**Example:**
```
Claude: Uses get_ai_move(game_type="chess", game_id="chess_1")
Returns: "Nf6" (best move)
```

### `analyze_position`
Analyze a position and get evaluation.

### `get_game_state`
Get current state of a correspondence game (moves, position).

### `new_game`
Start a new correspondence game.

### `check_engine_status`
Check if game engine is running.

## Example Conversation

```
User: I'm playing correspondence chess. I just moved e2e4.

Claude: [Uses make_move] Move recorded! Let me get Stockfish's response...
[Uses get_ai_move] Stockfish suggests e7e5. The position is equal.

User: I played e7e5 back.

Claude: [Records move] Good! Now Stockfish suggests Nf3...
```

## Game Types Supported

- **Chess** - Full Stockfish integration
- **Shogi** - YaneuraOu engine
- **Go** - KataGo engine

## Future Enhancements

- SQLite persistence for game history
- Multiple simultaneous games
- Game replay and analysis
- Integration with multiplayer database
- Voice input support

## License

Same as games-app project.

