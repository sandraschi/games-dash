# 🛠️ Technical Architecture

## Overview

The Games Collection is a comprehensive gaming platform built with modern web technologies and AI integration. It combines traditional game development with cutting-edge MCP (Model Context Protocol) capabilities for conversational AI game interactions.

## 🏗️ System Architecture

### Core Components

```
Games Collection
├── 🎮 Web Frontend (Vanilla JS + HTML5)
├── 🧠 AI Engines (Stockfish, KataGo, YaneuraOu)
├── 📡 MCP Server (FastMCP 2.14.3+)
├── 💾 Database Layer (SQLite + Custom ORM)
├── 🌐 Multiplayer System (Firebase + WebRTC)
└── 📚 Content Management (File-based + Database)
```

### Transport Protocols

#### STDIO (Default)
- **Use Case**: Local MCP client integration (Claude Desktop, Cursor)
- **Protocol**: Standard input/output streams
- **Advantages**: Maximum performance, direct process communication
- **Limitations**: Local-only, no remote access

#### Streamable HTTP (Advanced)
- **Use Case**: Serverless deployment, remote access, web APIs
- **Protocol**: HTTP with optional streaming
- **Advantages**: Stateless, serverless-compatible, global distribution
- **Features**: Automatic reconnection, bidirectional communication

## 🎯 Technology Stack

### Frontend

#### Core Framework
- **Vanilla JavaScript (ES6+)** - No frameworks for maximum performance
- **HTML5 Canvas** - Hardware-accelerated 2D/3D graphics
- **CSS3** - Responsive design with mobile optimization
- **Web Audio API** - Professional audio with fallback support

#### Game Architecture
- **BaseGame Class** - Unified game state management
- **CanvasRenderer/GridRenderer** - Device-adaptive graphics
- **SoundManager** - Professional audio system
- **CardUtils Framework** - Complete card game support
- **Utility Functions** - 100+ shared math/array/color/animation functions

### Backend

#### MCP Server (FastMCP)
- **Version**: 2.14.3+ with SEP-1577 sampling support
- **Features**:
  - Autonomous AI orchestration
  - Conversational tool returns
  - Enhanced error recovery
  - Portmanteau tool patterns
- **Tools**: 16 game management and analysis tools

#### AI Engines
- **Stockfish** (Chess) - ~3500 ELO, port 10001
- **KataGo** (Go) - Professional strength, port 10002
- **YaneuraOu** (Shogi) - World-class shogi engine, port 10003
- **Integration**: HTTP APIs with caching and performance optimization

#### Database Layer
- **SQLite** - Embedded database for game state and statistics
- **Custom ORM** - Lightweight object-relational mapping
- **Caching Layer** - Redis-compatible in-memory caching
- **Migration System** - Schema versioning and updates

### Infrastructure

#### Deployment Options
- **Docker Containers** - Production-ready with health checks
- **Serverless Platforms** - Vercel, Netlify, Railway support
- **CDN Distribution** - Cloudflare global edge network
- **Traditional Hosting** - VPS/Cloud VM deployment

#### Monitoring & Observability
- **Health Checks** - Container and service health monitoring
- **Structured Logging** - JSON-formatted logs with correlation IDs
- **Performance Metrics** - Response times, error rates, usage stats
- **Error Tracking** - Global error handling with server-side logging

## 🎮 Game Categories & Architecture

### File Organization (358+ files)

```
games/
├── arcade-games/     # 49 files - Pac-Man, Tetris, Space Invaders
├── board-games/      # 61 files - Chess, Go, Checkers, Reversi
├── card-games/       # 21 files - Poker, Bridge, Solitaire
├── casino-games/     # 12 files - Roulette, Baccarat, Craps
├── educational/      # 25+ files - Japanese learning, quizzes
├── multiplayer/      # 4 files - Real-time multiplayer system
├── puzzle-games/     # 46 files - Sudoku, Crossword, Jigsaw
├── shared/           # 20+ files - Utilities, dashboards, debug
└── strategy-games/   # 22 files - Risk, Monopoly, Catan
```

