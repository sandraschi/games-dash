# Docker Hybrid Setup Guide

## Architecture

**Hybrid approach** - Best of both worlds:
- ✅ **Linux container**: Web server (serves HTML/JS/CSS)
- ✅ **Windows host**: AI engines (Stockfish, YaneuraOu, KataGo) + Python servers
- ✅ **No mode switching**: Keep Docker Desktop in Linux containers mode

This is similar to how Ollama/LM Studio work - they run on Windows, and Docker containers connect to them.

## How It Works

```
┌─────────────────────────────────────┐
│  Docker Desktop (Linux Containers)  │
│  ┌───────────────────────────────┐  │
│  │  games-collection-web         │  │
│  │  (nginx - serves static files)│  │
│  │  Port: 9876                   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              │
              │ HTTP requests
              ▼
┌─────────────────────────────────────┐
│  Windows Host                       │
│  ┌───────────────────────────────┐  │
│  │  web-server.py (port 9876)    │  │
│  │  stockfish-server.py (9543)   │  │
│  │  shogi-server.py (9544)       │  │
│  │  go-server.py (9545)          │  │
│  │  multiplayer-server.py (9877) │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  stockfish-windows-x86-64.exe │  │
│  │  YaneuraOu-Deep-ORT-CPU.exe   │  │
│  │  katago.exe                   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Setup

### Option 1: Docker + PowerShell Script (Recommended)

**Step 1: Start AI engines on Windows**
```powershell
cd games-app
.\START_ALL_SERVERS.ps1
```

This starts:
- Web server: `http://localhost:9876`
- Stockfish AI: `http://localhost:9543`
- Shogi AI: `http://localhost:9544`
- Go AI: `http://localhost:9545`
- Multiplayer: `ws://localhost:9877`

**Step 2: (Optional) Run web server in Docker**

If you want to use Docker for the web server:
```powershell
docker compose up -d
```

Access: `http://localhost:9876`

**Note**: The Docker container serves static files, but the AI engines still run on Windows. The web server in the container can connect to Windows-hosted services via `host.docker.internal` or by using `network_mode: host`.

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

**Recommended**: Just use `START_ALL_SERVERS.ps1` - it's simpler and works perfectly.

**Docker is optional** - only use it if you want:
- Consistent web server environment
- Easy deployment
- Isolation of static file serving

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

