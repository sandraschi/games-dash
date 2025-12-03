# Resources & Dependencies

**Last Updated**: 2025-12-03

---

## JavaScript Libraries

### Chess Engines & Tools

| Library | Version | Size | Purpose | URL |
|---------|---------|------|---------|-----|
| **stockfish.js** | 16+ | ~2MB | Chess engine (WASM) | https://github.com/nmrugg/stockfish.js |
| **chess.js** | 1.0.0 | ~50KB | Move generation/validation | https://github.com/jhlywa/chess.js |
| **chessboard.js** | 1.0.0 | ~30KB | Board UI (optional) | https://github.com/oakmac/chessboardjs |
| **Lc0.js** | Latest | ~50MB | Neural network engine (optional) | https://github.com/frpays/lc0.js |

### AI/ML Libraries (Optional)

| Library | Version | Size | Purpose | URL |
|---------|---------|------|---------|-----|
| **TensorFlow.js** | 4.x | ~500KB | Neural networks | https://www.tensorflow.org/js |
| **Brain.js** | 2.x | ~100KB | Simple neural networks | https://github.com/BrainJS/brain.js |

### Utilities

| Library | Version | Size | Purpose | URL |
|---------|---------|------|---------|-----|
| **Lodash** | 4.17.21 | ~70KB | Utility functions | https://lodash.com/ |
| **Axios** | 1.x | ~15KB | HTTP client | https://axios-http.com/ |

---

## CDN Links

### Stockfish.js

```html
<!-- Via CDN -->
<script src="https://cdn.jsdelivr.net/npm/stockfish.js@16/stockfish.js"></script>

<!-- Via NPM -->
<script type="module">
  import STOCKFISH from 'stockfish.js';
  const engine = STOCKFISH();
</script>
```

### Chess.js

```html
<!-- Via CDN -->
<script src="https://cdn.jsdelivr.net/npm/chess.js@1.0.0/chess.js"></script>

<!-- Via NPM -->
<script type="module">
  import { Chess } from 'chess.js';
  const chess = new Chess();
</script>
```

### TensorFlow.js

```html
<!-- Via CDN -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.0.0/dist/tf.min.js"></script>
```

---

## Download Links

### Chess Engines

**Stockfish WASM**:
- Repository: https://github.com/nmrugg/stockfish.js
- Direct download: https://github.com/nmrugg/stockfish.js/releases
- Files needed:
  - `stockfish.js` (engine wrapper)
  - `stockfish.wasm` (compiled engine)

**Leela Chess Zero**:
- Main site: https://lczero.org/
- Web version: https://github.com/frpays/lc0.js
- Networks: https://training.lczero.org/networks/
  - Recommended: `768x15x24h-t82-2` (~50MB)
  - Smaller: `192x15_network` (~20MB)

### Game Databases

**PGN Collections**:
- TWIC (This Week in Chess): https://theweekinchess.com/twic
- PGN Mentor: https://www.pgnmentor.com/files.html
- Lichess Database: https://database.lichess.org/

**Opening Books**:
- Polyglot format: http://hgm.nubati.net/book_format.html
- Stockfish opening book: https://github.com/official-stockfish/books

**Tablebase**:
- Syzygy 7-piece: https://syzygy-tables.info/
- Note: ~150GB, not practical for web app

---

## API Documentation

### Chess.com Public API

**Base URL**: `https://api.chess.com/pub`

**Endpoints**:
```
GET /player/{username}                    # Player profile
GET /player/{username}/stats              # Player statistics
GET /player/{username}/games/{YYYY}/{MM}  # Monthly games
GET /player/{username}/games/archives     # Game archives list
GET /player/{username}/clubs              # Player's clubs
GET /player/{username}/matches            # Player's matches
GET /player/{username}/tournaments        # Player's tournaments
GET /titled/{title}                       # Players with title
GET /leaderboards                         # Top players
```

**Rate Limits**:
- No official rate limit
- Recommended: 1 request per second
- Use caching extensively

**Example Response** (Player Profile):
```json
{
  "@id": "https://api.chess.com/pub/player/magnuscarlsen",
  "url": "https://www.chess.com/member/MagnusCarlsen",
  "username": "MagnusCarlsen",
  "player_id": 12345,
  "title": "GM",
  "status": "premium",
  "name": "Magnus Carlsen",
  "avatar": "https://images.chesscomfiles.com/...",
  "location": "Norway",
  "country": "NO",
  "joined": 1341091200,
  "last_online": 1701648000,
  "followers": 250000,
  "is_streamer": true,
  "twitch_url": "...",
  "fide": 2830
}
```

