# Technical Documentation

## Stack Overview

### Frontend
- **Pure vanilla JavaScript** - No frameworks (React, Vue, etc.)
- **HTML5/CSS3** - Standard web technologies
- **Canvas API** - For arcade games (Pac-Man, Snake, Tetris, etc.)
- **Web Audio API** - Move sounds and game audio
- **Web Speech API** - Tongue twister voice recognition/synthesis
- **Responsive CSS Grid** - Layout and game boards

### Backend
- **Python 3.8+** - Backend API servers
- **aiohttp** - Async HTTP server framework
- **asyncio** - Asynchronous I/O
- **aiohttp-cors** - CORS support for browser communication
- **subprocess** - Engine process management

### AI Engines

#### 1. Stockfish 16 (Chess)
- **Type**: C++ binary
- **Strength**: ~3500 ELO (Grandmaster level)
- **Protocol**: UCI (Universal Chess Interface)
- **Backend**: `stockfish-server.py` (port 9543)
- **Size**: 66.93 MB
- **Platform**: Windows x86-64-avx2
- **Integration**: Python subprocess → UCI commands → JSON API

#### 2. YaneuraOu v9.10 (Shogi)
- **Type**: C++ binary
- **Strength**: World championship level
- **Protocol**: USI (Universal Shogi Interface)
- **Backend**: `shogi-server.py` (port 9544)
- **Features**: SFEN position support, difficulty levels
- **Integration**: Python subprocess → USI commands → JSON API

#### 3. KataGo v1.15.3 (Go)
- **Type**: C++ binary with neural network
- **Strength**: AlphaGo level
- **Protocol**: GTP (Go Text Protocol)
- **Backend**: `go-server.py` (port 9545)
- **Features**: Territory scoring, capture detection
- **Integration**: Python subprocess → GTP commands → JSON API

#### 4. Minimax AI (Various)
- **Type**: Pure JavaScript
- **Games**: Gomoku, Checkers, Mühle, Connect Four
- **Algorithm**: Minimax with alpha-beta pruning
- **Depth**: 4-12 ply depending on game complexity
- **Implementation**: Client-side only (no backend needed)

## Architecture

### Request Flow (Chess Example)

```
User makes move in browser
    ↓
JavaScript updates board state
    ↓
Generate FEN position string
    ↓
HTTP POST to http://localhost:9543/api/move
    ↓
stockfish-server.py receives request
    ↓
Python sends UCI commands to Stockfish binary
    ↓
Stockfish calculates best move
    ↓
Python parses UCI response
    ↓
JSON response with move (e.g., "e2e4")
    ↓
JavaScript parses and executes move
    ↓
Board updates, sound plays, AI thinking flag resets
```

### Backend API Endpoints

**Stockfish (port 9543):**
- `GET /api/status` - Check if engine is ready
- `POST /api/move` - Get best move for position
  - Body: `{fen, skill, depth, movetime}`
  - Response: `{success, move, engine, time}`

**YaneuraOu (port 9544):**
- `GET /api/status` - Check if engine is ready
- `POST /api/move` - Get best move for position
  - Body: `{sfen, skill, depth, movetime}`
  - Response: `{success, move, engine, time}`

**KataGo (port 9545):**
- `GET /api/status` - Check if engine is ready
- `POST /api/move` - Get best move for position
  - Body: `{board, size, komi, visits}`
  - Response: `{success, move, winrate, engine, time}`

## Game Implementations

### Board Games
- **Chess**: Standard rules, UCI move notation, FEN positions
- **Shogi**: Japanese chess, USI protocol, SFEN positions
- **Go**: 19×19 board, territory scoring, GTP protocol
- **Gomoku**: 15×15 board, 5-in-a-row win condition
- **Checkers**: Solved game (perfect play = draw), capture chains
- **Connect Four**: 6×7 grid, gravity-based drops
- **Mühle**: Three phases (placement, movement, flying), mill detection

### Arcade Games
- **Pac-Man**: 5-point collision detection, ghost AI with pathfinding
- **Snake**: Grid-based movement, collision detection
- **Tetris**: 7 tetromino shapes, line clearing, rotation
- **Breakout**: Paddle physics, brick collision
- **Pong**: Two-player or vs AI, ball physics
- **Frogger**: Traffic dodging, river crossing
- **Q*bert**: Isometric pyramid, color changing

### Puzzle Games
- **Sudoku**: 9×9 grid, 3 difficulty levels, validation
- **Word Search**: Dynamic generation, 3 grid sizes (10×10, 15×15, 20×20)
- **Scrabble**: 15×15 board, premium squares, dictionary validation, AI opponent
- **Crossword**: English + Japanese (Hiragana), import .puz/.json files
- **KenKen**: Math logic cages, 3×3 to 6×6 grids
- **24 Game**: Make 24 from 4 numbers, auto-solver

### Japanese Learning
- **Yojijukugo**: Complete 4-character kanji idioms, 18 idioms, 3 difficulty levels

### Text Adventures
- **Parser-based** interactive fiction
- **Inventory system** with item descriptions
- **Multiple adventures**: ZORK, Enchanted Castle, Lost in Space
- **Classic commands**: north/n, take, examine, use, etc.

## Development

### Built With Cursor IDE

**What is Cursor IDE?**

Cursor is an AI-first code editor built on VSCode. It integrates large language models directly into the development workflow, offering features like:
- **Composer**: Multi-file editing with AI
- **Auto-agent**: Autonomous coding agent that writes, debugs, and refactors code
- **Chat**: Codebase-aware AI assistant
- **Tab completion**: Context-aware code suggestions
- **Terminal integration**: AI can run commands and read output

