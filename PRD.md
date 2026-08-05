# PRD — Games Collection (ai-games-collection)

**Status**: Active · **Version**: 2.6.0 · **Owner**: Sandra Schipal

## Purpose

A playable games suite (150+ browser games) with professional AI engines
(Stockfish, KataGo, YaneuraOu, Edax, GNU Backgammon, OpenSpiel, MoHex), a Japanese
learning suite, and a FastMCP server that lets AI agents analyze positions, coach,
run tournaments, and orchestrate shared multiplayer sessions — all controllable from
a React dashboard and a Tauri 2.0 desktop app.

## Users

- **Players** — browser games + multiplayer rooms (WebSocket local, Firebase internet).
- **AI agents (Claude/Cursor/opencode)** — MCP tools over `/mcp/` (streamable HTTP).
- **Sandra/Steve** — dashboard control plane (engines, Docker stack, tools, lobby).

## Architecture

```
games/ (browser games) ──┬── WebSocket (local) / Firebase RTDB (internet)
                         └── HTTP ──► FastAPI Gateway (10987)
                                        ├── /mcp/        FastMCP (15 tools)
                                        ├── /api/v1/*    status, docker, llm, skills
                                        └── /mcp-dashboard  React SPA (dev: 10986)
Firebase RTDB (games/{gameId})  ◄── browsers + MCP backend (same nodes)
Tauri 2.0 desktop ──► embedded PyInstaller backend ──► gateway on 10987
```

## Shipped Features (v2.6.0)

- 150+ browser games, Japanese learning suite (kanji/JLPT/Tatoeba via `japanese_api`)
- 7 AI engines (Stockfish, KataGo, YaneuraOu, Edax, GNU Backgammon, OpenSpiel, MoHex): native via `start.ps1` by default (Docker Compose optional)
- FastMCP server: gameplay, analysis, management (tournaments/ELO), orchestration
  (agentic workflows); `list_shared_sessions` / `join_shared_session` / `new_game`
- Real-time multiplayer: Firebase RTDB `games/{id}` nodes shared across browser,
  MCP tools, and dashboard lobby; unified-multiplayer.js WS+Firebase adapter
- Dashboard: Docker connection banner (10987), real Chess Kibitzer (get_ai_move),
  MCP tools explorer (15 tools), chat (Ollama/LM Studio), Help page with 5 tabs
- Tauri 2.0 NSIS installer (embedded backend, `.env.example` bundling)

## Non-Goals

- No matchmaking/ranking service beyond tournaments (ELO local-only for now)
- No on-prem server mode beyond the local gateway
- No AI-vs-AI autonomous tournament engine (orchestration tools exist, run manually)

## Known Gaps (see docs/MULTIPLAYER_STATUS.md)

1. Service account key rejected (`invalid_grant`) — needs fresh download.
2. RTDB security rules not audited for browser SDK access.
3. Some games use direct Firebase adapters instead of unified-multiplayer.js.
