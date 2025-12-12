# Changelog

All notable changes to this project will be documented in this file.

## [1.4.0] - 2025-12-12

### Major Game Expansion: Casino Games & New Board Games

**New Casino Games Added (3):**
- **Blackjack** - Complete card game vs dealer with betting, card counting education, and strategy guide
- **Roulette** - European wheel with 37 numbers, bet types (straight, split, corner, street, sixline, dozen, column, red/black, even/odd, high/low), and house edge analysis
- **Baccarat** - High-stakes card game with banker/player/tie bets, Punto Banco rules, and detailed strategy guide

**New Board Games Added (4):**
- **Reversi/Othello** - Strategy board game with complete rule implementation and AI opponent
- **Rummy** - Classic card game with sets/runs, multiple variants, and scoring system
- **Canasta** - Advanced rummy variant with partnerships, melds, and complex scoring
- **Halma** - Strategy board game (Chinese Checkers) with multiple board sizes and AI

**New Help Pages (8):**
- `blackjack-education.html` - Rules, strategy, history, and card counting basics
- `roulette-education.html` - Wheel mechanics, bet types, odds, and optimal play
- `baccarat-education.html` - Punto Banco rules, strategy, and house edge analysis
- `reversi-education.html` - Game rules, strategy, and famous players
- `rummy-education.html` - Rules, variations, and scoring systems
- `canasta-education.html` - Partnership rules, melds, and advanced tactics
- `halma-education.html` - Movement rules, strategy, and board variations
- Updated `craps-education.html` and `cho-han-education.html` with improved content

**UI Improvements:**
- Added "Casino Games" section to main index with dedicated category
- Added "Back to Games" buttons to all games for better navigation
- Updated game counter badges throughout the interface
- Enhanced category navigation with casino games filter

**Total Games:** 60 → 69

### Critical Bug Fixes

**Mensch ärgere dich nicht! (German Ludo):**
- Fixed JavaScript syntax error: removed duplicate `const piecesInBase` declaration
- Fixed board rendering issues with proper Konva.js initialization
- Added retry logic for Konva library loading
- Improved error handling and initialization checks

**Word Search:**
- Fixed grid generation failing on smaller sizes due to invalid random position ranges
- Added `Math.max(0, ...)` bounds checking to prevent negative ranges
- Improved initialization timing with DOM ready checks
- Added retry logic for grid generation failures

**Spider Solitaire:**
- Fixed easy/medium difficulty detection by adding suit matching requirement
- Corrected `canPlaceOnTableau()` function to check `card.suit === topCard.suit`
- Now properly enforces same-suit descending sequence rule

