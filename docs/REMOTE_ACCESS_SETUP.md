# Remote Access Setup for Competitive Play

## Critical Requirement

**AI play MUST work for remote players (iPad, iPhone, Bangalore) or this remains a hobby project.**

KataGo for remote competitive play IS new functionality that must be accessible worldwide. Same requirement applies to competitive play features.

## Security Notice

**IMPORTANT**: This guide covers public internet access. For production use, see `SECURITY_PUBLIC_ACCESS.md` for:
- Rate limiting configuration
- Authentication setup
- Port forwarding safety analysis
- Alternative secure methods (Cloudflare Tunnel, reverse proxy)

## Port Configuration

### AI Servers (Must be accessible remotely)
- **Stockfish (Chess)**: Port 10001
- **KataGo (Go)**: Port 10002  
- **YaneuraOu (Shogi)**: Port 10003

### Other Services
- **Web Server**: Port 9876
- **Multiplayer**: Port 9877
- **Audio Server**: Port 11879

## Network Setup

### Option 1: Tailscale/VPN Access (Easiest, Secure)

**Best for**: Development, trusted users, small deployments

1. **Ensure AI servers bind to all interfaces**:
   - All AI servers use `host="0.0.0.0"` (already configured)
   - This allows connections from any network interface

2. **Port Forwarding** (if using router/NAT):
   - Forward ports 10001-10003 to your server's internal IP
   - Forward port 9876 for web access
   - Forward port 9877 for multiplayer

### Option 2: Public Internet Access (Requires Security)

**Best for**: Production, non-Tailscale users, worldwide access

**⚠️ SECURITY REQUIRED**: See `SECURITY_PUBLIC_ACCESS.md` for:
- Rate limiting setup
- Authentication configuration
- Port forwarding safety analysis
- Cloudflare Tunnel (recommended)
- Reverse proxy setup

#### Basic Firewall Configuration

```powershell
# Windows Firewall - Allow inbound on AI server ports
# WARNING: This exposes servers to public internet - enable security middleware first!
New-NetFirewallRule -DisplayName "Games AI Stockfish" -Direction Inbound -LocalPort 10001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Games AI KataGo" -Direction Inbound -LocalPort 10002 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Games AI YaneuraOu" -Direction Inbound -LocalPort 10003 -Protocol TCP -Action Allow
```

**Before enabling public access**:
1. ✅ Enable rate limiting (automatic with security_middleware.py)
2. ✅ Configure authentication (optional but recommended)
3. ✅ Set up monitoring
4. ✅ Review `SECURITY_PUBLIC_ACCESS.md`

4. **Tailscale Setup**:
   - Install Tailscale on server and client devices
   - Ensure server is accessible via Tailscale IP
   - iPad/iPhone clients connect via Tailscale IP (e.g., `100.x.x.x:10002`)

## Process Management (24/7 Availability)

### Using ensure-ai-services.ps1

The `scripts/ensure-ai-services.ps1` script monitors and auto-restarts AI servers:

```powershell
# Start monitoring (runs continuously)
.\scripts\ensure-ai-services.ps1

# Check status
.\scripts\ensure-ai-services.ps1 -Status

# Force restart all services
.\scripts\ensure-ai-services.ps1 -ForceRestart

# Install as Windows Service (requires NSSM)
.\scripts\ensure-ai-services.ps1 -Install
```

### Manual Service Installation

For 24/7 operation, install as Windows Service using NSSM:

1. Download NSSM: https://nssm.cc/download
2. Install service:
   ```powershell
   .\scripts\ensure-ai-services.ps1 -Install
   ```

## Testing Remote Access

### From iPad/iPhone

1. **Connect via Tailscale** (recommended):
   - Open Safari/Chrome
   - Navigate to `http://[tailscale-ip]:9876`
   - Play Go/Chess/Shogi - AI should work automatically

2. **Verify AI Connectivity**:
   - Open browser console (Safari: Develop > Show JavaScript Console)
   - Check for `api-config.js` logs showing remote detection
   - Verify API calls to ports 10001-10003 succeed

### From Bangalore/Remote Location

1. **Get server's public IP or Tailscale IP**
2. **Test connectivity**:
   ```bash
   # Test web server
   curl http://[server-ip]:9876
   
   # Test Stockfish AI
   curl http://[server-ip]:10001/api/status
   
   # Test KataGo AI
   curl http://[server-ip]:10002/api/status
   
   # Test YaneuraOu AI
   curl http://[server-ip]:10003/api/status
   ```

3. **Expected Response**:
   ```json
   {
     "status": "online",
     "engine": "Simple Stockfish",
     "version": "Testing Mode"
   }
   ```

## API Configuration

The frontend uses `api-config.js` to automatically detect local vs remote access:

- **Local**: Uses `localhost` for AI servers
- **Remote**: Uses current hostname (works with Tailscale/VPN)
- **Auto-detection**: Checks for Tailscale domains, IP addresses, etc.

### Manual Override

If auto-detection fails, you can override the AI server host:

```javascript
// In browser console or HTML
window.AI_SERVER_HOST = 'your-server-ip-or-domain';
```

## Troubleshooting

### AI Servers Not Accessible Remotely

1. **Check if servers are running**:
   ```powershell
   .\scripts\ensure-ai-services.ps1 -Status
   ```

2. **Check firewall**:
   ```powershell
   Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Games AI*"}
   ```

3. **Check port binding**:
   ```powershell
   Get-NetTCPConnection -LocalPort 10001,10002,10003 | Select-Object LocalPort,State,OwningProcess
   ```

4. **Test from remote device**:
   - Use browser's developer tools network tab
   - Check for CORS errors
   - Verify API endpoints return 200 OK

### CORS Errors

All AI servers are configured with CORS headers:
```python
cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
        allow_methods="*",
    )
})
```

If you see CORS errors, verify:
1. Server is binding to `0.0.0.0` (not `127.0.0.1`)
2. CORS middleware is properly configured
3. Request includes proper headers

### Connection Timeouts

If remote players experience timeouts:

1. **Check network latency**: Use `ping` or `traceroute`
2. **Increase timeout values**: In `api-config.js`, timeout is 10 seconds
3. **Check server resources**: AI servers may be overloaded
4. **Verify port forwarding**: Ensure router forwards ports correctly

## Competitive Play Requirements

For competitive play to work remotely:

1. **24/7 Uptime**: AI servers must be available continuously
2. **Low Latency**: <2 second response time for AI moves
3. **Reliable Connectivity**: No frequent disconnections
4. **Process Monitoring**: Auto-restart on crashes
5. **Health Checks**: Regular connectivity verification

## Success Criteria

Remote access is working correctly when:

- ✅ iPad/iPhone can connect to web server (port 9876)
- ✅ AI moves work in Go/Chess/Shogi games
- ✅ No CORS errors in browser console
- ✅ API status endpoints return 200 OK
- ✅ Competitive play works for Bangalore players
- ✅ Services auto-restart on crash
- ✅ 24/7 availability maintained

## Next Steps

1. Deploy `ensure-ai-services.ps1` for monitoring
2. Install as Windows Service for 24/7 operation
3. Test from iPad/iPhone via Tailscale
4. Verify competitive play works for remote players
5. Monitor uptime and response times