**Why Cursor for This Project?**
- Auto-agent mode handled most of the coding autonomously
- Minimal developer input (just pointing out bugs and requesting features)
- Fast iteration (4 hours for 26 games)
- No context switching between editor and AI tool

### Competitors (Agentic IDEs)

**Cursor:**
- AI-first editor (VSCode fork)
- Composer + Auto-agent modes
- Multi-file editing with AI
- https://cursor.sh/

**Windsurf (Codeium):**
- Similar AI-first approach
- "Flows" feature for agentic coding
- Free tier available
- VSCode-based
- https://codeium.com/windsurf

**Antigravity IDE:**
- New entrant (November 2025)
- Agentic coding focus
- Competitive with Cursor/Windsurf
- https://antigravity.com/

**Zed:**
- Performance-focused editor (Rust-based)
- AI assistant integration
- Ultra-fast, minimal
- Multiplayer editing
- https://zed.dev/

**Aider:**
- CLI-based AI pair programmer
- Works with your existing editor
- Git-aware, can commit autonomously
- Supports multiple LLMs
- https://aider.chat/

**Note:** GitHub Copilot is not listed - it's autocomplete, not agentic coding. Different league.

### Token Usage & Cost

**This Project:**
- **Tokens used**: ~189,000 tokens
- **Time**: 4 hours
- **Efficiency**: ~47k tokens/hour, ~7.3k tokens/game

**Cost Breakdown (if not free tier):**
- **Gemini 3 (free)**: $0
- **Claude Sonnet 4.5**: ~$0.57 (at $3/M input tokens)
- **GPT-4**: ~$1.89 (at $10/M input tokens)

**Actual cost**: $0 (Gemini free tier)

### Development Stats
- **Time**: ~4 hours total
- **LLM**: Probably Gemini 3 (free tier)
- **Cost**: $0
- **Commits**: 30+
- **Files**: 80+
- **Lines of code**: ~15,000
- **Games**: 26
- **AI engines**: 4

### Development Process
1. Started with basic HTML/CSS/JS structure
2. Added games one by one
3. Integrated real AI engines (Stockfish, YaneuraOu, KataGo)
4. Fixed bugs as they appeared
5. Added education centers and features
6. Dockerized the whole thing

### Key Technical Decisions

**Why vanilla JS?**
- Fast to develop
- No build step
- No dependencies
- Works everywhere

**Why Python backends for AI?**
- Engine binaries use stdin/stdout protocols
- Python subprocess management is simple
- Async IO works well for multiple concurrent requests
- aiohttp is lightweight and fast

**Why Docker?**
- One command to start everything
- Consistent environment
- Easy to deploy anywhere

## Known Limitations

- Crossword API downloads require CORS proxy (opens websites for manual download instead)
- Multiplayer requires Firebase configuration
- AI engines are Windows binaries only (Linux/Mac need recompilation)
- No move validation for complex chess rules (castling, en passant)
- Scrabble dictionary is limited (~1000 words)
- Some games lack full rule implementations

## Performance

- **Stockfish**: 200ms - 2.1s per move (configurable)
- **YaneuraOu**: ~500ms per move
- **KataGo**: ~1-2s per move (depends on visits)
- **Client-side AI**: Instant to 2s (depends on depth)
- **Web server**: Standard Python http.server (not production-grade)

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Edge**: Full support
- **Safari**: Mostly works (speech API limited)
- **Mobile**: Works but not optimized

## File Sizes

- **Total**: ~148 MB
- **Stockfish**: 66.93 MB
- **YaneuraOu**: ~50 MB
- **KataGo**: ~20 MB
- **Game code**: ~2 MB

## Future Ideas (Not Implemented)

- More crossword sources
- Online multiplayer matchmaking
- Replay system for board games
- Game analysis with AI
- Mobile-optimized UI
- Progressive Web App (PWA)
- More languages (German, Italian, etc.)

But honestly, this is fine as-is. It's a games collection, not a startup.

## CI/CD?

**No.** This is overkill for a 4-hour hobby project. Just push to GitHub and call it a day.

If you really want it:
- GitHub Actions could run `docker compose build` on push
- Could auto-deploy to a VPS or GitHub Pages (static files only)
- Could run tests... if there were tests

But for what? This isn't a production service. It's games. Just play them.

---

## Resources & Links

### Cursor IDE & AI Development

**Cursor Resources:**
- Official site: https://cursor.sh/
- Documentation: https://docs.cursor.sh/
- Community forum: https://forum.cursor.sh/

**Flow Coding & AI-Assisted Development:**
- Anthropic Claude for coding: https://www.anthropic.com/claude
- The rise of AI coding assistants: https://stackoverflow.blog/2023/06/14/hype-or-not-developers-have-something-to-say-about-ai/
- GitHub's research on AI pair programming: https://github.blog/2022-09-07-research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/

**Comparisons & Reviews:**
- Cursor vs Windsurf vs Copilot: https://news.ycombinator.com/item?id=42180649
- AI coding tools roundup (2024): https://www.codium.ai/blog/ai-coding-assistants-comparison/

**Learning AI Development:**
- Building with LLMs: https://www.anthropic.com/research
- Prompt engineering guide: https://platform.openai.com/docs/guides/prompt-engineering

### Game AI Resources

**Chess Engines:**
- Stockfish: https://stockfishchess.org/
- UCI protocol: https://www.chessprogramming.org/UCI

**Shogi Engines:**
- YaneuraOu: https://github.com/yaneurao/YaneuraOu
- USI protocol: https://www.glaurungchess.com/shogi/usi.html

**Go Engines:**
- KataGo: https://github.com/lightvector/KataGo
- GTP protocol: https://www.lysator.liu.se/~gunnar/gtp/gtp2-spec-draft2/gtp2-spec.html

---

**Questions?** Open an issue on GitHub. Or don't. Whatever.


