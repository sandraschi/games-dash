# 🤖 Games MCP Server (Detailed Guide)

The Games MCP (Model Context Protocol) server is the brain of the collection when used via AI assistants like Claude or Cursor. It transforms the game files into a rich, programmable platform.

---

## 🚀 Core Features

### 1. Correspondence Play
Play games like Chess, Shogi, or Go directly within your chat interface. Use natural language: *"I move my knight to f3"* – the server records the move and responds with an AI evaluation.

### 2. Database Persistence
Powered by a robust **SQLite backend**, all games, tournaments, and ratings are saved permanently. 
- **Location**: `src/games_mcp/data/games.db`
- **Managed by**: `src/games_mcp/database.py`

### 3. ADN (Advanced Memory) Integration
The server links with **Advanced Memory** to store game analysis, tactical notes, and strategic insights that persist across different chat sessions.

---

## 🛠️ Tool Collection (16 Total)

| Category | Tools |
|----------|-------|
| **Core Play** | `make_move`, `get_ai_move`, `new_game`, `get_game_state` |
| **Competitive** | `create_tournament`, `register_for_tournament`, `get_tournament_status` |
| **Analysis** | `analyze_position`, `analyze_position_detailed` |
| **Training** | `generate_puzzle`, `solve_puzzle` |
| **Stats** | `get_player_statistics`, `get_player_rating` |

---

## 🏗️ Technical Architecture

### **FastMCP Standard**
Built using the **FastMCP 2.14.3+** framework, ensuring:
- **Strict JSON-RPC Compliance**.
- **Windows Binary Safety**: `msvcrt.setmode` ensures no CRLF corruption on output.
- **Async Execution**: Fully non-blocking tool execution.

### **Enhanced AI Management**
The `enhanced_ai_manager.py` handles:
- **Intelligent Caching**: 80%+ cache hit rate for repeated positions.
- **Health Monitoring**: Real-time status tracking of all 4 AI engines.
- **Parameter Optimization**: Dynamically adjusts move times and search depths based on load.

---

## 🔌 Setup & Configuration

### Standard Launch
```bash
pip install -e .
games-mcp
```

### Claude Desktop Config
```json
{
  "mcpServers": {
    "games": {
      "command": "games-mcp"
    }
  }
}
```

---

## 🧪 Documentation Links
- [Architecture Details](../TECH_DETAILS.md)
- [Stockfish Engine](../ai/STOCKFISH.md)
- [KataGo Engine](../ai/KATAGO.md)
- [YaneuraOu Engine](../ai/YANEURAOU.md)
- **[Electron Orchestrator Guide](ELECTRON_ORCHESTRATOR.md)**: The "Zero-Terminal" desktop strategy.
