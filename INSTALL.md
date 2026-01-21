# 📦 Installation & Setup Guide

## Prerequisites

- **Python 3.11+**
- **Git**
- **Docker** (optional, for containerized deployment)
- **Node.js** (optional, for frontend development)

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/sandraschi/games-dash.git
cd games-dash

# Install Python dependencies
pip install -e .

# Start the Games MCP server
games-mcp

# Configure Claude Desktop
{
  "mcpServers": {
    "games": {
      "command": "games-mcp"
    }
  }
}
```

### With AI Engines (Full Functionality)

```bash
# Start AI engines in separate terminals
python backend/simple-stockfish-server.py  # Chess AI (port 10001)
python backend/simple-shogi-server.py      # Shogi AI (port 10003)
python backend/simple-go-server.py         # Go AI (port 10002)

# Or use the convenience script
.\scripts\ensure-ai-services.ps1
```

## 🐳 Docker Deployment

### Local Container

```bash
# Build and run
docker-compose up --build

# Access via Claude Desktop
{
  "mcpServers": {
    "games-server": {
      "url": "http://localhost:8000"
    }
  }
}
```

### Serverless Deployment

See [DEPLOYMENT.md](games-mcp/DEPLOYMENT.md) for Vercel, Railway, Netlify, and Cloudflare deployment guides.

## 🔧 Advanced Configuration

### Environment Variables

```bash
# Logging
GAMES_MCP_LOG_LEVEL=INFO

# AI Engine URLs (optional, defaults to localhost)
STOCKFISH_URL=http://your-stockfish-server:10001
SHOGI_URL=http://your-shogi-server:10003
GO_URL=http://your-go-server:10002

# Database (optional, defaults to SQLite)
DATABASE_URL=sqlite:///games.db
```

### Claude Desktop Configuration

#### STDIO Transport (Default)
```json
{
  "mcpServers": {
    "games": {
      "command": "games-mcp",
      "env": {
        "GAMES_MCP_LOG_LEVEL": "INFO"
      }
    }
  }
}
```

#### HTTP Transport (Serverless)
```json
{
  "mcpServers": {
    "games-server": {
      "url": "https://your-games-mcp.vercel.app/"
    }
  }
}
```

## 🎮 Game Access

### Web Interface

Start the web server:
```bash
python backend/web-server.py
```

Access at: `http://localhost:8080`

### MCP Integration

All games are available through Claude/Cursor MCP commands:

```bash
# List available games
"Show me all board games"

# Start a game
"Let's play chess"

# Get AI analysis
"Analyze this position: r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R"

# Generate puzzles
"Give me a chess puzzle"
```

## 🔍 Troubleshooting

### Common Issues

1. **MCP Server Not Starting**
   ```bash
   # Check Python version
   python --version  # Should be 3.11+

   # Reinstall dependencies
   pip install -e . --force-reinstall
   ```

2. **AI Engines Not Connecting**
   ```bash
   # Check if engines are running
   curl http://localhost:10001/health

   # Start engines manually
   python backend/simple-stockfish-server.py
   ```

3. **Claude Desktop Connection Issues**
   ```bash
   # Restart Claude Desktop after config changes
   # Check Claude Desktop logs for MCP errors
   ```

4. **Port Conflicts**
   ```bash
   # Check what's using ports
   netstat -ano | findstr :8000

   # Change default ports in configuration
   games-mcp --transport streamable-http --port 9000
   ```

### Debug Mode

```bash
# Run with debug logging
GAMES_MCP_LOG_LEVEL=DEBUG games-mcp

# Test MCP connection
games-mcp --transport stdio
```

## 📊 Health Checks

### MCP Server Health
```bash
# Via MCP command
"Check server status"

# Via HTTP (if using streamable-http)
curl http://localhost:8000/health
```

### AI Engines Health
```bash
# Stockfish
curl http://localhost:10001/health

# Shogi (YaneuraOu)
curl http://localhost:10003/health

# Go (KataGo)
curl http://localhost:10002/health
```

## 🔄 Updates

### Update the Repository
```bash
git pull origin master
pip install -e . --upgrade
```

### Update Dependencies
```bash
pip install -e . --upgrade --force-reinstall
```

## 🚀 Production Deployment

For production environments:

1. **Use HTTPS** - Always deploy with SSL certificates
2. **Configure CORS** - Set appropriate origins for web clients
3. **Enable monitoring** - Set up logging and health checks
4. **Use environment variables** - Never hardcode secrets
5. **Configure rate limiting** - Protect against abuse
6. **Set up backups** - Regular database backups

See [games-mcp/DEPLOYMENT.md](games-mcp/DEPLOYMENT.md) for detailed production deployment guides.

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/sandraschi/games-dash/issues)
- **Documentation**: [TECH_STACK.md](TECH_STACK.md) for technical details
- **Games Catalog**: [GAMES.md](GAMES.md) for game-specific help
- **Development**: [DEVELOPMENT.md](DEVELOPMENT.md) for contribution guidelines