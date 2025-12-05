# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-12-04

### Chess Education Center

**New Endgames Section:**
- Added "Endgames" tab with 10 essential endgame positions
- Interactive board with move navigation (Previous/Next/Reset)
- Covers basic checkmates, tactical endgames, and key concepts
- FEN-based position loading with solution moves

**Famous Games Fixes:**
- Fixed navigation buttons (First, Previous, Next, Last) - now work correctly
- Improved move parsing to filter invalid moves
- Added proper function exposure via window object
- Enhanced move highlighting in move list

### Chess Timer

**Timer Integration Fixed:**
- Timer displays now update correctly when time controls selected
- Added time control presets (Bullet, Blitz, Rapid, Classical)
- Timer starts automatically when new game begins
- Timer switches between players after each move
- Visual feedback: active timer pulses green, low time turns red
- Default set to "No Timer" (displays ∞)

### Multiplayer System

**Major Overhaul - Replaced Firebase with WebSocket:**
- **NEW:** `multiplayer-server.py` - Self-contained WebSocket server (port 9877)
- **NEW:** `multiplayer-simple.js` - Client library (no external dependencies)
- **Removed:** Firebase dependency and configuration requirements
- **Benefits:**
  - No configuration needed (no API keys)
  - Works offline on local network
  - Faster (direct connection)
  - Simpler architecture
- Automatic player matching
- Real-time move synchronization
- Chat support
- Disconnect handling

### Technical

- Added `websockets>=12.0` to requirements.txt
- Improved error handling and logging
- Better function organization and scope management

## [1.1.0] - 2025-12-04

### New Games Added (16 Total)

**Dice Games (3):**
- Yahtzee - Classic dice combination game
- Craps - Casino dice game
- Cho-Han Bakuchi - Japanese dice game (from Yakuza movies)

**Board Games (6):**
- Monopoly - Property buying and trading
- Risk - World domination strategy
- Battleship - Naval combat
- Clue - Mystery solving game
- Settlers of Catan - Resource management
- Ticket to Ride - Train route building
- Carcassonne - Tile placement strategy

**Japanese Games (2):**
- Mahjong - 4-player tile matching game
- Hanafuda (Koi-Koi) - Japanese flower cards

### Improvements

**UI/UX:**
- Added category navigation dropdown for quick jumping to game sections
- Fixed Rubik's Cube black squares (changed to dark grey to avoid looking like holes)

**Chess Education:**
- Added interactive chess blunders page with famous mistakes

**Shogi:**
- Fixed piece symbol visibility (black text on light background)

**Snake:**
- Slowed down game speed (1 second per move instead of 0.2 seconds)

**Mensch ärgere dich nicht!:**
- Fixed stacking rules (no two pieces on same space)
- Fixed mandatory piece movement from base on rolling 6
- Fixed home stretch length (4 positions instead of 5)
- Fixed win condition (no center target, all pieces in home stretch)

### Technical

- All Python files pass ruff linting
- Updated documentation to reflect 55 total games

## [1.0.0] - 2025-12-04

### Initial Release
Built in approximately 4 hours using Cursor IDE auto-agent.

### Games Added (39 Total - Initial Release)

**Board Games (11):**
- Chess with Stockfish 16 AI (~3500 ELO)
- 3D Chess (beautiful 3D board)
- Shogi with YaneuraOu v9.10 AI
- Go with KataGo v1.15.3 AI
- Gomoku with Minimax AI
- Checkers with Minimax AI
- Connect Four with Minimax AI
- Mühle (Nine Men's Morris) with AI
- Ludo (race to the finish)
- Mensch ärgere dich nicht! (German classic)
- Snakes & Ladders

**Arcade Games (8):**
- Snake
- Tetris
- Breakout
- Pong
- Pac-Man
- Frogger
- Q*bert
- Asteroids

**Puzzle & Word Games (8):**
- Sudoku (3 difficulty levels)
- Word Search (3 grid sizes, 5 themes)
- Scrabble (AI opponent, dictionary validation)
- Crossword (English + Japanese, import support)
- Pentomino (12-piece tile puzzle)
- Dominoes
- Memory (match pairs)
- Rubik's Cube (3D + auto-solver)

**Math Puzzles (2):**
- KenKen (3×3 to 6×6 grids)
- 24 Game (make 24 from 4 numbers)

**Japanese Learning (3):**
- Yojijukugo (四字熟語) - Complete 4-character kanji idioms
- Karuta (かるた) - Speed card matching
- Kanji Stroke Order - Learn to write kanji

**Card Games (4):**
- Texas Hold'em Poker
- Contract Bridge
- Old Maid
- Schnapsen (Austrian classic)

**Party Games (2):**
- Tongue Twister Challenge (5 languages)
- Text Adventures (ZORK, Enchanted Castle, Lost in Space)

**Classic Adventures (1):**
- ScummVM Launcher (LucasArts, Sierra, and more)

**Timewasters (1):**
- Gem Cascade (match-3, addictive!)

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

