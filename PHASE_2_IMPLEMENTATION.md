# Phase 2 Implementation Guide

**Start Date**: 2025-12-03  
**Target Completion**: 2 weeks  
**Status**: Planning

---

## Week 1: New Games (Pac-Man, Frogger, Q*bert, Sudoku, Word Search)

### Day 1-2: Pac-Man

**File Structure**:
```
pacman.html
js/pacman/
├── game.js          # Main game logic
├── maze.js          # Maze layout and collision
├── pacman.js        # Player character
├── ghost.js         # Ghost AI base class
├── ghosts/
│   ├── blinky.js    # Red ghost (chaser)
│   ├── pinky.js     # Pink ghost (ambusher)
│   ├── inky.js      # Cyan ghost (patrol)
│   └── clyde.js     # Orange ghost (random)
└── constants.js     # Game constants
```

**Implementation Steps**:
1. Create maze grid (28x31 tiles, 8px each)
2. Implement Pac-Man movement with wall collision
3. Implement dot collection
4. Create ghost base class with state machine
5. Implement each ghost's unique AI
6. Add power pellets and ghost vulnerability
7. Add score system and lives
8. Add fruit bonuses
9. Add level progression
10. Polish animations and effects

**Key Code Snippets**:

```javascript
// Ghost AI State Machine
class Ghost {
  constructor(x, y, color, personality) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.personality = personality;
    this.state = 'scatter'; // scatter, chase, frightened, dead
    this.target = null;
  }
  
  update() {
    switch(this.state) {
      case 'scatter':
        this.target = this.getScatterTarget();
        break;
      case 'chase':
        this.target = this.getChaseTarget();
        break;
      case 'frightened':
        this.wanderRandomly();
        break;
    }
    this.moveTowardsTarget();
  }
  
  getChaseTarget() {
    // Override in subclasses
  }
}

class Blinky extends Ghost {
  // Aggressive - directly targets Pac-Man
  getChaseTarget() {
    return { x: pacman.x, y: pacman.y };
  }
}

class Pinky extends Ghost {
  // Ambusher - targets 4 tiles ahead of Pac-Man
  getChaseTarget() {
    let target = { x: pacman.x, y: pacman.y };
    switch(pacman.direction) {
      case 'up': target.y -= 4; break;
      case 'down': target.y += 4; break;
      case 'left': target.x -= 4; break;
      case 'right': target.x += 4; break;
    }
    return target;
  }
}
```

**Testing Checklist**:
- [ ] Pac-Man moves smoothly
- [ ] Wall collision works
- [ ] All dots collectable
- [ ] Ghosts chase correctly
- [ ] Power pellets work
- [ ] Score calculates correctly
- [ ] Lives system works
- [ ] Level progression

---

### Day 3-4: Frogger

**File Structure**:
```
frogger.html
js/frogger/
├── game.js          # Main game
├── frog.js          # Player
├── lane.js          # Lane base class
├── obstacles/
│   ├── vehicle.js   # Cars, trucks, buses
│   ├── log.js       # River logs
│   └── turtle.js    # Diving turtles
└── constants.js
```

**Implementation Steps**:
1. Create lane system (13 lanes)
2. Implement frog movement (discrete jumps)
3. Create traffic generator with varying speeds
4. Create river platform system
5. Implement platform attachment (frog on log)
6. Add goal slots (5 homes)
7. Add timer system
8. Add lives and scoring
9. Add bonus items (flies, female frog)
10. Level progression (faster obstacles)

**Key Logic**:
```javascript
class Frog {
  attachToPlatform(platform) {
    if (platform) {
      this.attached = true;
      this.platform = platform;
      this.x += platform.velocity; // Move with platform
    }
  }
  
  checkRiverCollision() {
    if (this.lane.type === 'river') {
      const onPlatform = this.lane.objects.some(obj => 
        this.isOverlapping(obj)
      );
      if (!onPlatform) {
        this.die(); // Fell in water
      }
    }
  }
}
```

---

### Day 5: Q*bert

**File Structure**:
```
qbert.html
js/qbert/
├── game.js
├── qbert.js         # Player
├── pyramid.js       # Cube grid
├── cube.js          # Individual cube
└── enemies/
    ├── coily.js     # Snake
    ├── ugg.js
    ├── wrongway.js
    ├── slick.js
    └── sam.js
```

