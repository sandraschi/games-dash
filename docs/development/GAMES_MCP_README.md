# Games MCP Server - Enhanced AI Integration Platform

## Overview

The **Games MCP Server** is a comprehensive AI-powered platform for correspondence games, tournament management, and knowledge integration. It enables you to play correspondence chess, shogi, go, and other games through Claude/Cursor with advanced AI analysis, persistent game storage, and intelligent caching.

## 🎯 Key Features

### **Enhanced AI Integration**
- **Intelligent Caching**: Instant responses for repeated positions
- **Database Persistence**: SQLite backend for games, tournaments, and statistics
- **Advanced Memory (ADN) Integration**: Knowledge management and analysis notes
- **Performance Optimization**: Cache hit rates and automatic cleanup
- **System Monitoring**: Comprehensive health and status tracking

### **Game Support**
- **Chess** - Stockfish 16 engine with full analysis
- **Shogi** - YaneuraOu v9.10 engine
- **Go** - KataGo v1.15.3 engine
- **Correspondence Games** - Gomoku, Checkers, Connect Four, Mühle, Battleship, Scrabble
- **Tournament Management** - Automated pairings and comprehensive reporting

## 🚀 Perfect Use Cases

### **Correspondence Chess (Enhanced)**
**You're in Caracas with a physical chessboard:**
1. You: "I moved rook from e1 to e4"
2. Claude: Records move, gets cached Stockfish analysis
3. Claude: "Stockfish suggests Nf6. Position evaluation: +0.3 (cached)"
4. You: Make move on physical board, tell Claude
5. Claude: Creates analysis note in knowledge base
6. Repeat...

### **Tournament Organization**
1. Claude: `create_tournament("weekend_blitz", "chess", 8, "blitz")`
2. User: "Register me for the tournament"
3. Claude: `register_for_tournament("weekend_blitz", "player_123")`
4. Claude: Generates comprehensive tournament report in ADN

### **Knowledge-Based Learning**
1. User: "How should I play against the Sicilian Defense?"
2. Claude: `search_game_knowledge("Sicilian defense", "chess")`
3. Claude: Returns strategic insights from knowledge base
4. Claude: `create_analysis_note()` for personalized study plan

## Installation

```powershell
cd games-app/games-mcp
pip install -e .
```

## 🔧 Setup

### **1. Start Game Engines**
```powershell
cd games-app
.\START_ALL_SERVERS.ps1
```

### **2. Configure MCP Client**
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

### **3. Validate Installation**
```powershell
cd games-app/games-mcp
python validate_mcp.py
```

## 🛠️ Available Tools (16 Total)

### **Core Game Tools**
- **`make_move`** - Record a move in correspondence game (with persistence)
- **`get_ai_move`** - Get AI move suggestion (with intelligent caching)
- **`analyze_position`** - Analyze position and get evaluation
- **`get_game_state`** - Get current game state (database-backed)
- **`new_game`** - Start new correspondence game (auto-saves)
- **`check_engine_status`** - Check if AI engine is running

### **Tournament Management**
- **`create_tournament`** - Create and manage tournaments
- **`register_for_tournament`** - Register players for tournaments
- **`generate_puzzle`** - Generate tactical puzzles for training
- **`analyze_position_detailed`** - Deep position analysis with multiple lines

### **Player & Statistics**
- **`get_player_statistics`** - Get comprehensive player statistics
- **`update_player_rating`** - Update ELO ratings with automatic calculations

### **🆕 Enhanced AI Integration Tools**
- **`create_analysis_note`** - Create detailed analysis notes in Advanced Memory
- **`search_game_knowledge`** - Search game knowledge and strategies
- **`cleanup_cache`** - Clean up expired AI analysis cache
- **`get_system_status`** - Get comprehensive system health monitoring

## 📚 Example Usage

### **Correspondence Chess (Enhanced)**
```
User: I'm playing correspondence chess. I just moved e2e4.

Claude: [Uses make_move] Move recorded! Let me get Stockfish's response...
[Uses get_ai_move] Stockfish suggests e7e5. The position is equal.

User: I played e7e5 back.

Claude: [Records move] Good! Now Stockfish suggests Nf3...
[Claude: Creates analysis note] I've created a detailed analysis note with tactical insights.
```

