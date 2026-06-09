# Games Collection — Product Requirements

## Vision

A personal game platform combining 150+ browser games, professional AI engine integration (Stockfish, KataGo, YaneuraOu), Japanese language learning tools, and a FastMCP 3.2 server — all wrapped in a Tauri 2.0 desktop app.

## Architecture

```
User Browser → FastAPI Gateway (10987)
                  ├── Game collection at /
                  ├── REST API at /api/
                  ├── MCP at /mcp
                  └── Engine servers (10001-10003)
                         ├── Stockfish 16 (chess, 3500+ Elo)
                         ├── KataGo (Go)
                         └── YaneuraOu (shogi)

Tauri Desktop → WebView → embedded React dist
                  └── Background: PyInstaller backend

Docker → docker-compose.yml → gateway + engine containers
```

## Target Users

- Personal game collection for casual play
- AI-assisted chess/Go/shogi analysis
- Japanese language learning (kanji, JLPT, vocabulary)
- MCP agent integration for game analysis + coaching

## Key Features

### Game Collection
- 150+ browser games in 12 categories
- Vanilla HTML/JS/CSS — no build step for games
- PWA support (service worker, manifest)

### AI Engines
- Stockfish 16 for chess (real engine, no JS fallback)
- KataGo for Go (GTP protocol)
- YaneuraOu for shogi (USI protocol)
- Engines run as local HTTP servers (standalone or Docker)

### Japanese Learning
- Kanji wall (2,500 kanji, filterable by JLPT/grade/radical)
- JLPT practice tests (N5-N1)
- Vocabulary flashcards with spaced repetition
- Stroke order, grammar, listening

### MCP Server
- FastMCP 3.2 with 14 tools
- Game analysis + AI moves + tournaments + coaching
- SEP-1577 agentic sampling
- Firebase P2P multiplayer sync

### Desktop App
- Tauri 2.0 native wrapper
- Embedded PyInstaller backend
- Single NSIS installer
- Port zombie clearing + readiness detection

## Non-Goals
- Mobile native apps (PWA covers this)
- Multiplayer matchmaking (Firebase handles P2P)
- Social features / leaderboards
- Game development SDK

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Games | Vanilla HTML/JS/CSS |
| MCP Server | FastMCP 3.2, Python |
| Gateway | FastAPI + FastMCP mount |
| Desktop | Tauri 2.0, Rust |
| Database | SQLite (local), Firebase (P2P) |
| AI Engines | Stockfish 16, KataGo, YaneuraOu |
| Engine Servers | Python (aiohttp) |
| Docker | docker-compose, 4 containers |
| Quality | Ruff, TypeScript, Playwright |
