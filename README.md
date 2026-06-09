# Games Collection

**150+ browser games + Japanese learning suite + AI game engines + FastMCP server + Tauri 2.0 desktop app.**

A personal monorepo combining a large browser game collection with professional AI engine integration (Stockfish 16, KataGo, YaneuraOu), a FastMCP 3.2 server for AI-assisted play, and a Tauri 2.0 native wrapper.

---

## Preview

![Dashboard](docs/screenshots/dashboard.png)
*150+ games across 12 categories — board, arcade, card, casino, puzzle, Japanese learning and more.*

| Unusual games | |
|---------------|--|
| ![3D Chess](docs/screenshots/chess-3d.png) | ![Tri-Dimensional Chess](docs/screenshots/td-chess.png) |
| *3D Chess with Three.js board* | *Star Trek TDC — 7-board logic* |
| ![Rubik's Cube](docs/screenshots/rubiks-cube.png) | ![Pac-Man 3D](docs/screenshots/pacman-3d.png) |
| *3D Rubik's Cube with auto-solver* | *Pac-Man in a 3D maze* |
| ![Hanafuda](docs/screenshots/hanafuda.png) | ![Schnapsen](docs/screenshots/schnapsen.png) |
| *Japanese flower cards (Hanafuda)* | *Austrian card classic (Schnapsen)* |
| ![Japanese Knowledge Tree](docs/screenshots/japanese-knowledge-tree.png) |
| *Japanese Knowledge Tree — culture, history & trivia explorer* |

---

## Features

- **150+ browser games** — arcade, board, card, casino, strategy, puzzle, multiplayer
- **Japanese learning suite** — kanji wall (2,500), JLPT N5-N1 drills, flashcards, vocabulary
- **Professional AI engines** — Stockfish 16 (chess, 3500+ Elo), KataGo (Go), YaneuraOu (shogi)
- **FastMCP 3.2 server** — 14 tools for game analysis, AI moves, tournaments, coaching
- **Tauri 2.0 native desktop** — single NSIS installer, embedded PyInstaller backend
- **P2P multiplayer** — Firebase Realtime Database for global sessions
- **Dockerized** — all three engines + gateway in containers
- **SOTA compliance** — Ruff linting, TypeScript typecheck, Playwright e2e, fleet-standard docs

---

## Quick Install

**Full stack (requires uv + just):**

```powershell
git clone https://github.com/sandraschi/games-app
cd games-app
.\start.ps1
```

Opens browser to `http://localhost:10987/` — games + AI engines launch automatically.

**Gateway only:**

```powershell
just serve
# Then open http://localhost:10987/
```

For the native desktop app, see [INSTALL.md](INSTALL.md) — Option E (Tauri NSIS).

---

## What You Can Do

```
Play Stockfish AI at chess — set difficulty level 15
Load a FEN position for analysis: rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1
Start a Go game against KataGo
Study kanji stroke order for JLPT N3
Play 3D Chess or Tri-Dimensional Chess (Star Trek)
```

---

## Ports

| Service | Port |
|---------|------|
| Games gateway (FastAPI) | 10987 |
| Engine: Stockfish | 10001 |
| Engine: KataGo | 10002 |
| Engine: YaneuraOu | 10003 |
| MCP dashboard (Vite dev) | 10986 |
| MCP HTTP endpoint | /mcp on 10987 |

---

## Documentation

| Topic | Document |
|-------|----------|
| Installation (all methods) | [INSTALL.md](INSTALL.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |
| Product requirements | [docs/PRD.md](docs/PRD.md) |
| MCP server docs | [games-mcp/README.md](games-mcp/README.md) |
| Configuration | [docs/CONFIGURATION.md](docs/CONFIGURATION.md) |
| Development guide | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| Troubleshooting | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| Full doc index | [docs/README.md](docs/README.md) |
| Tech stack | [docs/TECH_STACK.md](docs/TECH_STACK.md) |
| Architecture | [docs/HOW_THIS_IS_BUILT.md](docs/HOW_THIS_IS_BUILT.md) |

---

## Requirements

| Dependency | Version | Install |
|------------|---------|---------|
| Python | 3.13+ | `winget install Python.Python.3.13` |
| uv | latest | `winget install astral-sh.uv` |
| Node.js | 20+ | `winget install OpenJS.NodeJS.LTS` |
| just | latest | `winget install Casey.Just` |
| Rust (Tauri) | 1.80+ | `winget install Rustlang.Rustup` |

---

## License

MIT

---

## Fleet compliance

| Requirement | Status |
|-------------|--------|
| FastMCP 3.2 | Yes |
| Tauri 2.0 desktop app | Yes |
| Docker compose (full engine stack) | Yes |
| Playwright e2e | Yes |
| Ruff lint + fix | Yes |
| TypeScript typecheck | Yes |
| llms.txt + llms-full.txt | Yes |
| glama.json | Yes |
| start.ps1 + start.bat | Yes |
| justfile | Yes |
| uv.lock | Yes |
| docs/screenshots/ | Yes |