### **Tournament Workflow**
```
User: Let's organize a weekend chess tournament.

Claude: [Uses create_tournament] Tournament created: weekend_blitz
User: Register me for the tournament.
Claude: [Uses register_for_tournament] You're registered!
User: How's the tournament going?
Claude: [Uses get_system_status] All systems operational, 8 players registered.
```

### **Knowledge-Based Learning**
```
User: I need help with the Sicilian Defense.

Claude: [Uses search_game_knowledge] Found 5 strategic guides for Sicilian Defense...
User: Can you analyze my current position?
Claude: [Uses create_analysis_note] I've created a detailed analysis note with learning points.
```

### **System Monitoring**
```
User: Is everything working properly?

Claude: [Uses get_system_status] 
✅ Chess engine: Running (Stockfish 16)
✅ Database: Connected (SQLite)
✅ ADN Integration: Available
✅ Active games: 3
✅ Cache hit rate: 87%
```

## 🎮 Supported Games

### **Full AI Engine Support**
- **Chess** - Stockfish 16 engine (~3500 ELO)
- **Shogi** - YaneuraOu v9.10 engine (Japanese chess)
- **Go** - KataGo v1.15.3 engine (world-class Go AI)

### **Correspondence Play**
- **Gomoku** (5 in a row) - Move format: "7,7"
- **Checkers** - Move format: "5,2 to 4,3"
- **Connect Four** - Move format: "3" (column 0-6)
- **Mühle** (Nine Men's Morris) - Move format: "5" (position 0-23)
- **Battleship** - Move format: "A5" or "0,4"
- **Scrabble** - Move format: "HELLO at H8 horizontal"

## 🚀 Performance Features

### **Intelligent Caching**
- **Position Hashing**: MD5-based cache keys for instant lookups
- **Cache TTL**: 24-hour default with configurable cleanup
- **Hit Rate Optimization**: 80%+ hit rates for common positions
- **Memory Management**: Automatic cleanup prevents memory bloat

### **Database Persistence**
- **Game Storage**: All correspondence games automatically saved
- **Tournament Data**: Complete tournament history and results
- **Player Statistics**: ELO ratings, win rates, performance metrics
- **Analysis Cache**: AI analysis results cached for performance

### **ADN Integration**
- **Knowledge Management**: Structured notes in Advanced Memory
- **Search Capabilities**: Full-text search across game knowledge
- **Analysis Notes**: Automated tactical insights and learning points
- **Graceful Degradation**: Works even without ADN connection

## 🔍 Troubleshooting

### **Common Issues**

**AI Engine Not Running**
```powershell
# Start engines
cd games-app
.\START_ALL_SERVERS.ps1

# Check status
python -c "from games_mcp.mcp_server import check_engine_status; import asyncio; print(asyncio.run(check_engine_status('chess')))"
```

**Database Issues**
```powershell
# Validate database
cd games-app/games-mcp
python validate_mcp.py
```

**Cache Performance**
```powershell
# Clean up cache
python -c "from games_mcp.mcp_server import cleanup_cache; import asyncio; print(asyncio.run(cleanup_cache()))"
```

## 📖 Advanced Configuration

### **Cache Settings**
- Default TTL: 24 hours
- Cleanup interval: Manual via `cleanup_cache`
- Cache location: `data/games_mcp.db`

### **Database Location**
- Default: `games-app/games-mcp/data/games_mcp.db`
- Tables: games, tournaments, players, analysis_cache, game_history
- Backup: Automatic SQLite journaling

### **ADN Integration**
- Required: Advanced Memory MCP server running
- Optional: Server works without ADN (graceful degradation)
- Features: Knowledge search, analysis notes, tournament reports

## 📚 Documentation

- **Full Documentation**: `games-mcp/README_ENHANCEMENTS.md`
- **Technical Details**: `games-mcp/src/games_mcp/`
- **Validation Script**: `games-mcp/validate_mcp.py`
- **Test Suite**: `games-mcp/test_mcp_server.py`

---

**Enhanced by FlowEngineering methodology - Human vision, AI execution, perfect results.**

*Last updated: 2026-01-09*

