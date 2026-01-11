# Security Guide: Public Internet Access for AI Game Servers

## Critical Security Considerations

**WARNING**: Exposing game AI servers to the public internet requires careful security configuration. This guide provides cautious, production-ready approaches.

## Threat Model

### Risks of Public Exposure

1. **DDoS Attacks**: Malicious actors can flood servers with requests
2. **Resource Exhaustion**: CPU/memory exhaustion from excessive AI calculations
3. **Unauthorized Access**: Abuse of free AI services
4. **Data Exfiltration**: Attempts to extract game logic or AI models
5. **Port Scanning**: Automated discovery and exploitation attempts

### Mitigation Strategies

- ✅ Rate limiting per IP address
- ✅ Request size limits
- ✅ Authentication (optional but recommended)
- ✅ IP blocking capabilities
- ✅ Request logging and monitoring
- ✅ Reverse proxy with additional protection

---

## Option 1: Direct Port Forwarding (Cautious Approach)

### Security Configuration

#### 1. Firewall Rules (Windows)

```powershell
# Allow inbound on AI server ports (restrictive)
New-NetFirewallRule -DisplayName "Games AI Stockfish" `
    -Direction Inbound -LocalPort 10001 -Protocol TCP -Action Allow `
    -RemoteAddress Any -Profile Any

New-NetFirewallRule -DisplayName "Games AI KataGo" `
    -Direction Inbound -LocalPort 10002 -Protocol TCP -Action Allow `
    -RemoteAddress Any -Profile Any

New-NetFirewallRule -DisplayName "Games AI YaneuraOu" `
    -Direction Inbound -LocalPort 10003 -Protocol TCP -Action Allow `
    -RemoteAddress Any -Profile Any
```

**Security Note**: `-RemoteAddress Any` allows all IPs. For production, consider:
- Whitelist specific countries/IP ranges
- Use geolocation-based filtering
- Implement fail2ban-style IP blocking

#### 2. Router Port Forwarding

**Router Configuration** (varies by manufacturer):

1. **Access router admin panel** (usually `192.168.1.1`)
2. **Navigate to Port Forwarding/Virtual Server**
3. **Forward ports**:
   - External Port 10001 → Internal IP:Port 10001
   - External Port 10002 → Internal IP:Port 10002
   - External Port 10003 → Internal IP:Port 10003

**Security Recommendations**:
- Use non-standard external ports (e.g., 20101, 20102, 20103) to avoid automated scanning
- Enable router firewall logging
- Set up port forwarding only when needed (disable when not in use)
- Use router's built-in DDoS protection if available

#### 3. Rate Limiting Configuration

The `security_middleware.py` provides built-in rate limiting:

```python
RATE_LIMIT_CONFIG = {
    "move_requests": {
        "tokens_per_minute": 30,  # 30 moves per minute per IP
        "burst_size": 5,  # Allow 5 rapid requests
        "window_seconds": 60
    },
    "status_requests": {
        "tokens_per_minute": 120,  # Status checks more frequent
        "burst_size": 10,
        "window_seconds": 60
    }
}
```

**Adjust for Production**:
- Reduce `tokens_per_minute` for stricter limits
- Increase `burst_size` for legitimate users
- Monitor and adjust based on traffic patterns

#### 4. Enable Authentication (Recommended)

```powershell
# Set environment variable to enable auth
$env:AI_AUTH_ENABLED = "true"
$env:AI_API_KEY_SECRET = "your-secret-key-here"

# Restart AI servers
.\scripts\ensure-ai-services.ps1 -ForceRestart
```

**Generate API Keys**:
```python
from backend.auth_manager import auth_manager

# Create user
user = auth_manager.create_user("player@example.com", role="user")

# Generate API key
api_key = auth_manager.generate_api_key(user.user_id, name="Bangalore Player")
print(f"API Key: {api_key}")
```

---

## Option 2: Reverse Proxy (Safer - Recommended)

### Using Nginx as Reverse Proxy

**Benefits**:
- Additional DDoS protection
- SSL/TLS termination
- Request filtering
- IP whitelisting/blacklisting
- Rate limiting at proxy level

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/games-ai

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=ai_moves:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=ai_status:10m rate=120r/m;

# Upstream servers
upstream stockfish {
    server 127.0.0.1:10001;
}

upstream katago {
    server 127.0.0.1:10002;
}

upstream yaneuraou {
    server 127.0.0.1:10003;
}

