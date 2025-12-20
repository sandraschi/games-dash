# Games Collection

![Games](https://img.shields.io/badge/games-69-blue)
![AI Engines](https://img.shields.io/badge/AI%20engines-4-green)
![Achievements](https://img.shields.io/badge/achievements-15+-gold)
![MCP Tools](https://img.shields.io/badge/MCP%20tools-10+-purple)
![Code Quality](https://img.shields.io/badge/code%20quality-Ruff%20✓-brightgreen)
![Mobile Ready](https://img.shields.io/badge/mobile-responsive-blue)
![Multiplayer](https://img.shields.io/badge/multiplayer-local+internet-purple)
![Build Time](https://img.shields.io/badge/build%20time-4%20hours-orange)
![Cost](https://img.shields.io/badge/cost-zilch-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Made with](https://img.shields.io/badge/made%20with-Cursor%20IDE-purple)

A web-based games collection with 69 games, built in a day using Cursor IDE's auto-agent feature. Cost: essentially nothing (probably Gemini 3).

**✨ RECENT ENHANCEMENTS (2025-12-20):**
- ✅ **Code Quality**: 42 Ruff linting errors → 0 (production-ready!)
- ✅ **Firebase Multiplayer**: Internet play worldwide with Steve
- ✅ **Mobile Responsive**: iPad/Portrait optimized with device-adaptive layouts
- ✅ **Enhanced Tetris**: Mobile controls, persistent settings, hexominoes
- ✅ **Technical Docs**: 7 new documentation pages with architecture details

📖 **[Technical Documentation](TECHNICAL.md)** - Stack, tools, and architecture details
📖 **[Firebase Setup](FIREBASE_SETUP_GUIDE.md)** - Internet multiplayer configuration
📖 **[Enhancements 2025-12-20](ENHANCEMENTS_2025-12-20.md)** - Latest improvements

## What's Included

**69 Games Total:**
- 23 Board Games (Chess, 3D Chess, Shogi, Go, Gomoku, Checkers, Connect Four, Mühle, Ludo, Mensch ärgere dich nicht!, Snakes & Ladders, Monopoly, Risk, Battleship, Clue, Settlers of Catan, Ticket to Ride, Carcassonne, Reversi, Rummy, Canasta, Halma, Chess Puzzles, Famous Games, Openings, Blunders)
- 8 Arcade Games (Snake, Tetris, Breakout, Pong, Pac-Man, Frogger, Q*bert, Asteroids)
- 8 Puzzle & Word Games (Sudoku, Word Search, Scrabble, Crossword, Pentomino, Dominoes, Memory, Rubik's Cube - 2×2, 3×3, 4×4, 5×5 with reduction method solvers)
- 2 Math Puzzles (KenKen, 24 Game)
- 5 Japanese Learning Games (Yojijukugo - 四字熟語, Karuta, Kanji Stroke Order, Mahjong, Hanafuda)
- 4 Card Games (Texas Hold'em, Contract Bridge, Old Maid, Schnapsen)
- 3 Dice Games (Yahtzee, Craps, Cho-Han Bakuchi)
- 3 Casino Games (Blackjack, Roulette, Baccarat) - House always wins!
- 2 Party Games (Tongue Twister, Text Adventures)
- 1 Classic Adventures (ScummVM Launcher)
- 6 Windows Classic Games (Solitaire/Klondike, Minesweeper, FreeCell, Spider Solitaire, Hearts, Gem Cascade) - Killing productivity since 1990!

**AI Opponents:**
- Stockfish 16 (Chess, ~3500 ELO)
- YaneuraOu v9.10 (Shogi)
- KataGo v1.15.3 (Go)
- Minimax algorithms for simpler games (Gomoku, Checkers, Mühle)

**Canva Design Integration:**
- Professional game thumbnail generation
- Tournament bracket creation
- Achievement certificate generation
- Promotional poster design
- Leaderboard visualization
- Free Canva API access for automated asset creation

**Text Adventures:**
- ZORK: The Great Underground Empire
- Enchanted Castle
- Lost in Space

## Requirements

- Python 3.8+ (for AI backend servers)
- Node.js 18+ (for running tests)
- Modern web browser (Chrome/Firefox/Edge)
- Windows (AI engines are Windows binaries)

## Testing

Run the test suite:

```powershell
npm install
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

Tests cover game logic, move validation, win conditions, and puzzle mechanics.

## Quick Start

### 🎯 **RECOMMENDED: One-Click Installer** (For Everyone!)

**Just double-click `Install_Games.bat`** - that's it!

This idiot-proof installer will:
- ✅ Install Docker Desktop automatically
- ✅ Configure firewall and networking
- ✅ Deploy all 69 games with AI opponents
- ✅ Set up crash-resistant services
- ✅ Open your browser automatically
- ✅ Provide access URLs for iPad/internet play

**Requirements:** Windows 10/11, internet connection, administrator rights (requested automatically)

---

### Manual Installation Options

**Option 1: Simple (No Docker)**

```powershell
cd games-app
.\START_EVERYTHING.ps1
```

Opens browser at `http://localhost:9876`

**Option 2: Hybrid Setup** (Windows + optional Docker web server)

```powershell
# RECOMMENDED: Start everything on Windows (simplest)
.\START_ALL_SERVERS.ps1

# OR: Run web server in Docker (optional, for isolation)
# First start AI engines on Windows:
.\START_ALL_SERVERS.ps1
# Then run web server in Docker:
docker compose up -d
```

**How it works**: AI engines (.exe files) run natively on Windows. Web server can optionally run in Linux container for isolation. See `DOCKER_HYBRID_SETUP.md` for details.

**Option 3: Docker Remote Access** (Recommended for iPad/Mobile Gaming)

```powershell
# Automated deployment (includes firewall setup)
.\START_REMOTE_DEPLOYMENT.ps1

# Manual setup:
# Find your PC's IP address first
ipconfig | findstr "IPv4"

# Allow firewall access
New-NetFirewallRule -DisplayName "Games Remote Access" -Direction Inbound -Protocol TCP -LocalPort 9876,9543-9545,9877 -Action Allow

# Start services (crash-resistant with auto-restart)
docker compose up --build -d

# Access from iPad: http://YOUR-PC-IP:9876
```

**Benefits:**
- ✅ **Crash-Resistant**: Web server auto-restarts if it fails
- ✅ **Remote Access**: Play from iPad/phone over WiFi/LAN
- ✅ **Internet Access**: Add Tailscale VPN for gaming from anywhere (even Burundi! 🌍)
- ✅ **Zero Config**: No port forwarding with Tailscale
- ✅ **Secure**: End-to-end encrypted connections
- ✅ **AI Works Remotely**: Smart proxy system ensures AI engines work from anywhere
- ✅ **iPad Optimized**: Touch controls and mobile-responsive design

**⚠️ IMPORTANT**: AI engines (Stockfish, YaneuraOu, KataGo) are Windows .exe files and CANNOT run in Linux containers. They must run natively on Windows.

## 🌍 Remote Access & AI Connectivity

**The AI works from anywhere!** Even from an iPad in Burundi. Here's how:

### Quick Remote Setup

1. **Setup Remote Access**:
   ```powershell
   .\setup_remote_access.ps1
   ```

2. **Start Everything**:
   ```powershell
   .\START_ALL_SERVERS.ps1    # AI engines on Windows
   docker compose up -d       # Web server in Docker
   ```

3. **Test Connectivity**:
   - Open `connectivity-test.html` in your browser
   - Click "Test All AI Servers"
   - All should show ✅ CONNECTED

### Access from Anywhere

- **Local Network**: `http://YOUR-PC-IP:9876`
- **Tailscale VPN**: `http://YOUR-TAILSCALE-IP:9876` (works from anywhere)
- **iPad/Safari**: Full touch support with responsive design

### How Remote AI Works

The system uses intelligent API routing:
- **Web server** runs in Docker (accessible remotely)
- **AI engines** run on Windows host
- **Smart proxy** in Docker forwards AI requests to Windows
- **Automatic detection** of local vs remote access
- **Connection pooling** for optimal performance

### Troubleshooting Remote Access

If AI doesn't work remotely:

1. **Check AI servers are running**: `.\setup_remote_access.ps1`
2. **Test connectivity**: Visit `connectivity-test.html`
3. **Verify Docker networking**: Ensure `host.docker.internal` works
4. **Check firewall**: Ports 9543-9545, 9877 must be accessible
5. **Tailscale setup**: Install on both PC and iPad for zero-config access

**The AI will work from your iPad in Burundi! 🎉**

**See `REMOTE_DEPLOYMENT_GUIDE.md`** for complete iPad + Tailscale setup!

**Option 4: Docker Windows Containers** (Windows Pro only, ⚠️ **NOT RECOMMENDED**)

```powershell
# Switch Docker Desktop to Windows containers mode first!
# WARNING: This will break all your other Dockerized repos (30+ projects)!
docker compose -f docker-compose.windows.yml up -d
```

⚠️ **Docker Desktop can only run ONE container type at a time**. Switching to Windows containers will break all your Linux-based Docker projects. See `DOCKER_WINDOWS_GUIDE.md` for details.

## Backend Servers

Three Python servers run the AI engines:

- `stockfish-server.py` - Port 9543 (Chess)
- `shogi-server.py` - Port 9544 (Shogi)
- `go-server.py` - Port 9545 (Go)
- `multiplayer-server.py` - Port 9877 (WebSocket multiplayer)

Web server: Port 9876

## Features

### 🎮 Enhanced Games MCP Server
- **Tournament Management** - Create competitive tournaments with automated pairings
- **Puzzle Generation** - Generate tactical puzzles for training (chess, shogi, go)
- **Detailed Position Analysis** - Multi-line analysis with tactical motifs and strategic evaluation
- **Player Rating System** - ELO-based ratings and comprehensive statistics
- **Correspondence Play** - Play games via Claude/Cursor with physical boards
- See `GAMES_MCP_README.md` for complete MCP server documentation

### 🏆 Achievement System
- **15+ Achievements** across 6 categories (games, streaks, exploration, special, social)
- **Progress Tracking** with visual progress bars and completion percentages
- **Rarity System** with 5 levels (common → legendary) and point values
- **Unlock Notifications** with animated achievements
- **Achievement Points** for gamification
- Dedicated achievements page with filtering and recent notifications

### 🌐 Unified Multiplayer System
- **Automatic Mode Detection** - Seamlessly switches between local and internet play
- **Smart Connection Logic** - Tries local WebSocket first, falls back to Firebase
- **Reconnection Handling** - Automatic reconnection with exponential backoff
- **Cross-Platform Support** - Works on same WiFi (local) or different locations (internet)
- **Tournament Support** - Competitive play with brackets and pairings
- **Firebase Internet Play** - Worldwide multiplayer with secure authentication
- **WebSocket Local Play** - Fast, private same-network gaming

### 📱 Mobile & Touch Optimized
- **Device Adaptive Layouts** - Automatic detection of desktop/mobile/orientation
- **iPad Portrait Mode** - Square board games optimized for full-screen play
- **Touch Controls** - Enhanced Tetris with mobile-optimized controls
- **Responsive Design** - Works perfectly on iPhone, iPad, and Android devices
- **Persistent Settings** - Game preferences saved between sessions

### 🎯 Game Features
- Difficulty levels for most games
- Japanese crossword puzzles (Hiragana)
- Crossword import (.puz, .json files)
- Scrabble education center with strategy guides
- Changeable chess piece sets (Classic/Modern/Emoji)
- Move sounds for AI opponents
- Multiplayer support:
  - **Unified Multiplayer** (NEW!) - Automatic local/internet detection
  - **WebSocket server** (local network + Tailscale VPN) - `multiplayer-server.py`
    - Works on localhost, LAN, and Tailscale network
  - **Firebase Internet Play** (CONFIGURED!) - Worldwide multiplayer with Steve
    - Secure authentication, real-time games, player profiles
    - See `FIREBASE_SETUP_GUIDE.md` for setup (already configured!)
- ScummVM integration for classic adventure games
- Tournament bracket creation via Canva integration

## Notes

- Built entirely with Cursor IDE's auto-agent in a day
- No fancy frameworks - vanilla HTML/CSS/JavaScript
- AI backends use asyncio/aiohttp
- Dockerized for easy deployment
- Multiplayer uses local WebSocket server (see `multiplayer-server.py`)

## File Structure

```
games-app/
├── *.html              # Game pages
├── *.js                # Game logic
├── styles.css          # Shared styles
├── firebase-config.js  # Firebase configuration (CONFIGURED!)
├── data/               # Game data (openings, puzzles, etc.)
├── js/                 # JavaScript modules
│   ├── achievements.js # Achievement system
│   ├── game-stats.js   # Statistics tracking
│   ├── index-enhancements.js # UI enhancements
│   └── device-adaptive.js # Mobile responsive layouts
├── stockfish/          # Chess AI engine
├── yaneuraou/          # Shogi AI engine
├── katago/             # Go AI engine
├── *-server.py         # AI backend servers
├── games-mcp/          # Enhanced MCP server
│   └── src/games_mcp/mcp_server.py # Tournament & analysis tools
├── unified-multiplayer.js # Smart multiplayer system
├── achievements.html   # Achievement tracking page
├── multiplayer.html    # Multiplayer lobby
├── debug.html          # Debug & connectivity testing
├── adaptive-test.html  # Device layout testing
├── technical-docs.html # Technical documentation hub
├── FIREBASE_SETUP_GUIDE.md # Firebase setup (DONE!)
├── ENHANCEMENTS_2025-12-20.md # Latest improvements
├── Dockerfile          # Container config
├── docker-compose.yml  # Multi-service orchestration
└── START_EVERYTHING.ps1 # Windows launcher
```

## License

MIT License - Do whatever you want with it.

## Credits

- Stockfish chess engine: https://stockfishchess.org/
- YaneuraOu shogi engine: https://github.com/yaneurao/YaneuraOu
- KataGo: https://github.com/lightvector/KataGo
- Built with Cursor IDE: https://cursor.sh/

---

**Made in a day. Not changing the world, just playing games.**
