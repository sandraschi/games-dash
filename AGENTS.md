# games-app Agent Context

FastMCP 3.2 fleet server: 150+ browser games + AI engines + Japanese learning suite + Tauri 2.0 desktop app.

## Environment

- Shell: pwsh (Windows). Always use native PowerShell, not cmd.
- Tools: `uv` for Python, `npm` for Node, `just` for recipes.
- Paths: Use absolute paths from ~/.claude/CLAUDE.md.

## Build & Test

```powershell
uv sync                        # Install Python deps
npx --prefix web_sota install  # Install JS deps
just serve                     # Start backend on 10987
just dev-web                   # Start frontend on 10986
just lint                      # Ruff check
just typecheck                 # TypeScript typecheck
uv run pytest tests/ -q        # Run tests
```

## FastMCP Standards

- **Version**: FastMCP 3.2+ (`fastmcp>=3.2.0`)
- **Server**: `games-mcp/src/games_mcp/server.py` — FastMCP instance registered at import time via `@mcp.tool()`
- **Gateway**: `web_sota/server.py` — FastAPI wraps FastMCP at `/mcp`, REST at `/api/v1/`
- **Portmanteau**: Use operation-based portmanteaus (one tool per domain, `operation` param)
- **Sampling**: Use `ctx.sample()` for agentic workflows (SEP-1577)
- **No stubs**: No mock/placeholder tool implementations

## Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 10986 |
| Backend (FastAPI + FastMCP) | 10987 |
| Stockfish | 10780 |
| Shogi (YaneuraOu) | 10781 |
| Go (KataGo) | 10782 |

## Webapp Stack

- React 19 + Vite 7 + TypeScript 5.9
- Vite proxy: /api, /mcp, /health -> 127.0.0.1:10987
- PWA with service worker, manifest, icons

## Key Files

| File | Purpose |
|------|---------|
| `web_sota/server.py` | FastAPI gateway |
| `games-mcp/src/games_mcp/server.py` | FastMCP server + tool registration |
| `web_sota/src/App.tsx` | React dashboard |
| `run_server.py` | PyInstaller entry point |
| `native/` | Tauri 2.0 desktop wrapper |
| `Dockerfile` | Gateway container |
| `docker-compose.yml` | Full stack compose |

## Critical Don'ts

- Never commit `native/resources/*.exe` or `native/binaries/*.exe`
- Never hardcode ports — use the port registry or env vars
- Never add emoji to files unless explicitly requested
- Never use `&&` in pwsh — use `;` or `if ($?) {}`
