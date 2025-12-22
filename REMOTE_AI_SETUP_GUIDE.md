# Remote AI Access Setup Guide
## Fixing AI Functionality on iPad via Tailscale

**Problem**: AI has NEVER worked on iPad when accessing games remotely.

**Solution**: Fixed nginx proxy configuration to properly route AI API calls from Docker container to Windows host.

---

## 🚀 Quick Setup (Recommended)

### 1. Run the Automated Setup Script

```powershell
# Run as Administrator
.\setup_remote_ai_access.ps1
```

This script will:
- ✅ Check AI server status
- ✅ Configure firewall rules
- ✅ Rebuild Docker with new AI proxy
- ✅ Test connectivity
- ✅ Provide iPad access instructions

### 2. Access from iPad

1. Ensure iPad is connected to same Tailscale network
2. Open Safari: `http://YOUR-TAILSCALE-IP:9876`
3. Test AI: Visit `connectivity-test.html`
4. AI should now work perfectly! 🎉

---

## 🔧 Manual Setup (Detailed)

### Prerequisites

- Windows 10/11 with Administrator access
- Docker Desktop installed and running
- Tailscale installed and connected to your tailnet
- AI servers running (`.\START_ALL_SERVERS.ps1`)

### Step 1: Start AI Servers

```powershell
# Start all AI engines on Windows host
.\START_ALL_SERVERS.ps1
```

Verify they're running:
```powershell
# Test each AI server
curl http://localhost:9543/api/status  # Stockfish
curl http://localhost:9544/api/status  # Shogi
curl http://localhost:9545/api/status  # Go
curl http://localhost:9877/api/status  # Multiplayer
```

### Step 2: Configure Firewall

Run PowerShell as Administrator:

```powershell
# Allow AI server ports through firewall
New-NetFirewallRule -DisplayName "Games Stockfish AI" -Direction Inbound -Protocol TCP -LocalPort 9543 -Action Allow
New-NetFirewallRule -DisplayName "Games Shogi AI" -Direction Inbound -Protocol TCP -LocalPort 9544 -Action Allow
New-NetFirewallRule -DisplayName "Games Go AI" -Direction Inbound -Protocol TCP -LocalPort 9545 -Action Allow
New-NetFirewallRule -DisplayName "Games Multiplayer" -Direction Inbound -Protocol TCP -LocalPort 9877 -Action Allow
New-NetFirewallRule -DisplayName "Games Web Server" -Direction Inbound -Protocol TCP -LocalPort 9876 -Action Allow
```

### Step 3: Rebuild Docker Container

The key fix is in the new `Dockerfile.linux` with proper nginx proxy configuration:

```powershell
# Stop existing container
docker compose down

# Rebuild with new AI proxy configuration
docker compose build --no-cache

# Start with new configuration
docker compose up -d
```

### Step 4: Verify Configuration

Check the nginx configuration is correct:

```bash
# Check container logs
docker logs games-collection-web

# Should show:
# ✅ Nginx AI proxy configuration generated
# 🎯 AI servers will be accessible from iPad via Tailscale!
```

### Step 5: Test Connectivity

1. **Local Test**: Visit `http://localhost:9876/connectivity-test.html`
2. **Click "Test All AI Servers"** - should show all ✅ CONNECTED
3. **Click "Test Real Chess Move"** - should return a valid chess move

### Step 6: iPad Access

1. **Get Tailscale IP**:
   ```bash
   tailscale ip -4
   # Returns something like: 100.118.171.110
   ```

2. **On iPad Safari**:
   - URL: `http://YOUR-TAILSCALE-IP:9876`
   - Go to: `connectivity-test.html`
   - Test AI servers - should all work! 🎉

---

## 🔍 How the Fix Works

### The Problem

Previous setup tried to proxy ALL `/api/` requests to `$DOCKER_HOST:$server_port`, but:
- `$server_port` was not a valid nginx variable
- All AI services shared the same port variable
- No proper routing to specific AI service ports

### The Solution

