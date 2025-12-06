# Games MCP Server - Correspondence Chess

## Overview

The **Games MCP Server** enables you to play correspondence chess and get game analysis through Claude/Cursor, even when you're away from your computer!

## Perfect Use Case

**You're in Caracas with a physical chessboard:**
1. You: "I moved rook from e1 to e4"
2. Claude: Records move, consults Stockfish
3. Claude: "Stockfish suggests Nf6. The position is equal (+0.2)."
4. You: Make move on physical board, tell Claude
5. Repeat...

## Installation

```powershell
cd games-app/games-mcp
pip install -e .
```

## Setup

1. **Start game engines:**
   ```powershell
   cd games-app
   .\START_ALL_SERVERS.ps1
   ```

2. **Add to MCP config** (Claude Desktop or Cursor):
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

- **`make_move`** - Record a move in correspondence game
- **`get_ai_move`** - Get AI move suggestion from Stockfish/Shogi/Go
- **`analyze_position`** - Analyze position and get evaluation
- **`get_game_state`** - Get current game state
- **`new_game`** - Start new correspondence game
- **`check_engine_status`** - Check if engine is running

## Example Usage

```
User: I'm playing correspondence chess. I just moved e2e4.

Claude: [Uses make_move] Move recorded! Let me get Stockfish's response...
[Uses get_ai_move] Stockfish suggests e7e5. The position is equal.

User: I played e7e5 back.

Claude: [Records move] Good! Now Stockfish suggests Nf3...
```

## Supported Games

- **Chess** - Stockfish engine
- **Shogi** - YaneuraOu engine  
- **Go** - KataGo engine

See `games-mcp/README.md` for full documentation.

