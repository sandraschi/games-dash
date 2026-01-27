# Docker Setup for Games Collection

**Timestamp**: 2025-01-27

## Architecture Overview

The Games Collection uses a **hybrid Docker + Windows host** architecture:

```
Docker Containers (Linux):
├── games-collection-web (Nginx + Python APIs)
└── stockfish-engine (Stockfish chess engine in Docker)

Windows Host (Native):
├── KataGo (Go engine) - Port 11545
└── YaneuraOu (Shogi engine) - Port 11544
```

### Why Hybrid?

- **Stockfish**: Cross-platform C++ engine, runs perfectly in Linux Docker containers
- **KataGo**: Windows .exe with GPU dependencies, must run on Windows host
- **YaneuraOu**: Windows .exe, must run on Windows host

## Quick Start

### 1. Start Docker Services

```powershell
cd D:\Dev\repos\games-app
docker compose up -d
```

This starts:
- Web server on port `11876`
- Stockfish engine on port `9543` (internal, proxied through web server)

### 2. Start Windows AI Engines (Optional)

If you want KataGo and YaneuraOu support, start them on Windows host:

```powershell
# Start KataGo (if available)
.\backend\go-server.py --port 11545

# Start YaneuraOu (if available)  
.\backend\shogi-server.py --port 11544
```

The Docker web server will automatically proxy to these Windows services via `host.docker.internal`.

## Services

### games-collection-web

- **Port**: `11876` (mapped from container port 80)
- **Purpose**: Serves web UI, games, and proxies API requests
- **Dependencies**: Stockfish engine container
- **Access**: http://localhost:11876

### stockfish-engine

- **Port**: `9543` (internal, not exposed to host)
- **Purpose**: Runs Stockfish chess engine in Linux container
- **Build**: Compiles Stockfish from source during Docker build
- **Access**: Via web server proxy at `/api/stockfish/`

## Docker Compose Configuration

Key features:
- **Networks**: All services on `games-network` bridge network
- **Health Checks**: Automatic health monitoring for all services
- **Volumes**: Code mounted as read-only, data directory as read-write
- **Restart Policy**: `unless-stopped` for automatic recovery

## Building

### Full Rebuild

```powershell
docker compose build --no-cache
docker compose up -d
```

### Rebuild Single Service

```powershell
docker compose build stockfish-engine
docker compose up -d stockfish-engine
```

## Troubleshooting

### Stockfish Not Working

1. Check container logs:
   ```powershell
   docker compose logs stockfish-engine
   ```

2. Verify Stockfish binary exists:
   ```powershell
   docker compose exec stockfish-engine ls -la /app/stockfish/src/stockfish
   ```

3. Test Stockfish API:
   ```powershell
   curl http://localhost:11876/api/stockfish/api/status
   ```

### KataGo/YaneuraOu Not Accessible

1. Ensure Windows services are running on correct ports:
   - KataGo: `11545`
   - YaneuraOu: `11544`

2. Test from container:
   ```powershell
   docker compose exec games-collection-web curl http://host.docker.internal:11545/api/status
   ```

3. Check Windows firewall allows connections

### Port Conflicts

If ports are already in use:

1. Check what's using the port:
   ```powershell
   netstat -ano | findstr :11876
   netstat -ano | findstr :9543
   ```

2. Modify `docker-compose.yml` to use different ports

## Development

### Hot Reload

Code is mounted as read-only volume, so changes to Python files require container restart:

```powershell
docker compose restart games-collection-web
```

### Viewing Logs

```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f stockfish-engine
docker compose logs -f games-collection-web
```

### Accessing Containers

```powershell
# Shell into web container
docker compose exec games-collection-web /bin/bash

# Shell into Stockfish container
docker compose exec stockfish-engine /bin/bash
```

## Production Considerations

1. **Security**: Expose only necessary ports (currently `11876` for web)
2. **Performance**: Stockfish container uses optimized build with AVX2
3. **Scaling**: Can run multiple Stockfish instances behind load balancer
4. **Monitoring**: Health checks configured for all services

## File Structure

```
games-app/
├── docker-compose.yml          # Main orchestration
├── Dockerfile.linux             # Web server container
├── Dockerfile.stockfish         # Stockfish engine container
├── backend/
│   ├── stockfish-server.py     # Stockfish API server
│   └── ...
└── stockfish/                  # Stockfish source code
    └── src/
        └── Makefile            # Build configuration
```

## Notes

- Stockfish is built from source during Docker build (takes ~2-5 minutes). Standardized on `ARCH=x86-64-modern` for container compatibility.
- KataGo and YaneuraOu remain on Windows host due to platform-specific dependencies
- All AI engines are accessible through unified API via web server proxy