### Lichess API

**Base URL**: `https://lichess.org/api`

**Endpoints**:
```
GET /api/user/{username}                  # User profile
GET /api/user/{username}/rating-history   # Rating history
GET /api/games/user/{username}            # User games (PGN stream)
GET /api/puzzle/daily                     # Daily puzzle
GET /api/opening/explorer                 # Opening explorer
GET /api/tablebase/standard               # Tablebase lookup
POST /api/cloud-eval                      # Cloud analysis
```

**Authentication**: OAuth2 (optional for personal data)

**Rate Limits**:
- Authenticated: 50 requests/minute
- Unauthenticated: 10 requests/minute

---

## Dataset Resources

### Famous Games Collection

**Source 1: PGN Mentor**
- URL: https://www.pgnmentor.com/files.html
- Collection: "Best Games" (100+ games)
- Format: PGN
- License: Free for personal use

**Source 2: Chessgames.com**
- URL: https://www.chessgames.com/
- Collection: 900,000+ games
- API: Available for premium members
- Alternative: Manual collection of famous games

**Curated List** (Implemented in `data/chess/famous-games.json`):

1. **Romantic Era** (1850-1900):
   - The Immortal Game (1851)
   - The Evergreen Game (1852)
   - Opera Game (1858)

2. **Classical Era** (1900-1945):
   - Steinitz vs. von Bardeleben (1895)
   - Lasker vs. Bauer (1889)
   - Capablanca vs. Marshall (1918)

3. **Modern Era** (1945-2000):
   - Byrne vs. Fischer (1956) - "Game of the Century"
   - Fischer vs. Spassky, Game 6 (1972)
   - Karpov vs. Kasparov (1985)

4. **Contemporary Era** (2000-present):
   - Kasparov vs. Topalov (1999)
   - Carlsen vs. Anand (2013)
   - AlphaZero games (2017-2018)

### Puzzle Databases

**Lichess Puzzle Database**:
- URL: https://database.lichess.org/#puzzles
- Size: 3+ million puzzles
- Format: CSV
- Download: https://database.lichess.org/lichess_db_puzzle.csv.bz2

**Chess.com Puzzles**:
- Access via API (random puzzle endpoint)
- Requires scraping or premium access for bulk

### Word Lists

**For Word Search/Crossword**:
- English word list: https://github.com/dwyl/english-words
- Size: 466k words
- Format: JSON/TXT
- Filter by length and frequency

**Themed Word Lists**:
```javascript
// In data/wordlists/themes.json
{
  "animals": ["ELEPHANT", "GIRAFFE", ...],
  "countries": ["AUSTRIA", "GERMANY", ...],
  "technology": ["COMPUTER", "SOFTWARE", ...],
  "food": ["PIZZA", "PASTA", ...],
  "sports": ["FOOTBALL", "BASKETBALL", ...]
}
```

---

## Development Tools

### Code Editors

- **VS Code**: https://code.visualstudio.com/
  - Extensions:
    - Live Server
    - ESLint
    - Prettier
    - JavaScript Debugger

### Testing Tools

- **Jest**: https://jestjs.io/
- **Playwright**: https://playwright.dev/ (E2E testing)
- **Lighthouse**: Performance testing

### Build Tools (Optional)

- **Vite**: https://vitejs.dev/ (fast dev server)
- **Webpack**: https://webpack.js.org/ (bundler)
- **Rollup**: https://rollupjs.org/ (ES module bundler)

### Version Control

- **Git**: https://git-scm.com/
- **GitHub**: https://github.com/
- **GitHub Pages**: Free hosting

---

## Learning Resources

### Chess Programming

**Websites**:
- Chess Programming Wiki: https://www.chessprogramming.org/
- Stockfish Docs: https://github.com/official-stockfish/Stockfish/wiki
- Lichess API Docs: https://lichess.org/api

**Books**:
- "Programming a Chess Engine in C" by BlueFever Software
- "Chess Programming Wiki" (online)

**YouTube Channels**:
- Sebastian Lague - "Coding Adventure: Chess AI"
- Blunder - "How Chess Engines Work"

### Game AI

**Websites**:
- AI for Games: http://www.gameaipro.com/
- Minimax Tutorial: https://www.neverstopbuilding.com/blog/minimax
- A* Pathfinding: https://www.redblobgames.com/pathfinding/a-star/

