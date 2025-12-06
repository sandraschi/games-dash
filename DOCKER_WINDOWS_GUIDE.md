# Docker Setup for Windows Containers

## The Problem

The default `Dockerfile` uses Linux containers (`python:3.11-slim`), but the AI engines are Windows executables (`.exe` files). Linux containers **cannot** run Windows executables.

## Solution: Windows Containers

On Windows Pro, Docker Desktop supports **Windows containers** which can run Windows executables.

## Prerequisites

1. **Windows Pro/Enterprise/Education** (Home doesn't support Windows containers)
2. **Docker Desktop** installed
3. **Switch Docker Desktop to Windows containers mode**:
   - Right-click Docker Desktop icon in system tray
   - Select "Switch to Windows containers..."
   - Wait for Docker to restart (may take a minute)

## Usage

### Step 1: Verify Windows Containers Mode

```powershell
docker info | Select-String "OSType"
# Should show: OSType: windows
```

### Step 2: Build the Container

```powershell
cd games-app
docker compose -f docker-compose.windows.yml build
```

**Note**: First build will take 10-15 minutes (downloads Windows Server Core base image ~5GB)

### Step 3: Start Services

```powershell
docker compose -f docker-compose.windows.yml up -d
```

### Step 4: View Logs

```powershell
# All services
docker compose -f docker-compose.windows.yml logs -f

# Specific service
docker compose -f docker-compose.windows.yml logs -f games-app
```

### Step 5: Access the Games

Open browser: `http://localhost:9876`

### Step 6: Stop Services

```powershell
docker compose -f docker-compose.windows.yml down
```

## Container Details

The Windows container:
- Uses `mcr.microsoft.com/windows/servercore:ltsc2022` base image
- Installs Python 3.11 during build
- Runs all services via `start-services.ps1`:
  - Web server (port 9876)
  - Stockfish AI (port 9543)
  - Shogi AI (port 9544)
  - Go AI (port 9545)
  - Multiplayer WebSocket (port 9877)

## ⚠️ CRITICAL: Docker Mode Conflict

**Docker Desktop can only run ONE container type at a time:**
- **Linux containers** (default) - used by 30+ other repos
- **Windows containers** - required for games-app Windows .exe files

**If you switch to Windows containers:**
- ❌ All your other Dockerized repos will **STOP WORKING**
- ❌ You'll need to switch back to Linux containers for other projects
- ❌ This is annoying and error-prone

**Recommendation**: Use `START_ALL_SERVERS.ps1` for games-app instead of Docker.

## Important Notes

⚠️ **Windows containers are LARGE**:
- Base image: ~5GB
- Final image: ~7-8GB
- Requires significant disk space

⚠️ **Windows containers are SLOWER**:
- Startup: 30-60 seconds (vs 5 seconds for Linux)
- Build time: 10-15 minutes first time
- More RAM usage (~2GB vs ~500MB)

⚠️ **Resource Requirements**:
- Minimum 4GB RAM free
- 10GB+ free disk space
- Windows Pro/Enterprise/Education only

## Troubleshooting

### "OSType: linux" when checking docker info
- You're still in Linux containers mode
- Switch to Windows containers: Right-click Docker Desktop → "Switch to Windows containers..."

### Build fails with "python: command not found"
- Python installation in Dockerfile may have failed
- Check build logs: `docker compose -f docker-compose.windows.yml build --no-cache`

### Services start but can't connect
- Check ports aren't already in use: `netstat -ano | findstr "9876 9543 9544 9545 9877"`
- Check container logs: `docker compose -f docker-compose.windows.yml logs`

### Container exits immediately
- Check logs: `docker compose -f docker-compose.windows.yml logs`
- May be Python path issue or missing dependencies

## Alternative: Keep Using PowerShell Script

For local development, the `START_ALL_SERVERS.ps1` script is:
- ✅ Faster to start (5 seconds vs 60 seconds)
- ✅ Uses less resources (500MB vs 2GB RAM)
- ✅ Easier to debug (direct console output)
- ✅ Already working perfectly
- ✅ No Docker overhead

**Docker is only needed if:**
- Deploying to a Windows Server
- Sharing with others who don't have Python/engines set up
- Need consistent environment across machines
- Want isolation from host system

## Performance Comparison

| Method | Startup Time | RAM Usage | Disk Usage | Complexity |
|--------|-------------|-----------|------------|------------|
| PowerShell Script | 5 seconds | ~500MB | ~100MB | Low |
| Windows Container | 60 seconds | ~2GB | ~8GB | High |

**Recommendation**: Use `START_ALL_SERVERS.ps1` for local dev, Docker only if deploying or sharing.