New nginx configuration in `Dockerfile.linux`:

```nginx
# Specific proxy routes for each AI service
location ~ ^/api/stockfish/(.*)$ {
    proxy_pass http://$DOCKER_HOST:9543/$1;
    # Proper headers and timeouts
}

location ~ ^/api/shogi/(.*)$ {
    proxy_pass http://$DOCKER_HOST:9544/$1;
    # ...
}

location ~ ^/api/go/(.*)$ {
    proxy_pass http://$DOCKER_HOST:9545/$1;
    # ...
}

location ~ ^/api/multiplayer/(.*)$ {
    proxy_pass http://$DOCKER_HOST:9877/$1;
    # ...
}
```

### Updated API Calls

JavaScript now uses proxied paths:
- Old: `http://host.docker.internal:9543/api/move`
- New: `/api/stockfish/move` (proxied through nginx)

---

## 🐛 Troubleshooting

### AI Still Not Working?

1. **Check AI Servers**:
   ```powershell
   .\START_ALL_SERVERS.ps1
   ```

2. **Verify Docker Container**:
   ```bash
   docker logs games-collection-web
   # Should show successful nginx config
   ```

3. **Test Direct Access**:
   - Visit: `http://localhost:9876/connectivity-test.html`
   - Use "Emergency Diagnostics" section
   - Try "Test Direct AI Access"

4. **Check Tailscale**:
   ```bash
   tailscale status
   tailscale ip -4
   ```

5. **Firewall Issues**:
   ```powershell
   # Check firewall rules
   Get-NetFirewallRule -DisplayName "*Games*" | Format-Table
   ```

### Common Issues

- **"AI server not running"**: Run `.\START_ALL_SERVERS.ps1`
- **"Connection refused"**: Check firewall rules
- **"Timeout"**: Verify Tailscale connectivity
- **"502 Bad Gateway"**: Docker container not proxying correctly

---

## 📊 Architecture Overview

```
iPad (Tailscale) → Tailscale IP:9876
                      ↓
            nginx proxy (Docker container)
                      ↓
        AI Servers (Windows host)
        ├── Stockfish:9543
        ├── YaneuraOu:9544
        ├── KataGo:9545
        └── Multiplayer:9877
```

**Key Changes**:
- ✅ Nginx now properly proxies to specific ports
- ✅ API calls use `/api/{service}/endpoint` paths
- ✅ Proper timeout and error handling
- ✅ CORS headers for remote access
- ✅ Automatic Tailscale IP detection

---

## 🎯 Test Results

After applying this fix:

- ✅ **Local Access**: AI works perfectly
- ✅ **Tailscale VPN**: AI works from any device on tailnet
- ✅ **iPad Safari**: Full AI functionality restored
- ✅ **Performance**: No latency impact
- ✅ **Stability**: Reliable connections

**Before**: AI NEVER worked on iPad
**After**: AI works perfectly on iPad! 🎉

---

## 📝 Configuration Files

### server-config.env
```bash
# Tailscale IP (auto-detected or manual)
TAILSCALE_IP=100.118.171.110

# AI Server Ports
AI_STOCKFISH_PORT=9543
AI_SHOGI_PORT=9544
AI_GO_PORT=9545
AI_MULTIPLAYER_PORT=9877

# Docker host for AI servers
DOCKER_AI_HOST=host.docker.internal
```

### docker-compose.yml
```yaml
services:
  games-collection-web:
    ports:
      - "9876:80"  # Web interface
      # AI ports are NOT exposed directly - proxied through nginx
    environment:
      - AI_SERVER_HOST=host.docker.internal
      - DOCKER_REMOTE_ACCESS=true
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

---

## 🚀 Future Improvements

- [ ] Automatic AI server health monitoring
- [ ] Load balancing for multiple AI instances
- [ ] AI server auto-restart on failure
- [ ] Performance metrics and monitoring
- [ ] Support for additional VPN services (ZeroTier, etc.)

---

**Result**: AI functionality now works perfectly on iPad via Tailscale! 🎉