**Implementation Steps**:
1. Create isometric pyramid grid
2. Implement Q*bert diagonal movement
3. Implement cube color changing
4. Create enemy spawning system
5. Implement Coily AI (follows Q*bert)
6. Add other enemies with unique behaviors
7. Add spinning discs (transport)
8. Level progression
9. Score and lives

**Isometric Grid**:
```javascript
class IsometricGrid {
  // Convert grid position to screen coordinates
  gridToScreen(row, col) {
    const cubeWidth = 60;
    const cubeHeight = 30;
    return {
      x: (col - row) * (cubeWidth / 2) + centerX,
      y: (col + row) * (cubeHeight / 2) + topY
    };
  }
  
  // Draw cube with 3D effect
  drawCube(x, y, color) {
    // Top face
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 30, y + 15);
    ctx.lineTo(x, y + 30);
    ctx.lineTo(x - 30, y + 15);
    ctx.closePath();
    ctx.fill();
    
    // Left face (darker)
    ctx.fillStyle = this.darken(color, 0.3);
    ctx.beginPath();
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x - 30, y + 15);
    ctx.lineTo(x - 30, y + 45);
    ctx.lineTo(x, y + 60);
    ctx.closePath();
    ctx.fill();
    
    // Right face (even darker)
    ctx.fillStyle = this.darken(color, 0.5);
    ctx.beginPath();
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x + 30, y + 15);
    ctx.lineTo(x + 30, y + 45);
    ctx.lineTo(x, y + 60);
    ctx.closePath();
    ctx.fill();
  }
}
```

---

### Day 6-7: Sudoku

**File Structure**:
```
sudoku.html
js/sudoku/
├── game.js
├── generator.js     # Puzzle generation
├── solver.js        # Validation and hints
├── grid.js          # UI grid
└── techniques.js    # Solving techniques
```

**Implementation Steps**:
1. Create 9x9 grid UI
2. Implement puzzle generator (backtracking)
3. Implement solver (constraint propagation)
4. Add pencil marks
5. Add validation (highlight conflicts)
6. Add hints system
7. Difficulty levels
8. Timer
9. Save/load

**Puzzle Generation**:
```javascript
class SudokuGenerator {
  generate(difficulty) {
    // 1. Fill diagonal 3x3 boxes (independent)
    this.fillDiagonal();
    
    // 2. Fill remaining cells (backtracking)
    this.fillRemaining(0, 3);
    
    // 3. Remove numbers based on difficulty
    this.removeNumbers(difficulty);
    
    return this.grid;
  }
  
  fillDiagonal() {
    for (let i = 0; i < 9; i += 3) {
      this.fillBox(i, i);
    }
  }
  
  fillBox(row, col) {
    let numbers = [1,2,3,4,5,6,7,8,9];
    shuffle(numbers);
    let idx = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.grid[row + i][col + j] = numbers[idx++];
      }
    }
  }
  
  removeNumbers(difficulty) {
    const removeCounts = {
      easy: 30,
      medium: 40,
      hard: 50,
      expert: 60
    };
    
    let toRemove = removeCounts[difficulty];
    while (toRemove > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (this.grid[row][col] !== 0) {
        const backup = this.grid[row][col];
        this.grid[row][col] = 0;
        
        // Ensure puzzle still has unique solution
        if (this.countSolutions() !== 1) {
          this.grid[row][col] = backup; // Restore
        } else {
          toRemove--;
        }
      }
    }
  }
}
```

**Solver (Dancing Links)**:
```javascript
class SudokuSolver {
  solve(grid) {
    return this.backtrack(grid);
  }
  
  backtrack(grid) {
    const empty = this.findEmpty(grid);
    if (!empty) return true; // Solved
    
    const [row, col] = empty;
    
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(grid, row, col, num)) {
        grid[row][col] = num;
        
        if (this.backtrack(grid)) return true;
        
        grid[row][col] = 0; // Backtrack
      }
    }
    
    return false;
  }
  
  isValid(grid, row, col, num) {
    // Check row
    if (grid[row].includes(num)) return false;
    
    // Check column
    for (let i = 0; i < 9; i++) {
      if (grid[i][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  }
}
```

