# 🎮 Games Collection

**Playable Suite & AI-Agentic Platform**

The Games Collection is a high-performance **Technical Monorepo** designed for both humans and AI. It combines a massive library of 75+ browser games with a professional-grade AI platform for analysis, learning, and correspondence play.

---

## 🎭 Dual Nature: Play vs. Platform

### 🕹️ For Players
A zero-cost, modern gaming hub with world-class AI opponents, mobile optimization (PWA), and real-time multiplayer.
- **[👉 Get Started (INSTALL.md)](INSTALL.md)**
- **[📱 Mobile & iPad Guide](docs/MOBILE_APPLE.md)**

### 🤖 For AI & Developers
A Model Context Protocol (MCP) platform that allows AI agents like **Claude** or **Cursor** to play games, organize tournaments, and perform deep tactical analysis.
- **[🤖 Games MCP Guide](docs/mcp/GAMES_MCP.md)**
- **[🏗️ Technical Architecture](docs/TECH_DETAILS.md)**

---

## ✨ Features at a Glance

- ♟️ **World-Class AI**: Stockfish 16 (Chess, 3500 Elo), YaneuraOu (Shogi), and KataGo (Go).
- 🖖 **Tri-Dimensional Chess**: Star Trek style multi-level chess with 3D rendering and accurate physics.
- 🧠 **Smart Platform**: SQLite persistence, ADN (Advanced Memory) integration, and cache-optimized engines.
- 🌍 **Multiplayer**: Integrated Firebase and WebSocket infrastructure for worldwide play.
- 🇯🇵 **Japanese Learning**: Interactive Kanji walls, stroke order visualizers, and cultural history.

---

## 🖼️ Documentation Hub

| Category | Detailed Guide |
|----------|----------------|
| **Setup** | [Installation (Windows/Docker/Manual)](INSTALL.md) |
| **Mobile** | [iPad, PWA & Capacitor](docs/MOBILE_APPLE.md) |
| **Chess** | [Stockfish Engine](docs/ai/STOCKFISH.md) \| [TDC Guide](docs/ai/TDC_PRD.md) |
| **AI Documentation** | [KataGo](docs/ai/KATAGO.md) \| [YaneuraOu](docs/ai/YANEURAOU.md) \| [DIY AI](docs/ai/DIY_AI.md) |
| **Platform** | [Games MCP Server Detailed Manual](docs/mcp/GAMES_MCP.md) |
| **Future** | [Roadmap & Beta Status](docs/ROADMAP.md) |

---

## 🛠️ Quick Setup (Dev / MCP)

```bash
git clone https://github.com/sandraschi/games-dash.git
pip install -e .
games-mcp  # Launch the MCP server
```

---

## 🙏 Credits

Built with **FlowEngineering** by **sandraschi**.
Powered by **Stockfish**, **KataGo**, **YaneuraOu**, and **Gemini AI**.

---

MIT License - Do whatever you want with it. 🎮


## 🚀 Installation

### Prerequisites
- [uv](https://docs.astral.sh/uv/) installed (RECOMMENDED)
- Python 3.12+

### 📦 Quick Start
Run immediately via `uvx`:
```bash
uvx games-mcp
```

### 🎯 Claude Desktop Integration
Add to your `claude_desktop_config.json`:
```json
"mcpServers": {
  "games-mcp": {
    "command": "uv",
    "args": ["--directory", "D:/Dev/repos/games-app", "run", "games-mcp"]
  }
}
```
