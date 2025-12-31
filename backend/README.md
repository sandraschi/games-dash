# Games App - Backend Services

This directory contains the various Python-based backend services that power the games, AI integrations, and multiplayer features.

## Core Services

| Service | Script | Port | Description |
|---------|--------|------|-------------|
| **Web Server** | `web-server.py` | `9876` | Principal entry point. Serves the frontend and proxies AI/multiplayer requests. |
| **Stockfish AI** | `stockfish-server.py` | `9877` | Manages the Stockfish C++ engine for high-performance chess analysis. |
| **Shogi AI** | `shogi-server.py` | `9878` | Interfaces with the YaneuraOu engine for Shogi game logic and AI. |
| **Sound Service** | `sound-service.py` | `9879` | Real-time sound generation and serving (defaults to port `9879`). |
| **Go AI (KataGo)** | `go-server.py` | `9880` | High-level Go AI implementation using the KataGo engine. |
| **Multiplayer Hub** | `multiplayer-server.py` | `9881` | WebSocket-based server for real-time multiplayer board synchronization. |
| **Dictionary API** | `kanji-api.py` / `jlpt-api.py` | `9875` | Provides Kanji, JLPT vocabulary, and example sentence data. |

## External Tools (Executables)

These AI engines are searched for in their respective folders at the project root:

- **Stockfish (Chess)**: `stockfish/stockfish-windows-x86-64-avx2.exe`
- **YaneuraOu (Shogi)**: `yaneuraou/YaneuraOu-Deep-ORT-CPU.exe`
- **KataGo (Go)**: `katago/katago.exe`

## Infrastructure Utilities

- **`server-manager.py`**: A unified utility used by individual servers for health checks, restarts, and process monitoring.
- **`multiplayer_db.py`**: SQLite-based persistence layer for multiplayer sessions and player data.
- **`verify_db.py` / `check_db.py`**: Database integrity and diagnostic scripts.
- **`update_db_schema.py`**: Utility for migrating and updating local database structures.

## Installation & Startup

While individual servers can be started manually (e.g., `python backend/web-server.py`), it is highly recommended to use the global startup script at the root:

```powershell
# Recommended startup from project root
./START_GAMES.ps1
```

This script ensures all ports are cleared, background tasks are managed, and all services are synchronized.
