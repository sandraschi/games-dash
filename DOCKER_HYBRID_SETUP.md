# Docker Hybrid Setup Guide

## Architecture

**Corrected Hybrid approach** - Windows first, Docker optional:
- ✅ **Windows host**: ALL Python servers + AI engines (.exe files)
- ✅ **Linux container** (optional): Web server only (serves HTML/JS/CSS)
- ✅ **No mode switching**: Keep Docker Desktop in Linux containers mode

**WHY THIS ARCHITECTURE?**
AI engines are Windows .exe files that CANNOT run in Linux containers!
Python servers launch these .exe files, so they must run natively on Windows.

This is similar to how Ollama/LM Studio work - they run on Windows natively.

## How It Works

**Option 1: Windows Only (Recommended)**
```
┌─────────────────────────────────────┐
│  Windows Host (Everything)         │
│  ┌───────────────────────────────┐  │
│  │  web-server.py (port 9876)    │  │ ← Static files
│  │  stockfish-server.py (9543)   │  │ ← Launches .exe
│  │  shogi-server.py (9544)       │  │ ← Launches .exe
│  │  go-server.py (9545)          │  │ ← Launches .exe
│  │  multiplayer-server.py (9877) │  │ ← WebSocket
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  stockfish-windows-x86-64.exe │  │ ← Windows .exe
│  │  YaneuraOu-Deep-ORT-CPU.exe   │  │ ← Windows .exe
│  │  katago.exe                   │  │ ← Windows .exe
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Option 2: Hybrid (Windows + Docker Web Server)**
```
┌─────────────────────────────────────┐
│  Docker Desktop (Linux Containers)  │
│  ┌───────────────────────────────┐  │
│  │  games-collection-web         │  │ ← nginx (static files only)
│  │  (port 9876)                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              │ HTTP requests
              ▼
┌─────────────────────────────────────┐
│  Windows Host (AI Engines)         │
│  ┌───────────────────────────────┐  │
│  │  stockfish-server.py (9543)   │  │ ← Launches .exe
│  │  shogi-server.py (9544)       │  │ ← Launches .exe
│  │  go-server.py (9545)          │  │ ← Launches .exe
│  │  multiplayer-server.py (9877) │  │ ← WebSocket
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  stockfish-windows-x86-64.exe │  │ ← Windows .exe
│  │  YaneuraOu-Deep-ORT-CPU.exe   │  │ ← Windows .exe
│  │  katago.exe                   │  │ ← Windows .exe
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Setup

### Option 1: Windows Only (Recommended - Simplest)

**Start everything on Windows:**
```powershell
cd games-app
.\START_ALL_SERVERS.ps1
```

This starts ALL services on Windows:
- Web server: `http://localhost:9876` ← Static files
- Stockfish AI: `http://localhost:9543` ← Launches Windows .exe
- Shogi AI: `http://localhost:9544` ← Launches Windows .exe
- Go AI: `http://localhost:9545` ← Launches Windows .exe
- Multiplayer: `ws://localhost:9877` ← WebSocket server

**✅ Why this works**: Everything runs natively on Windows, no container limitations!

### Option 2: Hybrid (Windows AI + Docker Web Server)

**Step 1: Start AI engines on Windows**
```powershell
cd games-app
.\START_ALL_SERVERS.ps1
```

**Step 2: Run web server in Docker (optional)**
```powershell
# If you want to isolate the web server in a container
docker compose up -d
```

**⚠️ IMPORTANT**: With this setup:
- AI servers run on Windows (ports 9543-9545, 9877)
- Docker web server runs on port 9876 (nginx serving static files)
- Browser connects to both: Docker port for files, Windows ports for AI

### Option 2: All in Docker (Not Recommended)

The original `Dockerfile` tried to run everything in Linux containers, but that won't work because:
- AI engines are Windows `.exe` files
- Linux containers can't run Windows executables

## Configuration

### How Browser Connects to Services

The browser (running on Windows) connects to:
- **Web server**: `http://localhost:9876` (from Docker container)
- **AI servers**: `http://localhost:9543`, `localhost:9544`, etc. (directly on Windows)

No special networking needed! The browser can access both Docker-mapped ports and Windows localhost ports simultaneously.

## Current Setup

**✅ RECOMMENDED**: Use `START_ALL_SERVERS.ps1` - runs everything natively on Windows!

**Docker is OPTIONAL** - only use it if you want to isolate the web server:
- Web server in container (port 9876)
- AI engines on Windows (ports 9543-9545, 9877)
- More complex setup, but web server is isolated

**❌ DO NOT try to run AI servers in Docker** - Windows .exe files won't work!

## Benefits of Hybrid Approach

✅ **No Docker mode switching** - Keep Linux containers for all other repos  
✅ **Windows .exe files work** - Run natively on Windows  
✅ **Best performance** - No container overhead for AI engines  
✅ **Easy debugging** - Direct access to Windows processes  
✅ **Familiar pattern** - Same as Ollama/LM Studio setup  

## Troubleshooting

### Container can't connect to Windows services

**Not needed!** The browser connects directly to Windows services. The Docker container only serves static files.

### Port conflicts

If port 9876 is already in use by the Windows web server:
- Stop the Windows web server: `Get-Process python | Where-Object {$_.MainWindowTitle -like "*9876*"} | Stop-Process`
- Or use a different port in docker-compose.yml: `"9877:80"`

### AI engines not responding

Make sure the Windows-hosted servers are running:
```powershell
netstat -ano | findstr "9543 9544 9545"
```

## Summary

**For local development**: Use `START_ALL_SERVERS.ps1` (simplest)

**For deployment**: Use Docker for web server + Windows for AI engines (hybrid)

**For production**: Consider getting Linux builds of AI engines or use Windows Server with Windows containers