---

### Day 8: Word Search

**File Structure**:
```
wordsearch.html
js/wordsearch/
├── game.js
├── generator.js     # Grid generation
├── wordlist.js      # Themed word lists
└── selection.js     # Mouse selection
```

**Implementation Steps**:
1. Create grid UI
2. Implement word placement algorithm
3. Fill empty cells with random letters
4. Implement mouse drag selection
5. Word validation
6. Multiple themes
7. Difficulty levels
8. Timer and hints

**Grid Generation**:
```javascript
class WordSearchGenerator {
  generate(words, size) {
    this.grid = Array(size).fill(null).map(() => Array(size).fill(''));
    this.placed = [];
    
    // Sort words by length (longest first)
    words.sort((a, b) => b.length - a.length);
    
    for (const word of words) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = this.getRandomDirection();
        const position = this.getRandomPosition(word.length, direction, size);
        
        if (this.canPlace(word, position, direction)) {
          this.placeWord(word, position, direction);
          placed = true;
        }
        attempts++;
      }
    }
    
    // Fill empty cells
    this.fillEmpty();
    
    return this.grid;
  }
  
  getRandomDirection() {
    const directions = [
      [0, 1],   // Right
      [1, 0],   // Down
      [1, 1],   // Diagonal down-right
      [1, -1],  // Diagonal down-left
      [0, -1],  // Left
      [-1, 0],  // Up
      [-1, -1], // Diagonal up-left
      [-1, 1]   // Diagonal up-right
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  }
  
  canPlace(word, position, direction) {
    const [row, col] = position;
    const [dRow, dCol] = direction;
    
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dRow;
      const c = col + i * dCol;
      
      if (this.grid[r][c] !== '' && this.grid[r][c] !== word[i]) {
        return false; // Cell occupied by different letter
      }
    }
    return true;
  }
}
```

**Word Lists**:
```javascript
const WORD_LISTS = {
  animals: [
    'ELEPHANT', 'GIRAFFE', 'ZEBRA', 'LION', 'TIGER',
    'BEAR', 'MONKEY', 'DOLPHIN', 'WHALE', 'SHARK'
  ],
  countries: [
    'AUSTRIA', 'GERMANY', 'JAPAN', 'FRANCE', 'ITALY',
    'SPAIN', 'CHINA', 'INDIA', 'BRAZIL', 'CANADA'
  ],
  technology: [
    'COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE',
    'PYTHON', 'JAVASCRIPT', 'DATABASE', 'ALGORITHM'
  ]
};
```

---

## Week 2: AI Integration Basics

### Day 9-10: Tetris AI

**Implementation**: Pierre Dellacherie Algorithm

