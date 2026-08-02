# MCP Tools Reference

ai-games-collection exposes 14 MCP tools across 4 categories. Tools are registered via `@mcp.tool()` decorators in `ai-games-collection-mcp/src/ai_games_collection_mcp/tools/`.

## Gameplay

| Tool | Description | Key Args |
|------|-------------|----------|
| `new_game` | Start a new correspondence game | game_type (chess/go/shogi), game_id |
| `make_move` | Record a move in a game | game_id, move, game_type |
| `get_game_state` | Get current game state | game_id |
| `join_shared_session` | Join P2P Firebase session | game_id |

## Analysis

| Tool | Description | Key Args |
|------|-------------|----------|
| `get_ai_move` | Best move from engine | game_type, position, depth, difficulty |
| `analyze_position_detailed` | Deep multi-line analysis | game_type, position, depth (≥20) |
| `check_engine_health` | Engine connectivity | game_type (optional) |

## Management

| Tool | Description | Key Args |
|------|-------------|----------|
| `create_tournament` | New tournament | tournament_id, game_type, max_players, time_control |
| `register_for_tournament` | Register player | tournament_id, player_id |
| `get_player_statistics` | Player ELO + history | player_id, game_type, timeframe |
| `update_player_rating` | ELO update | player_id, game_type, opponent_rating, result |

## Orchestration (SEP-1577 Sampling)

| Tool | Description | Key Args |
|------|-------------|----------|
| `intelligent_game_analysis` | Agentic multi-step analysis | game_id, game_type, analysis_goal |
| `adaptive_learning_session` | AI-guided training | player_id, game_type, duration_minutes |
| `design_coaching_program` | Multi-week curriculum | player_id, game_type, intensity |

## REST API

The FastAPI gateway at /api/v1/status exposes:

```
GET /health          → {"status": "ok", "service": "games-webapp"}
GET /api/v1/status   → {"success": true, "server": "...", "engines": {...}}
```

## Transport

| Mode | URL | Use Case |
|------|-----|----------|
| HTTP | http://localhost:10987/mcp | Streamable HTTP (FastMCP 3.2) |
| REST | http://localhost:10987/api/v1/ | Webapp dashboard |
| stdio | `uv run python -m ai_games_collection_mcp` | Claude Desktop, Cursor |

Full tool docs at `ai-games-collection-mcp/README.md` and docstrings in source.
