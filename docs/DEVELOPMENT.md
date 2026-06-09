# Development

## Quick Start

```powershell
just serve       # Backend on 10987 (uvicorn hot-reload)
just dev-web     # Frontend on 10986 (Vite HMR)
```

## Python Setup

```powershell
uv sync --all-extras
just lint        # Ruff check
just fix         # Ruff auto-fix + format
```

## TypeScript Setup

```powershell
npm --prefix web_sota install
just typecheck   # tsc -b --noEmit
```

## Tests

```powershell
uv run pytest tests/ -q
just e2e         # Playwright (starts backend first)
```

## Tauri Desktop Build

```powershell
just build-sidecar     # PyInstaller only
just build-native      # Full NSIS installer
just build-native-debug # Debug build (skip PyInstaller)
```

## Docker

```powershell
just docker-up    # docker compose up -d
just docker-down  # docker compose down
```

## Project Structure

| Directory | Content |
|-----------|---------|
| games/ | 150+ browser games (HTML + JS) |
| web_sota/ | React 19 + Vite 7 SPA |
| games-mcp/ | FastMCP 3.2 server package |
| native/ | Tauri 2.0 desktop wrapper |
| backend/ | Legacy Python engine servers |
| data/ | Game databases (kanji, JLPT, etc.) |
| docs/ | Full documentation |
| tests/ | Playwright e2e + Vitest unit tests |

## Conventions

- Ruff line-length: 120
- TypeScript: strict mode
- No `node_modules/` or `.venv/` in git
- No hardcoded ports — use `server-config.env` or env vars
