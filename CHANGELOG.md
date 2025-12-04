# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-04

### Initial Release
Built in approximately 4 hours using Cursor IDE auto-agent.

### Games Added (26 Total)

**Board Games (7):**
- Chess with Stockfish 16 AI (~3500 ELO)
- Shogi with YaneuraOu v9.10 AI
- Go with KataGo v1.15.3 AI
- Gomoku with Minimax AI
- Checkers with Minimax AI
- Connect Four with Minimax AI
- Mühle (Nine Men's Morris) with AI

**Arcade Games (6):**
- Snake
- Tetris
- Breakout
- Pong
- Pac-Man
- Frogger
- Q*bert

**Puzzle & Word Games (4):**
- Sudoku (3 difficulty levels)
- Word Search (3 grid sizes, 5 themes)
- Scrabble (AI opponent, dictionary validation)
- Crossword (English + Japanese, import support)

**Math Puzzles (2):**
- KenKen (3×3 to 6×6 grids)
- 24 Game (make 24 from 4 numbers)

**Japanese Learning (1):**
- Yojijukugo (四字熟語) - Complete 4-character kanji idioms

**Card Games (2):**
- Texas Hold'em Poker
- Contract Bridge

**Party Games (2):**
- Tongue Twister Challenge (5 languages)
- Text Adventures (ZORK, Enchanted Castle, Lost in Space)

**Timewasters (2):**
- Gem Cascade
- ScummVM Launcher

### Features Added

**Education Centers:**
- Chess education (puzzles, openings, famous games)
- Scrabble education (rules, strategy, high-value words, champions)
- Shogi, Go, Gomoku, Checkers, Mühle, Sudoku education pages

**AI Integration:**
- Real C++ engines (Stockfish, YaneuraOu, KataGo)
- Python backend servers with async I/O
- UCI/USI/GTP protocol implementations
- Difficulty levels for all AI opponents

**Multiplayer (Partial):**
- Firebase authentication
- Lobby system
- Turn-based game framework
- WebRTC support (for real-time games)
- Friends system
- Note: Requires Firebase configuration

**Quality of Life:**
- Dashboard with game statistics
- Move sounds for AI opponents
- Changeable chess piece sets (3 styles)
- Board flip for chess
- Difficulty levels across games
- Progress tracking
- Hint systems

**Language Support:**
- English
- Japanese (Hiragana crosswords, Yojijukugo)
- German tongue twisters
- French tongue twisters
- Spanish tongue twisters

### Bug Fixes

**Chess:**
- Fixed AI hanging after second player move (aiThinkingNow flag not resetting)
- Fixed piece visibility (increased size, added shadow)
- Fixed AI trigger (chessAI → stockfish variable name)

**Pac-Man:**
- Fixed sprites leaving paths and clipping into walls
- Implemented 5-point collision detection
- Added grid snapping when turning
- Adjusted movement speeds

**Q*bert:**
- Fixed rendering glitches (pyramid redrawing)

**Gem Cascade:**
- Fixed black screen on load

**Word Search:**
- Added missing renderGrid() function
- Added mouse hover selection

**Crossword:**
- Fixed puzzle grids to match clues
- Fixed clue numbering conflicts
- Added loadPuzzle() function

**Text Adventures:**
- Changed selection divs to buttons (onclick not working)

**Tongue Twisters:**
- Fixed French pronunciation (uses native fr-FR voice)
- Fixed Spanish pronunciation (uses native es-ES voice)
- Added voice selection priority system

### Technical

**Docker:**
- Dockerfile with Nginx, Python, Supervisor
- docker-compose.yml orchestration
- Volume persistence for AI engines
- Health checks

**Documentation:**
- README.md with badges
- TECHNICAL.md with architecture details
- DOCKER_GUIDE.md
- FIREBASE_SETUP_GUIDE.md
- WEB_SERVER_GUIDE.md

**Backend Servers:**
- stockfish-server.py (port 9543)
- shogi-server.py (port 9544)
- go-server.py (port 9545)
- Web server (port 9876)

**Port Selection:**
- Avoided ports under 9000
- Avoided ports ending in 00
- No conflict with Traefik (8080)

### Known Issues
- Crossword downloads require manual file upload (CORS limitations)
- Multiplayer requires Firebase setup
- Some games lack complete rule implementations
- AI engines are Windows-only binaries

---

## Development Stats

- **Total commits**: 30+
- **Total files**: 80+
- **Lines of code**: ~15,000
- **Development time**: 4 hours
- **Cost**: $0
- **LLM used**: Probably Gemini 3
- **Built with**: Cursor IDE auto-agent
- **Developer involvement**: Minimal (pointed out bugs)

---

**Version 1.0.0 - Done. Ship it.**

