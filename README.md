# Games Collection

A place to play 50+ browser games, learn Japanese, and challenge AI opponents — all running locally.

> **Chess with Stockfish 16 (3500+ Elo) · Go with KataGo · Shogi with YaneuraOu**
> **Japanese: kanji, JLPT N5-N1, flashcards, vocabulary · 23 board games, 19 arcade, 10+ card games**

---

## Table of Contents

- [Preview](#preview)
- [Features](#features)
- [Quick Install](#quick-install)
- [What You Can Do](#what-you-can-do)
- [Game Collection](docs/README_GAMES.md)
- [Japanese Learning](docs/README_JAPANESE.md)
- [MCP Server](games-mcp/README.md)
- [Documentation](#documentation)
- [Requirements](#requirements)
- [License](#license)

---

## Preview

![Dashboard](docs/screenshots/dashboard.png)
*50+ games across 12 categories.*

| | |
|---|---|
| ![3D Chess](docs/screenshots/chess-3d.png) | ![Tri-Dimensional Chess](docs/screenshots/td-chess.png) |
| *3D Chess with Three.js* | *Star Trek TDC* |
| ![Hanafuda](docs/screenshots/hanafuda.png) | ![Schnapsen](docs/screenshots/schnapsen.png) |
| *Japanese flower cards* | *Austrian card classic* |

---

## Features

- **Play against real AI** — Stockfish 16, KataGo, YaneuraOu. No JavaScript toy engines.
- **50+ browser games** — chess, Go, shogi, poker, mahjong, arcade, puzzles, card games
- **Learn Japanese** — 2,500 kanji, JLPT practice (N5-N1), spaced-repetition flashcards
- **MCP tools for agents** — 14 FastMCP 3.2 tools for game analysis, coaching, tournaments
- **Desktop app** — Tauri 2.0, single NSIS installer, everything embedded
- **Docker** — all engines + gateway in containers
- **P2P multiplayer** — Firebase-synced sessions for global play

---

## Quick Install

```powershell
git clone https://github.com/sandraschi/games-app
cd games-app
.\start.ps1
```

This launches all three AI engines + the game gateway. Opens `http://localhost:10987/`.

For other install methods (manual, Docker, Tauri desktop), see [INSTALL.md](INSTALL.md).

---

## What You Can Do

```
Play a game of chess against Stockfish at level 15
Study kanji stroke order for JLPT N3 vocabulary
Challenge KataGo to a 9x9 Go game
Browse the arcade — 19 classic games from Snake to Pac-Man
Open the MCP dashboard at http://localhost:10986
```

---

## Game Collection

Arcade, board, card, casino, puzzle, strategy, and multiplayer games — all in your browser. [Browse the collection](docs/README_GAMES.md).

## Japanese Learning

Kanji wall (2,500), JLPT N5-N1 test drills, vocabulary with spaced repetition, stroke order, grammar, and listening practice. [Start learning](docs/README_JAPANESE.md).

## MCP Server

FastMCP 3.2 server with 14 tools for AI-assisted game analysis, coaching, tournaments, and P2P multiplayer. [Server docs](games-mcp/README.md).

---

## Documentation

| Topic | Where |
|-------|-------|
| Install (all methods) | [INSTALL.md](INSTALL.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |
| Game collection | [docs/README_GAMES.md](docs/README_GAMES.md) |
| Japanese learning | [docs/README_JAPANESE.md](docs/README_JAPANESE.md) |
| MCP server | [games-mcp/README.md](games-mcp/README.md) |
| Configuration | [docs/CONFIGURATION.md](docs/CONFIGURATION.md) |
| Development | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| Troubleshooting | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| Product requirements | [docs/PRD.md](docs/PRD.md) |
| Full index | [docs/README.md](docs/README.md) |

---

## Requirements

| Dependency | Install |
|------------|---------|
| Python 3.13+ | `winget install Python.Python.3.13` |
| uv | `winget install astral-sh.uv` |
| Node.js 20+ | `winget install OpenJS.NodeJS.LTS` |
| just | `winget install Casey.Just` |

---

## License

MIT
