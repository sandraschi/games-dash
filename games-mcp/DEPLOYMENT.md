# 🚀 Games MCP Server Deployment Guide

This guide covers deploying the Games MCP server with **Streamable HTTP Transport** for maximum scalability and resilience.

## 🎯 Why Streamable HTTP?

- **Stateless Operation**: Perfect for serverless platforms
- **Automatic Reconnection**: Handles network interruptions gracefully
- **Global Distribution**: Deploy via CDNs and edge networks
- **Bidirectional Communication**: Real-time features without persistent connections
- **Serverless Compatible**: Works on Vercel, Netlify, Railway, etc.

## 📦 Quick Docker Deployment

```bash
# Build and run locally
docker-compose up --build

# Test the endpoint
curl http://localhost:8000/health

# Access via Claude Desktop (remote MCP)
{
  "mcpServers": {
    "games-server": {
      "url": "http://localhost:8000"
    }
  }
}
```

## ☁️ Serverless Deployment Options

### Vercel (Recommended)

1. **Create vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/games_mcp/mcp_server.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/games_mcp/mcp_server.py"
    }
  ],
  "env": {
    "GAMES_MCP_LOG_LEVEL": "INFO"
  }
}
```

2. **Deploy**:
```bash
npm install -g vercel
vercel --prod
```

3. **Configure Claude Desktop**:
```json
{
  "mcpServers": {
    "games-server": {
      "url": "https://your-project.vercel.app/"
    }
  }
}
```

### Railway

1. **Connect GitHub repo** to Railway
2. **Set environment variables**:
   - `GAMES_MCP_LOG_LEVEL=INFO`
3. **Deploy automatically** on git push
4. **Get the deployment URL** and configure in Claude Desktop

### Netlify Functions

1. **Create netlify.toml**:
```toml
[build]
  command = "pip install -e .[http]"
  functions = "netlify/functions"

[functions]
  directory = "netlify/functions"
```

2. **Create function file** (`netlify/functions/games-mcp.py`):
```python
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.games_mcp.mcp_server import main

def handler(event, context):
    # Netlify function handler for Games MCP
    # Note: Requires custom MCP client integration
    return {
        'statusCode': 200,
        'body': 'Games MCP Server - Use MCP client to connect'
    }
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Logging
GAMES_MCP_LOG_LEVEL=INFO

# Transport (automatically set by command args)
# No env vars needed - transport configured via command line

# Optional: External AI Engines
STOCKFISH_URL=https://your-stockfish-service.com
SHOGI_URL=https://your-shogi-service.com
GO_URL=https://your-go-service.com
```

### CORS Configuration

For web-based MCP clients:

```bash
games-mcp --transport streamable-http --cors-origins "https://claude.ai,https://cursor.sh"
```

## 🌐 Global Distribution

### CDN Deployment (Cloudflare)

1. **Deploy to Cloudflare Workers**:
```javascript
// workers/games-mcp.js
import { handleRequest } from './games-mcp-server';

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};
```

2. **Configure routes** globally via Cloudflare's edge network
3. **Automatic DDoS protection** and caching included

### Regional Deployment Strategy

```bash
# Deploy to multiple regions for low latency
# US East: games-mcp-us-east.vercel.app
# EU West: games-mcp-eu-west.vercel.app
# Asia Pacific: games-mcp-apac.vercel.app

# Use DNS load balancing or client-side routing
```

## 🔒 Security Considerations

### Authentication

For production deployments, implement authentication:

```python
# Add to mcp_server.py
import os
from fastmcp.server.auth import BearerTokenAuth

auth = BearerTokenAuth(token=os.getenv("MCP_API_KEY"))
mcp = FastMCP("games-mcp", auth=auth)
```

### Rate Limiting

```python
# Implement rate limiting for serverless environments
from fastmcp.server.middleware import RateLimitMiddleware

mcp.add_middleware(RateLimitMiddleware(requests_per_minute=60))
```

### HTTPS Only

Always deploy with HTTPS:
- Vercel: Automatic
- Railway: Automatic
- Netlify: Automatic
- Cloudflare: Automatic

## 📊 Monitoring & Observability

### Health Checks

The server provides health endpoints:

```bash
# Basic health
curl https://your-deployment.com/health

# Detailed status
curl https://your-deployment.com/status
```

### Logging

Configure structured logging for serverless environments:

```python
import json
import sys

class StructuredLogger:
    def info(self, message, **kwargs):
        print(json.dumps({
            "level": "INFO",
            "message": message,
            "timestamp": datetime.now().isoformat(),
            **kwargs
        }), file=sys.stderr)
```

## 🚨 Troubleshooting

### Common Issues

1. **Cold Start Delays** (Serverless)
   - Solution: Keep functions warm with periodic pings
   - Alternative: Use Railway/Netlify for persistent containers

2. **CORS Errors**
   - Solution: Configure `--cors-origins` properly
   - Check: Browser developer tools for preflight errors

3. **Connection Timeouts**
   - Solution: Increase timeout in MCP client configuration
   - Check: Network connectivity and firewall settings

4. **Memory Limits** (Serverless)
   - Solution: Optimize imports and lazy loading
   - Monitor: Function execution time and memory usage

### Debugging

```bash
# Test locally first
games-mcp --transport streamable-http --port 8000

# Check health
curl http://localhost:8000/health

# Test with MCP client (stdio mode)
games-mcp
```

## 📈 Performance Optimization

### For Serverless

1. **Lazy Imports**: Import heavy dependencies only when needed
2. **Connection Pooling**: Reuse database connections
3. **Caching**: Implement response caching for repeated queries
4. **Background Tasks**: Offload non-critical work

### For CDN Deployment

1. **Edge Caching**: Cache static responses at edge locations
2. **Regional Databases**: Use regional database replicas
3. **Compression**: Enable gzip/brotli compression
4. **CDN Purge**: Automate cache invalidation for updates

## 🎯 Best Practices

1. **Test Locally First**: Always verify with stdio transport before deploying
2. **Use Health Checks**: Monitor server health in production
3. **Implement Logging**: Structured logging for debugging
4. **Configure Timeouts**: Appropriate timeouts for serverless functions
5. **Monitor Costs**: Track API usage and optimize expensive operations
6. **Backup Strategy**: Regular database backups for persistence
7. **Version Control**: Tag deployments for rollback capability

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy Games MCP

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -e .[http]

      - name: Run tests
        run: python -m pytest

      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --yes
```

---

**🎉 Your Games MCP server is now ready for global, serverless deployment!**

The Streamable HTTP transport enables unprecedented scalability and reliability for your MCP server. Deploy confidently knowing it can handle network interruptions, scale automatically, and serve users worldwide through CDN distribution.
