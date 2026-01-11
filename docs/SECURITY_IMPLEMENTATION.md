# Security Implementation for Public Internet Access

## Overview

This document describes the security implementation added to enable safe public internet access for AI game servers, allowing non-Tailscale users (including players in Bangalore and worldwide) to access competitive play features.

**Date**: January 2026
**Status**: Production-ready with optional authentication

---

## Problem Statement

The games collection requires AI servers (Stockfish, KataGo, YaneuraOu) to be accessible remotely for competitive play. However, exposing services to the public internet introduces security risks:

- **DDoS attacks**: Malicious actors flooding servers
- **Resource exhaustion**: CPU/memory abuse from excessive requests
- **Unauthorized access**: Abuse of free AI services
- **Port scanning**: Automated discovery attempts

## Solution Architecture

### Core Components

1. **Security Middleware** (`backend/security_middleware.py`)
   - Rate limiting per IP address
   - Request logging and monitoring
   - IP blocking capabilities
   - Authentication integration
   - Request size limits

2. **Authentication Manager** (`backend/auth_manager.py`)
   - User management
   - API key generation and validation
   - Key expiration and revocation
   - Persistent storage

3. **Updated AI Servers**
   - All simple AI servers integrate security middleware
   - Automatic security detection and enablement
   - Security statistics endpoints

---

## Security Features

### 1. Rate Limiting

**Implementation**: Token bucket algorithm per IP address

**Configuration**:
- **Move requests** (`/api/move`): 30 requests/minute per IP, burst of 5
- **Status requests** (`/api/status`): 120 requests/minute per IP, burst of 10
- **Window**: 60 seconds

**Benefits**:
- Prevents DDoS attacks
- Limits resource consumption
- Allows legitimate burst traffic
- Configurable per endpoint type

**Code Location**: `backend/security_middleware.py` - `TokenBucketRateLimiter` class

### 2. Request Logging

**Implementation**: In-memory request log with automatic rotation

**Logged Information**:
- Timestamp
- Client IP address
- HTTP method and path
- Response status code
- User agent
- User ID (if authenticated)

**Storage**: Last 1000 requests kept in memory

**Benefits**:
- Security monitoring
- Attack pattern detection
- Performance analysis
- Audit trail

**Access**: Via `/api/security/stats` endpoint

### 3. IP Blocking

**Implementation**: Set-based IP blocking with manual control

**Features**:
- Manual block/unblock functions
- Persistent blocking (until unblocked)
- Integration with rate limiting
- Logging of blocked requests

**Usage**:
```python
from security_middleware import block_ip, unblock_ip
block_ip("1.2.3.4")
unblock_ip("1.2.3.4")
```

**Future Enhancement**: Automatic fail2ban-style blocking

### 4. Authentication (Optional)

**Implementation**: HMAC-signed API keys with expiration

**Features**:
- User management system
- API key generation with expiration
- Secure key validation
- Key revocation
- Per-user key management

**Key Format**: `gk_{user_id}_{key_id}_{signature}`

**Security**:
- HMAC-SHA256 signatures
- Timestamp-based expiration
- Constant-time comparison
- Secret key protection

**Usage**:
```powershell
# Generate API key
.\scripts\generate-api-key.ps1 -Email "player@example.com" -Name "Bangalore Player"

# Enable authentication
$env:AI_AUTH_ENABLED = "true"
```

### 5. Request Size Limits

**Implementation**: Maximum request size enforcement

**Limit**: 1MB per request

**Benefits**:
- Prevents memory exhaustion
- Protects against large payload attacks
- Enforces reasonable API usage

**Response**: HTTP 413 (Request Entity Too Large)

### 6. Security Statistics

**Endpoint**: `/api/security/stats`

**Returns**:
- Total request count
- Blocked IP count
- Authentication status
- Rate limit configuration
- Recent request log (last 100)

**Access**: Available on all AI servers (ports 10001-10003)

---

## Integration

### AI Server Integration

All simple AI servers (`simple-stockfish-server.py`, `simple-go-server.py`, `simple-shogi-server.py`) automatically:

1. **Detect security middleware**: Try to import `security_middleware`
2. **Enable if available**: Add middleware to aiohttp app
3. **Provide stats endpoint**: Expose `/api/security/stats`
4. **Log security status**: Print security status on startup

**Graceful Degradation**: If security middleware not found, servers run without security (with warning)

### Frontend Integration

The frontend (`api-config.js`) automatically:

1. **Detects remote access**: Identifies local vs remote connections
2. **Routes to correct host**: Uses appropriate AI server URLs
3. **Handles authentication**: Adds API keys to requests if configured
   - Loads API key from localStorage, URL parameter, or window.API_KEY
   - Automatically adds `X-API-Key` header to all requests
   - Provides `setApiKey()` method for programmatic configuration
4. **Error handling**: Provides user-friendly error messages

**API Key Configuration**:
```javascript
// Set API key programmatically
apiConfig.setApiKey('gk_userid_keyid_signature');

// Or via URL parameter
// http://yoursite.com/games/chess.html?api_key=gk_userid_keyid_signature

// Or via localStorage (persists across sessions)
localStorage.setItem('games_api_key', 'gk_userid_keyid_signature');
```

---

## Configuration

### Environment Variables

```powershell
# Enable authentication
$env:AI_AUTH_ENABLED = "true"

# Set API key secret (auto-generated if not set)
$env:AI_API_KEY_SECRET = "your-secret-key-here"

# Auth secret for key generation
$env:AUTH_SECRET_KEY = "your-auth-secret-here"
```

### Rate Limit Configuration

Edit `backend/security_middleware.py`:

```python
RATE_LIMIT_CONFIG = {
    "move_requests": {
        "tokens_per_minute": 30,  # Adjust as needed
        "burst_size": 5,
        "window_seconds": 60
    },
    "status_requests": {
        "tokens_per_minute": 120,
        "burst_size": 10,
        "window_seconds": 60
    }
}
```

---

## Management Scripts

### Security Management

**Script**: `scripts/manage-security.ps1`

**Actions**:
- `status`: Check security status
- `stats`: View recent security events
- `block`: Block an IP address
- `unblock`: Unblock an IP address
- `enable-auth`: Enable authentication
- `disable-auth`: Disable authentication

**Usage**:
```powershell
.\scripts\manage-security.ps1 -Action status -Port 10001
.\scripts\manage-security.ps1 -Action stats
.\scripts\manage-security.ps1 -Action block -IP 1.2.3.4
```

### API Key Generation

**Script**: `scripts/generate-api-key.ps1`

**Usage**:
```powershell
.\scripts\generate-api-key.ps1 -Email "player@example.com" -Name "Bangalore Player" -ExpiresDays 365
```

**Output**: API key that can be used in frontend requests

---

## Deployment Options

### Option 1: Cloudflare Tunnel (Recommended)

**Benefits**:
- No port forwarding required
- Built-in DDoS protection
- Automatic SSL/TLS
- IP masking
- Free tier available

**Setup**: See `docs/SECURITY_PUBLIC_ACCESS.md`

### Option 2: Reverse Proxy (Nginx)

**Benefits**:
- Additional DDoS protection
- SSL/TLS termination
- Request filtering
- IP whitelisting/blacklisting
- Rate limiting at proxy level

**Setup**: See `docs/SECURITY_PUBLIC_ACCESS.md` for Nginx configuration

### Option 3: Direct Port Forwarding (Cautious)

**Requirements**:
- Rate limiting enabled ✅
- Monitoring active ✅
- Firewall configured
- Regular security reviews

**Risk Level**: Medium (with proper configuration)

**Setup**: See `docs/SECURITY_PUBLIC_ACCESS.md`

---

## Security Best Practices

### Production Deployment

1. **Enable Rate Limiting**: Always enabled by default
2. **Enable Authentication**: Recommended for production
3. **Use Cloudflare Tunnel**: Safest option for public access
4. **Monitor Security Stats**: Regular review of `/api/security/stats`
5. **Block Malicious IPs**: Use management scripts
6. **Adjust Rate Limits**: Based on usage patterns
7. **Regular Security Reviews**: Check logs and adjust configuration