```javascript
class TetrisAI {
  constructor() {
    this.weights = {
      landingHeight: -4.500158825082766,
      erodedPieces: 3.4181268101392694,
      rowTransitions: -3.2178882868487753,
      colTransitions: -9.348695305445199,
      holes: -7.899265427351652,
      wells: -3.3855972247263626
    };
  }
  
  findBestMove(board, piece) {
    let bestScore = -Infinity;
    let bestMove = null;
    
    // Try all rotations
    for (let rotation = 0; rotation < piece.rotations.length; rotation++) {
      const rotated = piece.rotate(rotation);
      
      // Try all columns
      for (let col = 0; col < board.width; col++) {
        if (this.canPlace(board, rotated, col)) {
          const testBoard = board.clone();
          const row = this.dropPiece(testBoard, rotated, col);
          const score = this.evaluate(testBoard, rotated, row, col);
          
          if (score > bestScore) {
            bestScore = score;
            bestMove = { rotation, col };
          }
        }
      }
    }
    
    return bestMove;
  }
  
  evaluate(board, piece, row, col) {
    let score = 0;
    
    score += this.landingHeight(row) * this.weights.landingHeight;
    score += this.erodedPieces(board, piece) * this.weights.erodedPieces;
    score += this.rowTransitions(board) * this.weights.rowTransitions;
    score += this.colTransitions(board) * this.weights.colTransitions;
    score += this.countHoles(board) * this.weights.holes;
    score += this.countWells(board) * this.weights.wells;
    
    return score;
  }
  
  landingHeight(row) {
    return row;
  }
  
  erodedPieces(board, piece) {
    const linesCleared = board.clearLines();
    const pieceCells = piece.cells.length;
    return linesCleared * pieceCells;
  }
  
  rowTransitions(board) {
    let transitions = 0;
    for (let row = 0; row < board.height; row++) {
      for (let col = 0; col < board.width - 1; col++) {
        if (board.get(row, col) !== board.get(row, col + 1)) {
          transitions++;
        }
      }
    }
    return transitions;
  }
  
  colTransitions(board) {
    let transitions = 0;
    for (let col = 0; col < board.width; col++) {
      for (let row = 0; row < board.height - 1; row++) {
        if (board.get(row, col) !== board.get(row + 1, col)) {
          transitions++;
        }
      }
    }
    return transitions;
  }
  
  countHoles(board) {
    let holes = 0;
    for (let col = 0; col < board.width; col++) {
      let blockFound = false;
      for (let row = 0; row < board.height; row++) {
        if (board.get(row, col)) {
          blockFound = true;
        } else if (blockFound) {
          holes++;
        }
      }
    }
    return holes;
  }
  
  countWells(board) {
    let wells = 0;
    for (let col = 0; col < board.width; col++) {
      for (let row = board.height - 1; row >= 0; row--) {
        if (!board.get(row, col)) {
          const leftWall = col === 0 || board.get(row, col - 1);
          const rightWall = col === board.width - 1 || board.get(row, col + 1);
          if (leftWall && rightWall) {
            wells++;
          }
        }
      }
    }
    return wells;
  }
}
```

**AI Control Panel**:
```html
<div class="ai-controls">
  <button onclick="startAI()">Start AI</button>
  <button onclick="stopAI()">Stop AI</button>
  <label>Speed: <input type="range" min="1" max="1000" value="100" id="aiSpeed"></label>
  <div class="ai-stats">
    <div>Pieces: <span id="aiPieces">0</span></div>
    <div>Lines: <span id="aiLines">0</span></div>
    <div>Score: <span id="aiScore">0</span></div>
    <div>Speed: <span id="aiPPS">0</span> pieces/sec</div>
  </div>
</div>
```

---

### Day 11-12: Stockfish.js Integration

**Setup**:
1. Download stockfish.js and stockfish.wasm
2. Create Web Worker wrapper
3. Integrate with chess board
4. Add difficulty levels
5. Add analysis mode

**Web Worker**:
```javascript
// chess-worker.js
importScripts('stockfish.js');

const engine = new Worker('stockfish.wasm');

engine.onmessage = (e) => {
  const line = e.data;
  
  if (line.startsWith('bestmove')) {
    const move = line.split(' ')[1];
    postMessage({ type: 'bestmove', move });
  } else if (line.startsWith('info depth')) {
    // Parse evaluation
    const depthMatch = line.match(/depth (\d+)/);
    const scoreMatch = line.match(/score cp (-?\d+)/);
    const pvMatch = line.match(/pv (.+)/);
    
    if (depthMatch && scoreMatch) {
      postMessage({
        type: 'analysis',
        depth: parseInt(depthMatch[1]),
        score: parseInt(scoreMatch[1]) / 100, // Convert centipawns to pawns
        pv: pvMatch ? pvMatch[1] : ''
      });
    }
  }
};

self.onmessage = (e) => {
  const { command, fen, depth } = e.data;
  
  if (command === 'position') {
    engine.postMessage(`position fen ${fen}`);
  } else if (command === 'go') {
    engine.postMessage(`go depth ${depth || 10}`);
  } else if (command === 'stop') {
    engine.postMessage('stop');
  }
};
```

**Chess Game Integration**:
```javascript
class ChessGame {
  constructor() {
    this.worker = new Worker('chess-worker.js');
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
    this.aiEnabled = false;
    this.aiLevel = 10; // 1-20
  }
  
  handleWorkerMessage(e) {
    const { type, move, depth, score, pv } = e.data;
    
    if (type === 'bestmove') {
      this.makeMove(move);
      this.showAIThinking(false);
    } else if (type === 'analysis') {
      this.updateAnalysis(depth, score, pv);
    }
  }
  
  async getAIMove() {
    this.showAIThinking(true);
    const fen = this.board.fen();
    this.worker.postMessage({
      command: 'position',
      fen: fen
    });
    this.worker.postMessage({
      command: 'go',
      depth: this.aiLevel
    });
  }
  
  updateAnalysis(depth, score, pv) {
    document.getElementById('analysis-depth').textContent = depth;
    document.getElementById('analysis-score').textContent = score.toFixed(2);
    document.getElementById('analysis-pv').textContent = pv;
  }
}
```

