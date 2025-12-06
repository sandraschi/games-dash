# Games Collection

![Games](https://img.shields.io/badge/games-55-blue)
![AI Engines](https://img.shields.io/badge/AI%20engines-4-green)
![Build Time](https://img.shields.io/badge/build%20time-4%20hours-orange)
![Cost](https://img.shields.io/badge/cost-zilch-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Made with](https://img.shields.io/badge/made%20with-Cursor%20IDE-purple)

A web-based games collection with 55 games, built in about 4 hours using Cursor IDE's auto-agent feature. Cost: essentially nothing (probably Gemini 3).

📖 **[Technical Documentation](TECHNICAL.md)** - Stack, tools, and architecture details

## What's Included

**55 Games Total:**
- 19 Board Games (Chess, 3D Chess, Shogi, Go, Gomoku, Checkers, Connect Four, Mühle, Ludo, Mensch ärgere dich nicht!, Snakes & Ladders, Monopoly, Risk, Battleship, Clue, Settlers of Catan, Ticket to Ride, Carcassonne, Chess Puzzles, Famous Games, Openings, Blunders)
- 8 Arcade Games (Snake, Tetris, Breakout, Pong, Pac-Man, Frogger, Q*bert, Asteroids)
- 8 Puzzle & Word Games (Sudoku, Word Search, Scrabble, Crossword, Pentomino, Dominoes, Memory, Rubik's Cube)
- 2 Math Puzzles (KenKen, 24 Game)
- 5 Japanese Learning Games (Yojijukugo - 四字熟語, Karuta, Kanji Stroke Order, Mahjong, Hanafuda)
- 4 Card Games (Texas Hold'em, Contract Bridge, Old Maid, Schnapsen)
- 3 Dice Games (Yahtzee, Craps, Cho-Han Bakuchi)
- 2 Party Games (Tongue Twister, Text Adventures)
- 1 Classic Adventures (ScummVM Launcher)
- 1 Timewaster (Gem Cascade)

**AI Opponents:**
- Stockfish 16 (Chess, ~3500 ELO)
- YaneuraOu v9.10 (Shogi)
- KataGo v1.15.3 (Go)
- Minimax algorithms for simpler games (Gomoku, Checkers, Mühle)

**Text Adventures:**
- ZORK: The Great Underground Empire
- Enchanted Castle
- Lost in Space

## Requirements

- Python 3.8+ (for AI backend servers)
- Modern web browser (Chrome/Firefox/Edge)
- Windows (AI engines are Windows binaries)

## Quick Start

**Option 1: Simple (No Docker)**

```powershell
cd games-app
.\START_EVERYTHING.ps1
```

Opens browser at `http://localhost:9876`

**Option 2: Hybrid Docker Setup** (Linux container + Windows AI engines)

```powershell
# Start AI engines on Windows (required)
.\START_ALL_SERVERS.ps1

# (Optional) Run web server in Docker
docker compose up -d
```

**How it works**: Linux container serves static files, Windows runs AI engines (like Ollama/LM Studio). No Docker mode switching needed! See `DOCKER_HYBRID_SETUP.md` for details.

**Option 3: Docker Windows Containers** (Windows Pro only, ⚠️ **NOT RECOMMENDED**)

```powershell
# Switch Docker Desktop to Windows containers mode first!
# WARNING: This will break all your other Dockerized repos (30+ projects)!
docker compose -f docker-compose.windows.yml up -d
```

⚠️ **Docker Desktop can only run ONE container type at a time**. Switching to Windows containers will break all your Linux-based Docker projects. See `DOCKER_WINDOWS_GUIDE.md` for details.

**Recommendation**: Use Option 1 (PowerShell script) for local dev, or Option 2 (hybrid) if you want Docker for the web server.

## Backend Servers

Three Python servers run the AI engines:

- `stockfish-server.py` - Port 9543 (Chess)
- `shogi-server.py` - Port 9544 (Shogi)
- `go-server.py` - Port 9545 (Go)
- `multiplayer-server.py` - Port 9877 (WebSocket multiplayer)

Web server: Port 9876

## Features

- Difficulty levels for most games
- Japanese crossword puzzles (Hiragana)
- Crossword import (.puz, .json files)
- Scrabble education center with strategy guides
- Changeable chess piece sets (Classic/Modern/Emoji)
- Move sounds for AI opponents
- Multiplayer support:
  - **WebSocket server** (local network only) - `multiplayer-server.py`
  - **Firebase** (internet play) - See `FIREBASE_SETUP_GUIDE.md`
- ScummVM integration for classic adventure games

## Notes

- Built entirely with Cursor IDE's auto-agent in ~4 hours
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
├── data/               # Game data (openings, puzzles, etc.)
├── stockfish/          # Chess AI engine
├── yaneuraou/          # Shogi AI engine
├── katago/             # Go AI engine
├── *-server.py         # AI backend servers
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

**Made in ~4 hours. Not changing the world, just playing games.**