# Stockfish server
server {
    listen 443 ssl http2;
    server_name stockfish.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Rate limiting
    limit_req zone=ai_moves burst=5 nodelay;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # IP whitelisting (optional)
    # allow 1.2.3.4;
    # deny all;
    
    location /api/ {
        proxy_pass http://stockfish;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}

# Similar configuration for KataGo and YaneuraOu...
```

**Security Features**:
- SSL/TLS encryption
- Rate limiting at proxy level
- IP-based access control
- Request size limits
- Timeout protection

---

## Option 3: Cloudflare Tunnel (Safest - Recommended for Production)

### Benefits

- ✅ No port forwarding required
- ✅ DDoS protection built-in
- ✅ SSL/TLS automatic
- ✅ IP masking (server IP hidden)
- ✅ Free tier available
- ✅ Analytics and monitoring

### Setup Steps

1. **Install Cloudflare Tunnel**:
   ```powershell
   # Download cloudflared
   # https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

2. **Authenticate**:
   ```powershell
   cloudflared tunnel login
   ```

3. **Create Tunnel**:
   ```powershell
   cloudflared tunnel create games-ai
   ```

4. **Configure Tunnel** (`config.yml`):
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: C:\Users\sandr\.cloudflared\<tunnel-id>.json

   ingress:
     - hostname: stockfish.yourdomain.com
       service: http://localhost:10001
     - hostname: katago.yourdomain.com
       service: http://localhost:10002
     - hostname: yaneuraou.yourdomain.com
       service: http://localhost:10003
     - service: http_status:404
   ```

5. **Run Tunnel**:
   ```powershell
   cloudflared tunnel run games-ai
   ```

**Security Features**:
- Automatic DDoS protection
- SSL/TLS termination
- IP masking
- Built-in rate limiting
- Analytics dashboard

---

## Option 4: Tailscale + Public Access (Hybrid)

### For Non-Tailnet Users

1. **Set up Tailscale for internal access**
2. **Use Cloudflare Tunnel or reverse proxy for public access**
3. **Different authentication for each**:
   - Tailscale users: No auth required (trusted network)
   - Public users: API key required

### Configuration

```python
# In security_middleware.py
def is_tailscale_ip(ip: str) -> bool:
    """Check if IP is from Tailscale network"""
    # Tailscale uses 100.x.x.x range
    return ip.startswith("100.")

# In middleware
if is_tailscale_ip(client_ip):
    # Skip rate limiting for Tailscale users
    pass
else:
    # Apply strict rate limiting for public users
    apply_rate_limit()
```

---

## Rate Limiting Details

### Current Configuration

**Move Requests** (`/api/move`):
- 30 requests per minute per IP
- Burst: 5 rapid requests allowed
- Window: 60 seconds

**Status Requests** (`/api/status`):
- 120 requests per minute per IP
- Burst: 10 rapid requests allowed
- Window: 60 seconds

### Adjusting Limits

Edit `backend/security_middleware.py`:

```python
RATE_LIMIT_CONFIG = {
    "move_requests": {
        "tokens_per_minute": 20,  # Stricter: 20 moves/min
        "burst_size": 3,  # Smaller burst
        "window_seconds": 60
    }
}
```

### Monitoring Rate Limits

```python
# Check security stats
import requests
response = requests.get("http://localhost:10001/api/security/stats")
print(response.json())
```

---

## Authentication Setup

### Enable Authentication

```powershell
# Set environment variables
$env:AI_AUTH_ENABLED = "true"
$env:AI_API_KEY_SECRET = "generate-with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
```

### Generate API Keys

```python
# Python script: generate_api_key.py
from backend.auth_manager import auth_manager

# Create user
user = auth_manager.create_user("bangalore.player@example.com", role="user")

# Generate API key
api_key = auth_manager.generate_api_key(
    user.user_id,
    name="Bangalore Player",
    expires_days=365
)

print(f"User ID: {user.user_id}")
print(f"API Key: {api_key}")
print(f"Save this key securely - it won't be shown again!")
```

### Using API Keys

**In Frontend** (`api-config.js`):
```javascript
// Add API key to requests
headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'gk_userid_keyid_signature'
}
```

**Or via URL parameter** (less secure):
```javascript
fetch(`${apiConfig.stockfishUrl}/api/move?api_key=YOUR_KEY`, {...})
```

---

## IP Blocking

### Manual Blocking

```python
from backend.security_middleware import block_ip, unblock_ip

# Block malicious IP
block_ip("1.2.3.4")

# Unblock IP
unblock_ip("1.2.3.4")
```

### Automatic Blocking (Future Enhancement)

Implement fail2ban-style blocking:
- Track failed requests
- Block IPs after N failed attempts
- Auto-unblock after timeout

---

## Monitoring and Logging

### Security Stats Endpoint

```bash
# Get security statistics
curl http://localhost:10001/api/security/stats
```

**Response**:
```json
{
    "total_requests": 1234,
    "blocked_ips": 5,
    "auth_enabled": true,
    "rate_limit_config": {...},
    "recent_requests": [...]
}
```

### Log Analysis

Request logs stored in `security_middleware.py`:
- Timestamp
- IP address
- Method and path
- Response status
- User agent
- User ID (if authenticated)

---

## Production Deployment Checklist

### Security Hardening

- [ ] Enable rate limiting
- [ ] Configure authentication (if required)
- [ ] Set up firewall rules
- [ ] Configure reverse proxy or Cloudflare Tunnel
- [ ] Enable SSL/TLS
- [ ] Set up monitoring and alerting
- [ ] Configure IP blocking
- [ ] Review and adjust rate limits
- [ ] Test DDoS protection
- [ ] Document incident response procedures

### Network Configuration

- [ ] Port forwarding configured (if using direct access)
- [ ] Firewall rules tested
- [ ] Router security enabled
- [ ] DNS configured (if using domain names)
- [ ] SSL certificates installed (if using HTTPS)

### Monitoring

- [ ] Set up request logging
- [ ] Configure alerting for suspicious activity
- [ ] Monitor rate limit violations
- [ ] Track blocked IPs
- [ ] Review logs regularly

---

## Recommendations by Use Case

### Development/Testing
- **Use**: Tailscale (easiest, secure)
- **No port forwarding needed**
- **No authentication required**

### Small Scale Production (< 100 users)
- **Use**: Cloudflare Tunnel (free tier)
- **Enable**: Rate limiting
- **Optional**: Authentication

### Medium Scale Production (100-1000 users)
- **Use**: Reverse proxy (Nginx) + Cloudflare
- **Enable**: Rate limiting + Authentication
- **Configure**: IP whitelisting for premium users

### Large Scale Production (1000+ users)
- **Use**: Load balancer + Multiple AI server instances
- **Enable**: All security features
- **Configure**: Advanced DDoS protection
- **Consider**: Cloud hosting with auto-scaling

---

## Safety Assessment: Direct Port Forwarding

### Risk Level: **MEDIUM** (with proper configuration)

**Acceptable if**:
- ✅ Rate limiting enabled
- ✅ Firewall configured
- ✅ Monitoring active
- ✅ Non-standard ports used
- ✅ Regular security reviews

**Not recommended if**:
- ❌ No rate limiting
- ❌ No monitoring
- ❌ Standard ports (10001-10003)
- ❌ No authentication
- ❌ High-value target

### Recommended Approach

**For Production**: Use **Cloudflare Tunnel** or **Reverse Proxy**
- Better security
- DDoS protection
- SSL/TLS automatic
- Easier management

**For Development**: Use **Tailscale**
- No port forwarding
- Secure by default
- Easy setup

---

## Incident Response

### If Under Attack

1. **Immediate Actions**:
   ```python
   # Block attacking IPs
   from security_middleware import block_ip
   block_ip("attacker_ip")
   ```

2. **Reduce Rate Limits**:
   ```python
   # Temporarily reduce limits
   RATE_LIMIT_CONFIG["move_requests"]["tokens_per_minute"] = 10
   ```

3. **Enable Authentication**:
   ```powershell
   $env:AI_AUTH_ENABLED = "true"
   # Restart servers
   ```

4. **Monitor Logs**:
   - Check `/api/security/stats`
   - Review request logs
   - Identify attack patterns

### Recovery Steps

1. Identify and block malicious IPs
2. Adjust rate limits based on attack pattern
3. Consider enabling authentication
4. Review and improve security configuration
5. Document incident for future prevention

---

## Conclusion

**Safest Approach**: Cloudflare Tunnel or Reverse Proxy
**Acceptable**: Direct port forwarding with rate limiting and monitoring
**Not Recommended**: Direct port forwarding without security measures

Always enable rate limiting and monitoring, regardless of access method.