### Game Framework Features

#### BaseGame Class
```javascript
class BaseGame {
    constructor(name, options) {
        this.name = name;
        this.state = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.lives = options.initialLives || 3;
        this.enableSound = options.enableSound || false;
        this.enableStats = options.enableStats || false;
    }

    // Unified lifecycle methods
    start() { /* Initialize game */ }
    update(deltaTime) { /* Game logic */ }
    render() { /* Draw to canvas */ }
    handleInput(event) { /* Process user input */ }
    saveGameState() { /* Persist progress */ }
    loadGameState() { /* Restore progress */ }
}
```

#### Canvas & Graphics
- **Hardware Acceleration**: WebGL fallback for Canvas 2D
- **Device Adaptation**: Automatic scaling for mobile/desktop
- **Sprite Management**: Image loading and animation systems
- **Particle Effects**: Built-in visual effects library
- **60 FPS Rendering**: Optimized animation loops

#### Audio System
- **Web Audio API**: 3D spatial audio and effects processing
- **HTML5 Fallback**: Graceful degradation for older browsers
- **Procedural Generation**: Algorithmic sound synthesis
- **Volume Controls**: Independent master/SFX/music levels

## 🤖 AI & MCP Integration

### SEP-1577 Sampling Capabilities

#### Autonomous Orchestration
```python
# Traditional: Sequential tool calls
result1 = await get_ai_move(position)
result2 = await analyze_position(position)
result3 = await find_tactical_motifs(position)

# SEP-1577: Autonomous orchestration
result = await intelligent_game_analysis(
    position=position,
    analysis_goal="comprehensive_evaluation",
    max_iterations=10
)
# LLM autonomously decides tool sequence and parameters
```

#### Conversational Tool Returns
```python
@mcp.tool()
async def make_move(game_id: str, move: str) -> Dict[str, Any]:
    # Process move...

    return {
        "success": True,
        "operation": "make_move",
        "result": {...},
        "recommendations": [
            f"get_ai_move(game_id='{game_id}') - Get AI analysis",
            f"analyze_position(game_type='{game_type}') - Deep tactical analysis"
        ],
        "next_steps": [
            "Get AI analysis to understand position strength",
            "Analyze for tactical opportunities",
            "Consider opponent response patterns"
        ],
        "summary": f"Move recorded. Ready for AI analysis."
    }
```

### Multiplayer Architecture

#### Firebase Integration
- **Real-time Database**: Live game state synchronization
- **Authentication**: User accounts and secure access
- **Presence System**: Online/offline status tracking
- **Matchmaking**: Automated opponent pairing

#### WebRTC Implementation
- **Peer-to-peer Connections**: Direct browser communication
- **STUN/TURN Servers**: NAT traversal support
- **Fallback Mechanisms**: Firebase relay for connection issues
- **Voice/Text Chat**: Integrated communication features

## 📊 Data Management

### Database Schema