**Papers**:
- "Mastering Chess and Shogi by Self-Play" (AlphaZero)
- "Temporal Difference Learning and TD-Gammon"
- "Pierre Dellacherie Algorithm" (Tetris AI)

### JavaScript Game Development

**Websites**:
- MDN Game Development: https://developer.mozilla.org/en-US/docs/Games
- HTML5 Game Devs: https://html5gamedevs.com/
- Phaser.io: https://phaser.io/ (game framework)

---

## Asset Resources

### Fonts

**Google Fonts**:
- Roboto: Modern sans-serif
- Montserrat: Geometric sans-serif
- Source Code Pro: Monospace for code

```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
```

### Icons

**Unicode Chess Pieces**:
```
White: ♔ ♕ ♖ ♗ ♘ ♙ (U+2654 to U+2659)
Black: ♚ ♛ ♜ ♝ ♞ ♟ (U+265A to U+265F)
```

**Shogi Pieces** (Unicode):
```
王 (King), 飛 (Rook), 角 (Bishop), 金 (Gold)
銀 (Silver), 桂 (Knight), 香 (Lance), 歩 (Pawn)
```

**Emoji Icons**:
```
🎮 🎯 🎲 ♟️ 🐍 🟦 ⚫ 🔴 👾 🏓
```

### Sound Effects (Optional)

**Free Sources**:
- Freesound.org: https://freesound.org/
- Zapsplat: https://www.zapsplat.com/
- OpenGameArt: https://opengameart.org/

**Chess Sounds**:
- Piece move
- Piece capture
- Check notification
- Checkmate fanfare

---

## Browser Compatibility

### Required Features

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| ES6 Modules | 61+ | 60+ | 11+ | 79+ |
| Web Workers | ✓ | ✓ | ✓ | ✓ |
| WASM | 57+ | 52+ | 11+ | 16+ |
| Canvas 2D | ✓ | ✓ | ✓ | ✓ |
| IndexedDB | ✓ | ✓ | ✓ | ✓ |
| LocalStorage | ✓ | ✓ | ✓ | ✓ |
| Fetch API | 42+ | 39+ | 10.1+ | 14+ |

**Recommended**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Performance Benchmarks

### Target Metrics

**Chess AI** (Stockfish depth 10):
- Desktop: < 500ms per move
- Mobile: < 2000ms per move

**Tetris AI** (Dellacherie):
- Evaluation speed: 10,000+ positions/sec
- Real-time play: 100+ pieces/sec

**Rendering**:
- 60 FPS on desktop
- 30 FPS minimum on mobile
- < 5ms frame time budget

---

## License Information

### Open Source Engines

**Stockfish**:
- License: GPL v3
- Commercial use: Allowed with GPL compliance
- Source: https://github.com/official-stockfish/Stockfish

**Lc0**:
- License: GPL v3
- Networks: Public domain
- Source: https://github.com/LeelaChessZero/lc0

**Chess.js**:
- License: BSD-2-Clause
- Commercial use: Allowed
- Source: https://github.com/jhlywa/chess.js

### Project License

Recommend: **MIT License** for maximum flexibility

```
MIT License

Copyright (c) 2025 Sandra Schipal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Installation Commands

### NPM Setup (Optional)

```powershell
# Initialize project
npm init -y

# Install development dependencies
npm install -D vite jest @testing-library/jest-dom

# Install runtime dependencies
npm install chess.js axios

# Install optional AI libraries
npm install @tensorflow/tfjs brain.js
```

### Python Server (Simple)

```powershell
# Start local server
python -m http.server 8080

# Or use Node.js http-server
npx http-server -p 8080
```

---

## Useful Scripts

### Download Stockfish

```powershell
# Download stockfish.js
Invoke-WebRequest -Uri "https://github.com/nmrugg/stockfish.js/releases/latest/download/stockfish.js" -OutFile "js/engines/stockfish.js"
Invoke-WebRequest -Uri "https://github.com/nmrugg/stockfish.js/releases/latest/download/stockfish.wasm" -OutFile "js/engines/stockfish.wasm"
```

### Generate Wordlist

```javascript
// generate-wordlist.js
const fs = require('fs');
const words = require('an-array-of-english-words');

const themes = {
  animals: words.filter(w => animalWords.includes(w.toUpperCase())),
  countries: words.filter(w => countryWords.includes(w.toUpperCase()))
};

fs.writeFileSync('data/wordlists/themes.json', JSON.stringify(themes, null, 2));
```

---

Ready to start implementing! All resources documented and ready to use. 🚀