**Mühle (Nine Men's Morris):**
- Added DOM element existence checks before rendering
- Improved initialization timing to prevent rendering on incomplete DOM
- Enhanced error handling for board setup

**General:**
- Added comprehensive "Back to Games" navigation buttons to all game pages
- Improved cross-browser compatibility and error handling
- Enhanced console logging for debugging

### Testing Framework

**New Testing Infrastructure:**
- Added `vitest.config.js` configuration file
- Created comprehensive test suites for game logic
- Added `package.json` with test scripts and dependencies
- Created `tests/` directory with game-specific test files
- Added GitHub Actions workflow for automated testing

**Test Coverage:**
- Game logic validation for multiple games
- Move validation and win condition testing
- Puzzle mechanics and scoring verification
- Web app functionality tests

### Technical Improvements

**Code Quality:**
- Fixed all JavaScript syntax errors and duplicate declarations
- Improved error handling and initialization flows
- Enhanced DOM manipulation with proper checks
- Added comprehensive console logging for debugging

**Performance:**
- Optimized game loading and initialization
- Improved memory management for Konva.js rendering
- Enhanced async operations and timeout handling

**Development:**
- Added GitHub Actions CI/CD workflow
- Improved project structure and organization
- Enhanced documentation and code comments

## [1.3.4] - 2025-12-02

### Rubik's Cube Variety Switching & Reduction Method Solvers

**New Features:**
- **Cube Variety Support**: Switch between 2×2×2, 3×3×3, 4×4×4, and 5×5×5 cubes
- **Reduction Method Solvers**: Implemented optimal solving algorithms for 4×4 and 5×5 cubes
  - Phase 1: Solve centers (6 faces)
  - Phase 2: Pair edges (12 edges)
  - Phase 3: Solve as 3×3 (with parity fixes)
- **Wide Move Support**: Full support for wide moves (Rw, Uw, etc.) essential for larger cubes
- **Dynamic Camera**: Camera automatically adjusts distance based on cube size
- **Size-Agnostic Rendering**: Cubelet identification and face detection work for all sizes

**Technical Improvements:**
- Refactored `createCube()` to dynamically generate cubelets for any size
- Updated `getCubeletsForFace()` to work with size-agnostic indices
- Enhanced `rotateFace()` to support wide moves and layer parameters
- Added `getCubeletsForWideMove()` for proper wide move handling
- Unified solution execution through `executeSolution()` function
- Clean code structure with no duplication

**Code Quality:**
- Removed duplicate execution logic from `solve4x4()` and `solve5x5()`
- Consistent solver architecture across all cube sizes
- Framework ready for future algorithm enhancements

## [1.3.3] - 2025-12-02

### Xiangqi (Chinese Chess) Fixes and AI Implementation

**Critical Board Rendering Fixes:**
- Fixed board collapsing to width/height 1px by:
  - Adding explicit CSS Grid template rows/columns
  - Setting explicit board dimensions (586px × 644px) with `!important` flags
  - Adding `grid-row` and `grid-column` positioning for each cell
  - Ensuring proper cell sizing with `min-width`, `max-width`, `flex-shrink: 0`
- Fixed JavaScript syntax errors:
  - Removed duplicate `catch` block
  - Fixed emoji encoding issues
  - Fixed quote escaping in strings
- Added robust error handling and initialization
- Added console logging for debugging

**AI Implementation:**
- **AI Player:** Black (human plays Red)
- **Move Evaluation System:**
  - Piece values: General (1000), Rook (9), Cannon (4.5), Horse (4), Elephant/Advisor (2), Pawn (1)
  - Check detection: +50 points
  - Center control: +0.5 points
  - Pawn advancement bonuses
- **Move Selection:**
  - Evaluates all valid moves for all AI pieces
  - Sorts by score, selects from top 3 with randomness
  - Only considers legal moves (doesn't leave own general in check)
- **AI Functions:**
  - `getAllValidMoves(row, col)`: Returns all legal moves
  - `evaluateMove(fromRow, fromCol, toRow, toCol)`: Scores move quality
  - `aiTurn()`: Main AI function

**Technical Improvements:**
- Proper error handling with try-catch blocks
- Improved DOM ready checking
- Better initialization flow
- Clean code organization

## [1.3.2] - 2025-12-02

### Ticket to Ride Major Expansion

**Game Improvements:**
- **Expanded Map:** Increased from 10 cities to **37 cities** covering all of North America
- **Expanded Routes:** Increased from 8 routes to **80+ routes** with proper connections
- **Destination Tickets:** Added destination ticket system with 30+ ticket combinations
- **Pathfinding:** Implemented route completion checking for destination tickets
- **Better Scoring:** Proper point values based on route length (1-15 points)
- **Route Colors:** Added all 8 colors (red, blue, green, yellow, orange, pink, white, black) plus gray and wild cards

**Documentation Added:**
- **Ticket to Ride Education Page** (`ticket-to-ride-education.html`) - Comprehensive help/history page covering:
  - History (Alan R. Moon 2004, Spiel des Jahres winner, gateway game)
  - Complete game rules (setup, gameplay, scoring, end game)
  - Strategy & tips (destination tickets, route claiming, card management)
  - Game variants & editions (Europe, Nordic Countries, Rails & Sails, map collections, city versions)
  - Cultural impact and reception
  - Tips for beginners
- Added "📚 Learn & History" button to `ticket-to-ride.html` linking to education page

**Features:**
- Cities positioned accurately on North America map
- Double routes where applicable (two parallel routes between same cities)
- Destination ticket display with completion status
- Proper route claiming with color matching
- Game end detection and final scoring

## [1.3.1] - 2025-12-02

### Risk Education Page

**Documentation Added:**
- **Risk Education Page** (`risk-education.html`) - Comprehensive help/history page covering:
  - History (Albert Lamorisse 1957, Parker Brothers, evolution through themed versions)
  - Complete game rules (42 territories, 6 continents, gameplay phases, combat system, Risk cards)
  - Strategy & tactics (continent priorities, attack/defense, chokepoints)
  - Game variants (Secret Mission, 2210 A.D., themed versions)
  - Complete territories reference (all 42 territories organized by continent)
  - Tips for beginners
  - Cultural impact
- Added "📚 Learn & History" button to `risk.html` linking to education page

**Features:**
- Styling consistent with other education pages
- Dark theme with gold accents
- Responsive layout
- Complete territory breakdown with continent bonuses

## [1.3.0] - 2025-12-02

### Windows Classic Games Section

**New Games Added:**
- **Solitaire (Klondike)** - Classic solitaire with stock/waste piles, foundation building, and tableau sequences
- **Minesweeper** - Three difficulty levels (Beginner 9x9, Intermediate 16x16, Expert 16x30) with flagging and timer
- **FreeCell** - Strategic solitaire variant with 4 free cells and 8 tableau piles (all games theoretically winnable)
- **Spider Solitaire** - Multi-suit variant with 1, 2, or 4 suit difficulty levels and complete sequence detection
- **Hearts** - 4-player trick-taking card game with AI opponents, card passing, and "shoot the moon" mechanics

**Features:**
- All games fully playable with proper game logic
- Windows Classic aesthetic with "Killing productivity since 1990!" tagline
- Added new "Windows Classic Games" section to main index
- Games integrated into Quick Jump navigation
- No emoji in JavaScript code (text-based alternatives used)

**Total Games:** 55 → 60

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
Built in approximately a day using Cursor IDE auto-agent.

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
- **Development time**: 1 day
- **Cost**: $0
- **LLM used**: Probably Gemini 3
- **Built with**: Cursor IDE auto-agent
- **Developer involvement**: Minimal (pointed out bugs)

---

**Version 1.0.0 - Done. Ship it.**