#### Games Table
```sql
CREATE TABLE games (
    id TEXT PRIMARY KEY,
    game_type TEXT NOT NULL,
    player_white TEXT,
    player_black TEXT,
    fen TEXT,
    moves TEXT, -- JSON array
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Players Table
```sql
CREATE TABLE players (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    rating_chess REAL DEFAULT 1200,
    rating_go REAL DEFAULT 1200,
    rating_shogi REAL DEFAULT 1200,
    games_played INTEGER DEFAULT 0,
    win_rate REAL DEFAULT 0.0,
    created_at TIMESTAMP
);
```

### Caching Strategy

#### Multi-layer Caching
- **Memory Cache**: Fast in-process caching for session data
- **Redis Cache**: Distributed caching for multi-server deployments
- **Database Cache**: Query result caching with TTL
- **CDN Cache**: Static asset caching for global distribution

#### AI Analysis Caching
- **Position Hashing**: MD5 hashes for position deduplication
- **Result Caching**: Store analysis results to avoid recomputation
- **Cache Invalidation**: Automatic cleanup of outdated results
- **Performance Metrics**: Cache hit rates and latency tracking

## 🔒 Security & Performance

### Security Measures

#### Input Validation
- **Pydantic Models**: Type-safe API parameter validation
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Sanitized HTML output
- **Rate Limiting**: Configurable request throttling

#### Authentication & Authorization
- **API Keys**: Secure MCP server authentication
- **OAuth Integration**: External service connections
- **Session Management**: Secure user session handling
- **CORS Configuration**: Domain-restricted cross-origin access

### Performance Optimizations

#### Frontend Optimizations
- **Code Splitting**: Lazy loading of game modules
- **Asset Optimization**: Compressed images and minified JavaScript
- **Memory Management**: Automatic cleanup of unused resources
- **GPU Acceleration**: Hardware-accelerated graphics rendering

#### Backend Optimizations
- **Async/Await**: Non-blocking I/O operations throughout
- **Connection Pooling**: Reusable database and HTTP connections
- **Background Tasks**: Offloaded non-critical processing
- **Horizontal Scaling**: Stateless design enables scaling

## 🚀 Deployment Architecture

### Development Environment
```
Local Development
├── ai-games-collection-mcp (stdio) ← Claude Desktop
├── web-server.py (port 8080) ← Browser access
├── AI engines (ports 10001-10003)
└── Firebase emulator (optional)
```

### Production Environment
```
Production (Streamable HTTP)
├── Vercel/Railway/Netlify ← Global CDN
├── Database (SQLite/PostgreSQL)
├── AI engines (cloud-hosted)
└── Firebase (production)
```

### Serverless Architecture
```
Serverless Deployment
├── Function as a Service (FaaS)
├── Edge Computing (CDN)
├── Managed Databases
├── Serverless AI APIs
└── Global Distribution
```

## 📈 Monitoring & Analytics

### Application Metrics
- **Response Times**: API endpoint performance tracking
- **Error Rates**: Comprehensive error monitoring and alerting
- **User Engagement**: Game session duration and completion rates
- **AI Performance**: Engine response times and accuracy metrics

### Infrastructure Metrics
- **Server Health**: CPU, memory, and disk usage monitoring
- **Network Performance**: Latency and throughput tracking
- **Database Performance**: Query performance and connection pooling
- **CDN Metrics**: Cache hit rates and global distribution stats

### Business Intelligence
- **User Demographics**: Geographic distribution and device types
- **Game Popularity**: Most played games and completion rates
- **Performance Analytics**: Player skill progression and improvement
- **Content Effectiveness**: Educational content engagement metrics

---

## 🔄 Development Workflow

### Local Development
1. **Clone Repository**: `git clone https://github.com/sandraschi/ai-games-collection.git`
2. **Install Dependencies**: `pip install -e .`
3. **Start Services**: `ai-games-collection-mcp` + AI engines + web server
4. **Test Integration**: Claude Desktop + browser testing

### CI/CD Pipeline
1. **Automated Testing**: Unit tests, integration tests, MCP validation
2. **Code Quality**: Linting, type checking, security scanning
3. **Performance Testing**: Load testing and performance benchmarks
4. **Deployment**: Automated deployment to staging/production

### Quality Assurance
1. **Cross-browser Testing**: Chrome, Firefox, Safari, Edge compatibility
2. **Mobile Testing**: iOS Safari, Android Chrome validation
3. **Accessibility Testing**: WCAG compliance and screen reader support
4. **Performance Testing**: Core Web Vitals and Lighthouse scores

---

This architecture combines the best of traditional game development with modern AI capabilities, creating a scalable, maintainable, and innovative gaming platform.
