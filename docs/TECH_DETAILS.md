# 🏗️ Technical Architecture & Documentation Index

This document serves as the high-level roadmap for the Games Collection's internal structure. It links to detailed sub-documentation for our AI engines and MCP infrastructure.

---

## 🏗️ Architecture Overview

The Games Collection is a **Technical Monorepo** containing:
1. **Frontend**: 75+ Browser-based games (HTML5, Vanilla JS, Canvas).
2. **Backend**: Python-based AI servers (FastAPI/Aiohttp) and management scripts.
3. **MCP Platform**: A bridge for AI agents (Claude/Cursor) to play, analyze, and manage games.

---

## 🤖 AI & Logic Hub

We utilize three distinct levels of AI integration:

### ♟️ 1. Professional Binary Engines
World-class engines running as native C++ binaries with a Python REST bridge.
- **[Stockfish 16 (Chess AI)](ai/STOCKFISH.md)**
- **[KataGo (Go AI)](ai/KATAGO.md)**
- **[YaneuraOu (Shogi AI)](ai/YANEURAOU.md)**

### 🧠 2. DIY & Heuristic Engines
Custom-built AI for board games and puzzle solvers.
- **[DIY & Heuristic Systems](ai/DIY_AI.md)** (Connect Four, Reversi, Gomoku, etc.)

---

## 🤖 The AI Games Collection MCP Platform

The **AI Games Collection MCP Server** is the programmatic interface of this repository. It enables "Correspondence Play" and AI-assisted analysis.

- **[AI Games Collection MCP Server Guide](mcp/AI_GAMES_COLLECTION_MCP.md)**: Tools, database persistence, and configuration.

---

## 📁 System Blueprint

### 🖥️ Backend Service Ports (Default)

| Service | Port | Description |
|---------|------|-------------|
| **Web Server** | 9876 | The main player interface. |
| **Stockfish** | 10001 | Chess engine (Bridge port). |
| **KataGo** | 10002 | Go engine (Bridge port). |
| **YaneuraOu** | 10003 | Shogi engine (Bridge port). |
| **Multiplayer** | 11877 (WS), 11878 (HTTP) | WebSocket real-time gateway. |
| **Sound** | 9878 | Global audio synthesis service. |

### 📂 Directory Map
- `games/`: Categorized game files (The "Product").
- `src/ai_games_collection_mcp/`: MCP protocol implementation (The "Platform").
- `backend/`: AI server bridges and database managers.
- `js/core/`: The shared JS framework (`BaseGame`, `SoundManager`).

---

## 🙏 Credits

- **Architecture**: sandraschi
- **Collaboration**: Developed using FlowEngineering (Human + AI).
