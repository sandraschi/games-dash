# Games Collection

A web-based games collection with 26 games, built in about 4 hours using Cursor IDE's auto-agent feature. Cost: essentially nothing (probably Gemini 3).

## What's Included

**26 Games Total:**
- 7 Board Games (Chess, Shogi, Go, Gomoku, Checkers, Connect Four, Mühle)
- 6 Arcade Games (Snake, Tetris, Breakout, Pong, Pac-Man, Frogger, Q*bert)
- 4 Puzzle & Word Games (Sudoku, Word Search, Scrabble, Crossword)
- 2 Math Puzzles (KenKen, 24 Game)
- 1 Japanese Learning Game (Yojijukugo - 四字熟語)
- 2 Card Games (Texas Hold'em, Contract Bridge)
- 2 Party Games (Tongue Twister, Text Adventures)
- 2 Timewasters (Gem Cascade, ScummVM Launcher)

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

**Option 2: Docker**

```powershell
docker compose up -d
```

Opens browser at `http://localhost:9876`

## Backend Servers

Three Python servers run the AI engines:

- `stockfish-server.py` - Port 9543 (Chess)
- `shogi-server.py` - Port 9544 (Shogi)
- `go-server.py` - Port 9545 (Go)

Web server: Port 9876

## Features

- Difficulty levels for most games
- Japanese crossword puzzles (Hiragana)
- Crossword import (.puz, .json files)
- Scrabble education center with strategy guides
- Changeable chess piece sets (Classic/Modern/Emoji)
- Move sounds for AI opponents
- Multiplayer support (Firebase-based, configuration required)
- ScummVM integration for classic adventure games

## Notes

- Built entirely with Cursor IDE's auto-agent in ~4 hours
- No fancy frameworks - vanilla HTML/CSS/JavaScript
- AI backends use asyncio/aiohttp
- Dockerized for easy deployment
- Multiplayer requires Firebase config (see `FIREBASE_SETUP_GUIDE.md`)

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
