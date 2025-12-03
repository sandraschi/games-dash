# 🐳 Docker Setup Guide - Games Collection

**Date**: 2025-12-03  
**Purpose**: Run entire games collection in Docker containers!

---

## Quick Start (30 seconds!)

### Build and Run

```powershell
cd D:\Dev\repos\games-app

# Build (first time: ~2-3 minutes)
docker compose build

# Start
docker compose up -d

# Open browser
start http://localhost:9876
```

**DONE!** All 21 games + 4 AI engines running! 🎮

---

## What's Running

**Single Container** contains:
- **Nginx** (port 80 → 9876): Serves HTML/JS/CSS
- **Stockfish Server** (port 9543): Chess AI
- **YaneuraOu Server** (port 9544): Shogi AI
- **KataGo Server** (port 9545): Go AI

**Why Single Container?**
- Simpler management
- Faster startup
- All services need each other
- Uses supervisor to run multiple processes

---

## Common Commands

### Start/Stop

```powershell
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart after code changes
docker compose restart

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f games-app
```

### Rebuild After Changes

**Regular code changes** (CSS, JS, Python):
```powershell
docker compose down
docker compose build
docker compose up -d
```

**Only if dependencies changed** (requirements.txt):
```powershell
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## Accessing the App

**Main Menu**: http://localhost:9876  
**Dashboard**: http://localhost:9876/dashboard.html  
**Multiplayer**: http://localhost:9876/multiplayer.html  
**Chess**: http://localhost:9876/chess.html  

---

## Port Mapping

**Container → Host**:
- `80` → `9876` (Web UI)
- `9543` → `9543` (Stockfish)
- `9544` → `9544` (YaneuraOu)
- `9545` → `9545` (KataGo)

**Why 9876 for web?**
- Your requirement: No ports under 9000
- Your requirement: No ports ending in 00
- Avoids 8080 (Traefik container)

---

## Volume Persistence

**Persistent Data**:
- `stockfish-data` → AI engine files
- `yaneuraou-data` → Shogi engine files
- `katago-data` → Go engine files

**Why?**
- Preserves downloaded AI engines
- Faster rebuilds (don't re-download)
- Configuration persists

**View volumes**:
```powershell
docker volume ls | Select-String "games-app"
```

---

## Health Checks

Container monitors its own health:
- Checks nginx every 30 seconds
- Auto-restarts if unhealthy
- Status: `docker ps` (shows "healthy")

```powershell
# Check container health
docker inspect games-collection --format='{{.State.Health.Status}}'
```

---

## Development Workflow

### Making Changes

1. **Edit files** (HTML, JS, CSS, Python)
2. **Rebuild**:
   ```powershell
   docker compose down
   docker compose build
   docker compose up -d
   ```
3. **Refresh browser**
4. **Test!**

**Fast rebuild**: ~5-10 seconds (cached layers)

### Debugging

**View all logs**:
```powershell
docker compose logs -f
```

**Shell into container**:
```powershell
docker exec -it games-collection bash
```

**Check specific service**:
```powershell
# See supervisor status
docker exec games-collection supervisorctl status
```

---

## Production Deployment

### Option 1: Docker on Server

```powershell
# On your server (Goliath?)
git clone <repo>
cd games-app
docker compose up -d
```

**Access**: `http://goliath:9876` (via Tailscale!)

### Option 2: Traefik Integration

Add labels to `docker-compose.yml`:

```yaml
services:
  games-app:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.games.rule=Host(`games.goliath.local`)"
      - "traefik.http.services.games.loadbalancer.server.port=80"
```

**Access**: `http://games.goliath.local`

### Option 3: Behind Reverse Proxy

**Nginx proxy**:
```nginx
location /games/ {
    proxy_pass http://localhost:9876/;
    proxy_set_header Host $host;
}
```

---

## Resource Usage

**Expected**:
- **CPU**: 2-5% idle, 20-40% during AI calculations
- **RAM**: ~500 MB total
- **Disk**: ~200 MB

**AI engines are CPU-intensive!**
- Stockfish: Can use 100% CPU at max depth
- KataGo: Similar
- YaneuraOu: Similar

**Your 24-core AMD**: No problem! 💪

---

## Troubleshooting

### Container won't start

```powershell
# Check logs
docker compose logs

# Check specific error
docker compose up
```

### Port already in use

```powershell
# Check what's using port 9876
netstat -ano | Select-String "9876"

# Kill process (if needed)
Stop-Process -Id <PID> -Force
```

### AI engines not responding

```powershell
# Check if servers running
docker exec games-collection supervisorctl status

# Restart specific service
docker exec games-collection supervisorctl restart stockfish-server
```

### Changes not appearing

```powershell
# Hard rebuild
docker compose down
docker compose build --no-cache
docker compose up -d

# Clear browser cache
# Ctrl+Shift+R (hard refresh)
```

---

## Backup & Restore

### Backup

```powershell
# Backup volumes
docker run --rm -v games-app_stockfish-data:/data -v D:/backups:/backup alpine tar czf /backup/stockfish-backup.tar.gz -C /data .
```

### Restore

```powershell
# Restore volumes
docker run --rm -v games-app_stockfish-data:/data -v D:/backups:/backup alpine tar xzf /backup/stockfish-backup.tar.gz -C /data
```

---

## Why Docker?

**Benefits**:
- ✅ One command to start everything
- ✅ Consistent environment
- ✅ Easy deployment to servers
- ✅ Isolated from host system
- ✅ No Python version conflicts
- ✅ Fast rebuilds (layer caching)
- ✅ Health monitoring
- ✅ Auto-restart on crash

**Your Setup**:
- AMD 24-core server: Perfect for Docker!
- 30TB storage: Plenty of space
- RTX 4090: Available to containers if needed
- Tailscale: Access from anywhere!

---

## Playing with Steve

**Steve's access** (after Firebase setup):

**Option A**: Direct port (if firewall open)
```
http://goliath.tailscale.ip:9876
```

**Option B**: Traefik (cleaner)
```
http://games.goliath.local
```

**Option C**: Public deployment
```
Deploy to cloud, give Steve URL
```

---

## Next Steps

1. **Build**: `docker compose build`
2. **Run**: `docker compose up -d`
3. **Test**: http://localhost:9876
4. **Play**: Challenge yourself to chess!
5. **Setup Firebase**: Add multiplayer
6. **Share with Steve**: Send him the URL!

---

**Dockerization COMPLETE!** 🐳✅

**Created by**: Sandra Schipal  
**For**: Easy deployment and sharing with Steve!  
**Server**: Your mighty Goliath (24-core beast!)