### Development/Testing

1. **Use Tailscale**: No port forwarding needed
2. **Disable Authentication**: For easier testing
3. **Monitor Locally**: Use security stats endpoint
4. **Test Rate Limits**: Verify limits work correctly

---

## Monitoring

### Security Statistics Endpoint

**URL**: `http://localhost:10001/api/security/stats`

**Response**:
```json
{
    "total_requests": 1234,
    "blocked_ips": 5,
    "auth_enabled": true,
    "rate_limit_config": {
        "move_requests": {
            "tokens_per_minute": 30,
            "burst_size": 5,
            "window_seconds": 60
        }
    },
    "recent_requests": [...]
}
```

### Request Logging

All requests are logged with:
- Timestamp
- IP address
- Method and path
- Response status
- User agent
- User ID (if authenticated)

**Access**: Via security stats endpoint or direct inspection of `request_log` in `security_middleware.py`

---

## Incident Response

### Under Attack

1. **Immediate Actions**:
   ```python
   from security_middleware import block_ip
   block_ip("attacker_ip")
   ```

2. **Reduce Rate Limits**:
   Edit `security_middleware.py` to temporarily reduce limits

3. **Enable Authentication**:
   ```powershell
   .\scripts\manage-security.ps1 -Action enable-auth
   ```

4. **Monitor Logs**:
   Check `/api/security/stats` for attack patterns

### Recovery Steps

1. Identify and block malicious IPs
2. Adjust rate limits based on attack pattern
3. Consider enabling authentication
4. Review and improve security configuration
5. Document incident for future prevention

---

## Testing

### Test Rate Limiting

```bash
# Make rapid requests to trigger rate limit
for i in {1..40}; do
    curl http://localhost:10001/api/move -X POST -H "Content-Type: application/json" -d '{"fen":""}'
done
# Should see 429 (Too Many Requests) after ~30 requests
```

### Test Authentication

```bash
# Without API key (if auth enabled)
curl http://localhost:10001/api/move -X POST
# Should return 401 (Unauthorized)

# With API key
curl http://localhost:10001/api/move -X POST \
    -H "X-API-Key: gk_userid_keyid_signature"
# Should succeed
```

### Test IP Blocking

```python
from security_middleware import block_ip, TokenBucketRateLimiter

block_ip("1.2.3.4")
limiter = TokenBucketRateLimiter(30, 5, 60)
allowed, msg = limiter.check_rate_limit("1.2.3.4", "/api/move")
# Should return (False, "IP address is blocked")
```

---

## Future Enhancements

### Planned Features

1. **Automatic IP Blocking**: Fail2ban-style automatic blocking
2. **Geolocation Filtering**: Block requests from specific countries
3. **Advanced Rate Limiting**: Per-user limits, premium tier support
4. **Request Analytics**: Detailed usage statistics
5. **Alerting**: Email/SMS alerts for security events
6. **Distributed Rate Limiting**: Redis-based for multiple server instances

### Security Improvements

1. **HTTPS/TLS**: Full encryption (via Cloudflare Tunnel or reverse proxy)
2. **Input Validation**: Enhanced request validation
3. **SQL Injection Prevention**: For database features
4. **CORS Refinement**: More restrictive CORS policies
5. **Security Headers**: Additional HTTP security headers

---

## Conclusion

The security implementation provides a solid foundation for public internet access while maintaining reasonable protection against common attacks. The system is:

- **Production-ready**: Rate limiting and monitoring active
- **Flexible**: Optional authentication, configurable limits
- **Maintainable**: Management scripts and clear documentation
- **Extensible**: Easy to add new security features

**Key Achievement**: Enables safe public access for competitive play (KataGo for Bangalore players) while protecting against abuse.

---

## Related Documentation

- **Complete Security Guide**: `docs/SECURITY_PUBLIC_ACCESS.md`
- **Quick Start**: `docs/SECURITY_QUICK_START.md`
- **Remote Access Setup**: `docs/REMOTE_ACCESS_SETUP.md`
- **Architecture Analysis**: `docs/architecture/ARCHITECTURE_ANALYSIS.md`
