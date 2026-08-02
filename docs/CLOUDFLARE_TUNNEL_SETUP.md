# Cloudflare Tunnel Setup for AI Games Collection

## Quick Tunnel (No Account Required)

Perfect for testing iPad access without port forwarding!

### 1. Install cloudflared

**Windows:**
```powershell
# Download and install
winget install --id Cloudflare.cloudflared
# OR
choco install cloudflared
```

**Manual Download:**
```powershell
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
# Extract cloudflared.exe to a folder in PATH
```

### 2. Start Tunnel

```powershell
cd D:\Dev\repos\ai-games-collection

# Create tunnel to web server (includes all AI endpoints via reverse proxy)
cloudflared tunnel --url http://localhost:9876
```

### 3. Get Your URL

**Example output:**
```
2026-01-10T14:15:00Z INF Starting tunnel tunnelID=abc123
2026-01-10T14:15:00Z INF Version 2023.8.2
2026-01-10T14:15:00Z INF GOOS: windows, GOVersion: go1.20.6, GOARCH: amd64
2026-01-10T14:15:00Z INF Settings: map[url:http://localhost:9876]
2026-01-10T14:15:00Z INF Generated Connector ID: def456
2026-01-10T14:15:00Z INF Initial protocol h2mux
2026-01-10T14:15:00Z INF Starting metrics server on 127.0.0.1:0/metrics
2026-01-10T14:15:00Z INF Connection established connIndex=0 location=LHR
2026-01-10T14:15:00Z INF Each HA connection's client ID is def456
2026-01-10T14:15:00Z INF Added Cloudflare Access rule for this connector
2026-01-10T14:15:00Z INF Uptime: 3s
2026-01-10T14:15:00Z INF WebSocket TCP forwarding for this connector enabled
2026-01-10T14:15:00Z INF Started tunnel tunnelID=abc123
2026-01-10T14:15:00Z INF Registered tunnel connection connIndex=0
2026-01-10T14:15:00Z INF Your quick Tunnel has been created!
2026-01-10T14:15:00Z INF You can use the following URL to access your local server:
https://random-name.trycloudflare.com
```

### 4. Test Your iPad Access

**Your iPad URL:** `https://random-name.trycloudflare.com/games/chess.html`

**How it works:**
- Cloudflare creates a secure tunnel from your local server to their edge
- All traffic goes through HTTPS (secure!)
- No port forwarding needed
- AI servers accessible via the same tunnel

### 5. Stop Tunnel

Press `Ctrl+C` in the PowerShell window to stop the tunnel.

## Full Cloudflare Account Setup

For permanent/production access with custom domain:

1. **Create free Cloudflare account**
2. **Add your domain** to Cloudflare
3. **Install cloudflared** (same as above)
4. **Create tunnel:**
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create ai-games-collection
   cloudflared tunnel route dns ai-games-collection games.yourdomain.com
   cloudflared tunnel run ai-games-collection --url http://localhost:9876
   ```

## Security Benefits

✅ **No open ports** on your router/firewall
✅ **HTTPS everywhere** - traffic encrypted end-to-end
✅ **Cloudflare protection** - DDoS protection, bot blocking
✅ **Access controls** possible with Cloudflare Access

## For AI Games Collection Testing

This is **perfect** for your iPad testing because:
- ✅ **Zero router configuration** required
- ✅ **Secure HTTPS access** from anywhere
- ✅ **All AI servers accessible** through the same tunnel
- ✅ **No cost** for testing/development

**Ready to test!** Just run `cloudflared tunnel --url http://localhost:9876` and use the generated URL on your iPad.
