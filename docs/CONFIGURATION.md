# Configuration

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GAMES_BACKEND_PORT` | 10987 | Backend FastAPI + FastMCP HTTP port |
| `GAMES_MCP_LOG_LEVEL` | INFO | Logging level (DEBUG, INFO, WARNING) |
| `STOCKFISH_URL` | http://localhost:8000 | Stockfish engine HTTP endpoint |
| `SHOGI_URL` | http://localhost:8001 | Shogi (YaneuraOu) engine HTTP endpoint |
| `GO_URL` | http://localhost:8002 | Go (KataGo) engine HTTP endpoint |
| `GAMES_TAURI` | 0 | Set to 1 when running under Tauri |
| `GAMES_FRONTEND_DIST` | web_sota/dist | Path to built React frontend |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | — | Firebase service account JSON for P2P sync |
| `FIREBASE_DATABASE_URL` | — | Firebase Realtime Database URL |

## Port Configuration

| Port | Service | Config File |
|------|---------|-------------|
| 10986 | Frontend (Vite dev) | web_sota/vite.config.ts |
| 10987 | Backend (FastAPI + FastMCP) | env GAMES_BACKEND_PORT |
| 10780 | Stockfish | env STOCKFISH_URL |
| 10781 | Shogi | env SHOGI_URL |
| 10782 | Go | env GO_URL |

## Server Config

Default config is in `server-config.env` at repo root. Copy to modify:

```powershell
cp server-config.env server-config.local.env
# Edit server-config.local.env, then:
$env:GAMES_BACKEND_PORT = (Get-Content server-config.local.env | Select-String "GAMES_BACKEND_PORT").ToString().Split("=")[1]
```

## Tauri Desktop

The Tauri app reads the version from `native/tauri.conf.json` and the backend port from `GAMES_BACKEND_PORT` env. When running under Tauri, the backend is spawned with `GAMES_TAURI=1`.

See `native/src/backend.rs` for spawn logic.