---

### Day 13-14: Chess.com API + Famous Games

**API Implementation**:
```javascript
class ChessComAPI {
  constructor() {
    this.baseURL = 'https://api.chess.com/pub';
  }
  
  async getPlayerProfile(username) {
    const response = await fetch(`${this.baseURL}/player/${username}`);
    return await response.json();
  }
  
  async getPlayerGames(username, year, month) {
    const response = await fetch(
      `${this.baseURL}/player/${username}/games/${year}/${String(month).padStart(2, '0')}`
    );
    const data = await response.json();
    return data.games;
  }
  
  async getDailyPuzzle() {
    const response = await fetch(`${this.baseURL}/puzzle/random`);
    return await response.json();
  }
}
```

**Famous Games Database** (JSON):
```json
{
  "games": [
    {
      "id": "immortal_game",
      "name": "The Immortal Game",
      "white": "Adolf Anderssen",
      "black": "Lionel Kieseritzky",
      "date": "1851-06-21",
      "event": "London",
      "eco": "C33",
      "pgn": "1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0",
      "comments": {
        "move_11": "A brilliant positional sacrifice!",
        "move_18": "The legendary queen sacrifice begins Anderssen's mating attack.",
        "move_21": "Another piece sacrificed for the attack!",
        "move_22": "Checkmate! A masterpiece of romantic chess."
      },
      "difficulty": "advanced",
      "themes": ["sacrifice", "mating_attack", "king_hunt"]
    }
  ]
}
```

**Game Viewer Component**:
```javascript
class GameViewer {
  constructor(gameData) {
    this.game = gameData;
    this.currentMove = 0;
    this.moves = this.parsePGN(gameData.pgn);
    this.board = new ChessBoard();
  }
  
  parsePGN(pgn) {
    // Parse PGN into move list
    return chess.js.load_pgn(pgn);
  }
  
  nextMove() {
    if (this.currentMove < this.moves.length) {
      const move = this.moves[this.currentMove];
      this.board.makeMove(move);
      this.showComment(this.currentMove);
      this.currentMove++;
    }
  }
  
  previousMove() {
    if (this.currentMove > 0) {
      this.currentMove--;
      this.board.undoMove();
    }
  }
  
  showComment(moveNum) {
    const comment = this.game.comments[`move_${moveNum}`];
    if (comment) {
      document.getElementById('comment').textContent = comment;
    }
  }
  
  autoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextMove();
      if (this.currentMove >= this.moves.length) {
        clearInterval(this.autoPlayInterval);
      }
    }, 1000);
  }
}
```

---

## Testing & QA

### Day 15: Integration Testing

**Test Each Game**:
- [ ] Pac-Man: All ghosts working, power pellets
- [ ] Frogger: Platform attachment, collision
- [ ] Q*bert: Isometric movement, enemies
- [ ] Sudoku: Generation, solving, validation
- [ ] Word Search: Generation, selection
- [ ] Tetris AI: Can play continuously
- [ ] Chess AI: Responds to moves
- [ ] Famous games: Can view and step through

**Performance Testing**:
- [ ] All games run at 60 FPS
- [ ] AI doesn't block UI
- [ ] No memory leaks
- [ ] Mobile responsive

---

## Deployment

### Day 16: Polish & Deploy

1. Code cleanup and documentation
2. Update README
3. Create demo video/screenshots
4. Test on multiple browsers
5. Mobile testing
6. Deploy (GitHub Pages or local)

---

## Success Criteria

- ✅ All 5 new games playable
- ✅ Tetris AI can play indefinitely
- ✅ Chess AI responds within 1 second
- ✅ Famous games viewable with comments
- ✅ All games mobile-friendly
- ✅ No critical bugs

---

Ready to implement! 🚀

