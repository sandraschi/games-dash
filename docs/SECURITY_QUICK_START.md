# Security Quick Start Guide

## For Public Internet Access (Non-Tailscale Users)

### Step 1: Enable Security Middleware

Security middleware is **automatically enabled** when `security_middleware.py` is present. All AI servers include it by default.

**Verify security is active**:
```powershell
.\scripts\manage-security.ps1 -Action status -Port 10001
```

### Step 2: Configure Rate Limiting (Already Configured)

Default limits:
- **Move requests**: 30 per minute per IP
- **Status requests**: 120 per minute per IP

**Adjust if needed**: Edit `backend/security_middleware.py`

### Step 3: Choose Access Method

#### Option A: Cloudflare Tunnel (Recommended - Safest)
```powershell
# Install cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Create tunnel
cloudflared tunnel create games-ai

# Run tunnel (configure config.yml first)
cloudflared tunnel run games-ai
```

**Benefits**: No port forwarding, DDoS protection, SSL/TLS automatic

#### Option B: Direct Port Forwarding (Cautious)
```powershell
# 1. Enable firewall rules
New-NetFirewallRule -DisplayName "Games AI Stockfish" -Direction Inbound -LocalPort 10001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Games AI KataGo" -Direction Inbound -LocalPort 10002 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Games AI YaneuraOu" -Direction Inbound -LocalPort 10003 -Protocol TCP -Action Allow

# 2. Configure router port forwarding
# External ports → Internal IP:Ports (10001-10003)

# 3. Monitor security
.\scripts\manage-security.ps1 -Action status
```

**⚠️ Warning**: Requires careful security configuration. See `SECURITY_PUBLIC_ACCESS.md`

#### Option C: Reverse Proxy (Nginx)
See `SECURITY_PUBLIC_ACCESS.md` for Nginx configuration.

### Step 4: Enable Authentication (Optional but Recommended)

```powershell
# Enable authentication
.\scripts\manage-security.ps1 -Action enable-auth

# Generate API key for user
.\scripts\generate-api-key.ps1 -Email "player@example.com" -Name "Bangalore Player"

# Restart servers
.\scripts\ensure-ai-services.ps1 -ForceRestart
```

### Step 5: Monitor Security

```powershell
# Check security status
.\scripts\manage-security.ps1 -Action status

# View recent requests
.\scripts\manage-security.ps1 -Action stats

# Block malicious IP (manual)
.\scripts\manage-security.ps1 -Action block -IP 1.2.3.4
```

## Security Features Summary

✅ **Rate Limiting**: Automatic per-IP limits
✅ **Request Logging**: All requests logged
✅ **IP Blocking**: Manual blocking capability
✅ **Authentication**: Optional API key system
✅ **Request Size Limits**: 1MB max per request
✅ **Security Stats**: Real-time monitoring endpoint

## Quick Reference

| Task | Command |
|------|---------|
| Check security status | `.\scripts\manage-security.ps1 -Action status` |
| Generate API key | `.\scripts\generate-api-key.ps1 -Email "user@example.com"` |
| Enable authentication | `.\scripts\manage-security.ps1 -Action enable-auth` |
| View security stats | `.\scripts\manage-security.ps1 -Action stats` |
| Block IP | `.\scripts\manage-security.ps1 -Action block -IP 1.2.3.4` |

## Documentation

- **Complete Security Guide**: `docs/SECURITY_PUBLIC_ACCESS.md`
- **Remote Access Setup**: `docs/REMOTE_ACCESS_SETUP.md`
- **Architecture Analysis**: `docs/architecture/ARCHITECTURE_ANALYSIS.md`
