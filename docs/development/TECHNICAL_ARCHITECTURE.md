# Technical Architecture Document

**Project**: Games Collection with AI  
**Date**: 2025-12-03  
**Version**: 2.0

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (HTML5 Canvas + DOM + CSS3 Glassmorphism)                  │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────┐
│                    Game Engine Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  Board     │  │  Arcade    │  │  Puzzle              │  │
│  │  Games     │  │  Games     │  │  Games               │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────┐
│                      AI Layer                                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Stockfish  │  │  Minimax     │  │  Neural Nets     │   │
│  │  (WASM)     │  │  Alpha-Beta  │  │  (TensorFlow.js) │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  IndexedDB   │  │  LocalStorage│  │  External APIs   │  │
│  │  (Games DB)  │  │  (Settings)  │  │  (Chess.com)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Game Engine Base Class

**Purpose**: Universal interface for all games

```javascript
class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.running = false;
    this.paused = false;
    this.score = 0;
    this.gameLoop = null;
  }
  
  // Abstract methods (override in subclasses)
  init() { throw new Error('Must implement init()'); }
  update(deltaTime) { throw new Error('Must implement update()'); }
  render() { throw new Error('Must implement render()'); }
  handleInput(event) { throw new Error('Must implement handleInput()'); }
  
  // Common methods
  start() {
    this.running = true;
    this.lastTime = Date.now();
    this.loop();
  }
  
  stop() {
    this.running = false;
    cancelAnimationFrame(this.gameLoop);
  }
  
  pause() {
    this.paused = !this.paused;
  }
  
  loop() {
    if (!this.running) return;
    
    const now = Date.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    
    if (!this.paused) {
      this.update(deltaTime);
      this.render();
    }
    
    this.gameLoop = requestAnimationFrame(() => this.loop());
  }
  
  setScore(score) {
    this.score = score;
    this.updateScoreDisplay();
  }
  
  updateScoreDisplay() {
    document.getElementById('score').textContent = `Score: ${this.score}`;
  }
}
```

### 2. AI Interface

**Purpose**: Universal AI interface for all game types

```javascript
class AIInterface {
  constructor(game, difficulty = 5) {
    this.game = game;
    this.difficulty = difficulty; // 1-10 scale
    this.thinking = false;
    this.worker = null;
  }
  
  // Abstract methods
  async getMove(state) {
    throw new Error('Must implement getMove()');
  }
  
  evaluatePosition(state) {
    throw new Error('Must implement evaluatePosition()');
  }
  
  // Common methods
  setDifficulty(level) {
    this.difficulty = Math.max(1, Math.min(10, level));
  }
  
  async getMoveWithDelay(state) {
    // Add artificial delay for realism
    const delay = this.difficulty < 5 ? 
      500 + Math.random() * 1000 : 
      100 + Math.random() * 300;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return await this.getMove(state);
  }
  
  startWorker(workerPath) {
    this.worker = new Worker(workerPath);
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
  }
  
  handleWorkerMessage(e) {
    // Override in subclasses
  }
}
```

### 3. Board Game AI (Minimax Base)

```javascript
class BoardGameAI extends AIInterface {
  constructor(game, difficulty) {
    super(game, difficulty);
    this.transpositionTable = new Map();
  }
  
  async getMove(state) {
    const depth = this.difficultyToDepth(this.difficulty);
    const bestMove = this.minimax(state, depth, -Infinity, Infinity, true);
    return bestMove.move;
  }
  
  minimax(state, depth, alpha, beta, maximizing) {
    // Check transposition table
    const hash = this.hashState(state);
    if (this.transpositionTable.has(hash)) {
      return this.transpositionTable.get(hash);
    }
    
    // Terminal conditions
    if (depth === 0 || state.isGameOver()) {
      const score = this.evaluatePosition(state);
      return { score, move: null };
    }
    
    const moves = state.getLegalMoves();
    let bestMove = null;
    
    if (maximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        const newState = state.makeMove(move);
        const result = this.minimax(newState, depth - 1, alpha, beta, false);
        
        if (result.score > maxScore) {
          maxScore = result.score;
          bestMove = move;
        }
        
        alpha = Math.max(alpha, result.score);
        if (beta <= alpha) break; // Beta cutoff
      }
      
      const result = { score: maxScore, move: bestMove };
      this.transpositionTable.set(hash, result);
      return result;
      
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        const newState = state.makeMove(move);
        const result = this.minimax(newState, depth - 1, alpha, beta, true);
        
        if (result.score < minScore) {
          minScore = result.score;
          bestMove = move;
        }
        
        beta = Math.min(beta, result.score);
        if (beta <= alpha) break; // Alpha cutoff
      }
      
      const result = { score: minScore, move: bestMove };
      this.transpositionTable.set(hash, result);
      return result;
    }
  }
  
  difficultyToDepth(difficulty) {
    // Map difficulty (1-10) to search depth
    return 2 + Math.floor(difficulty * 0.8); // 2-10 ply
  }
  
  hashState(state) {
    // Simple hash (override for better hashing)
    return JSON.stringify(state.board);
  }
}
```

### 4. Arcade Game AI (Pathfinding Base)

```javascript
class ArcadeGameAI extends AIInterface {
  constructor(game, difficulty) {
    super(game, difficulty);
  }
  
  astar(start, goal, grid) {
    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    gScore.set(start, 0);
    fScore.set(start, this.heuristic(start, goal));
    openSet.push(start, fScore.get(start));
    
    while (!openSet.isEmpty()) {
      const current = openSet.pop();
      
      if (this.equals(current, goal)) {
        return this.reconstructPath(cameFrom, current);
      }
      
      for (const neighbor of this.getNeighbors(current, grid)) {
        const tentativeGScore = gScore.get(current) + 1;
        
        if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeGScore);
          fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, goal));
          
          if (!openSet.contains(neighbor)) {
            openSet.push(neighbor, fScore.get(neighbor));
          }
        }
      }
    }
    
    return null; // No path found
  }
  
  heuristic(a, b) {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  
  reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      path.unshift(current);
    }
    return path;
  }
  
  getNeighbors(pos, grid) {
    const neighbors = [];
    const dirs = [{x:0,y:1}, {x:1,y:0}, {x:0,y:-1}, {x:-1,y:0}];
    
    for (const dir of dirs) {
      const newPos = {x: pos.x + dir.x, y: pos.y + dir.y};
      if (this.isValid(newPos, grid)) {
        neighbors.push(newPos);
      }
    }
    
    return neighbors;
  }
  
  isValid(pos, grid) {
    return pos.x >= 0 && pos.x < grid.width &&
           pos.y >= 0 && pos.y < grid.height &&
           !grid.isBlocked(pos.x, pos.y);
  }
  
  equals(a, b) {
    return a.x === b.x && a.y === b.y;
  }
}
```

---

## Web Workers Architecture

### Chess Worker

```javascript
// chess-worker.js
importScripts('stockfish.js', 'chess.js');

const engine = STOCKFISH();
const chess = new Chess();

let analysisMode = false;

engine.onmessage = function(line) {
  if (line.startsWith('bestmove')) {
    const parts = line.split(' ');
    postMessage({
      type: 'bestmove',
      move: parts[1],
      ponder: parts[3]
    });
  } else if (line.startsWith('info') && analysisMode) {
    parseAnalysis(line);
  }
};

function parseAnalysis(line) {
  const depth = parseInt(line.match(/depth (\d+)/)?.[1] || 0);
  const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
  const pv = line.match(/pv (.+)/)?.[1] || '';
  
  if (scoreMatch) {
    const scoreType = scoreMatch[1];
    const scoreValue = parseInt(scoreMatch[2]);
    
    postMessage({
      type: 'analysis',
      depth,
      scoreType,
      scoreValue: scoreType === 'cp' ? scoreValue / 100 : scoreValue,
      pv
    });
  }
}

self.onmessage = function(e) {
  const { command, fen, moves, depth, time, options } = e.data;
  
  switch(command) {
    case 'init':
      engine.postMessage('uci');
      if (options) {
        for (const [key, value] of Object.entries(options)) {
          engine.postMessage(`setoption name ${key} value ${value}`);
        }
      }
      break;
      
    case 'position':
      engine.postMessage(`position fen ${fen}`);
      chess.load(fen);
      break;
      
    case 'go':
      if (depth) {
        engine.postMessage(`go depth ${depth}`);
      } else if (time) {
        engine.postMessage(`go movetime ${time}`);
      } else {
        engine.postMessage('go');
      }
      break;
      
    case 'analyze':
      analysisMode = true;
      engine.postMessage(`position fen ${fen}`);
      engine.postMessage(`go infinite`);
      break;
      
    case 'stop':
      engine.postMessage('stop');
      analysisMode = false;
      break;
      
    case 'validate':
      chess.load(fen);
      const legalMoves = chess.moves({ verbose: true });
      postMessage({
        type: 'validation',
        legal: legalMoves
      });
      break;
  }
};
```

### Tetris AI Worker

```javascript
// tetris-ai-worker.js

class TetrisAIWorker {
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
    
    for (let rotation = 0; rotation < 4; rotation++) {
      const rotated = this.rotatePiece(piece, rotation);
      
      for (let col = 0; col < board.width; col++) {
        const testBoard = this.cloneBoard(board);
        const row = this.dropPiece(testBoard, rotated, col);
        
        if (row !== -1) {
          const score = this.evaluate(testBoard, rotated, row, col);
          if (score > bestScore) {
            bestScore = score;
            bestMove = { rotation, col, row };
          }
        }
      }
    }
    
    return bestMove;
  }
  
  evaluate(board, piece, row, col) {
    let score = 0;
    
    const landingHeight = this.getLandingHeight(board, row);
    const erodedPieces = this.getErodedPieces(board, piece);
    const rowTrans = this.getRowTransitions(board);
    const colTrans = this.getColTransitions(board);
    const holes = this.getHoles(board);
    const wells = this.getWells(board);
    
    score += landingHeight * this.weights.landingHeight;
    score += erodedPieces * this.weights.erodedPieces;
    score += rowTrans * this.weights.rowTransitions;
    score += colTrans * this.weights.colTransitions;
    score += holes * this.weights.holes;
    score += wells * this.weights.wells;
    
    return score;
  }
  
  // ... evaluation functions ...
}

const ai = new TetrisAIWorker();

self.onmessage = function(e) {
  const { board, piece } = e.data;
  const bestMove = ai.findBestMove(board, piece);
  postMessage(bestMove);
};
```

---

## Data Storage

### IndexedDB Schema

```javascript
const DB_NAME = 'GamesCollectionDB';
const DB_VERSION = 1;

const STORES = {
  games: {
    keyPath: 'id',
    indexes: [
      { name: 'date', keyPath: 'date' },
      { name: 'gameType', keyPath: 'gameType' }
    ]
  },
  
  famousGames: {
    keyPath: 'id',
    indexes: [
      { name: 'player', keyPath: 'players', multiEntry: true },
      { name: 'theme', keyPath: 'themes', multiEntry: true },
      { name: 'difficulty', keyPath: 'difficulty' }
    ]
  },
  
  lessons: {
    keyPath: 'id',
    indexes: [
      { name: 'category', keyPath: 'category' },
      { name: 'difficulty', keyPath: 'difficulty' }
    ]
  },
  
  userProgress: {
    keyPath: 'id',
    indexes: [
      { name: 'gameType', keyPath: 'gameType' },
      { name: 'date', keyPath: 'lastPlayed' }
    ]
  },
  
  settings: {
    keyPath: 'key'
  }
};

class DatabaseManager {
  constructor() {
    this.db = null;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        for (const [storeName, config] of Object.entries(STORES)) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: config.keyPath });
            
            if (config.indexes) {
              for (const index of config.indexes) {
                store.createIndex(index.name, index.keyPath, {
                  multiEntry: index.multiEntry || false
                });
              }
            }
          }
        }
      };
    });
  }
  
  async save(storeName, data) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return store.put(data);
  }
  
  async get(storeName, key) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getAll(storeName) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async query(storeName, indexName, value) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
```

---

## Performance Optimization

### 1. Offscreen Canvas

```javascript
class OffscreenRenderer {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
  }
  
  render(drawFunction) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    drawFunction(this.ctx);
  }
  
  copyTo(targetCtx, x = 0, y = 0) {
    targetCtx.drawImage(this.canvas, x, y);
  }
}
```

### 2. Object Pooling

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }
  
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// Usage example
const particlePool = new ObjectPool(
  () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0 }),
  (p) => { p.x = p.y = p.vx = p.vy = p.life = 0; },
  100
);
```

### 3. Request Animation Frame with Delta Time

```javascript
class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.lastTime = 0;
    this.running = false;
    this.fps = 60;
    this.frameTime = 1000 / this.fps;
    this.accumulator = 0;
  }
  
  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }
  
  loop(currentTime) {
    if (!this.running) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.accumulator += deltaTime;
    
    // Fixed time step updates
    while (this.accumulator >= this.frameTime) {
      this.updateFn(this.frameTime / 1000);
      this.accumulator -= this.frameTime;
    }
    
    // Variable time rendering
    this.renderFn();
    
    requestAnimationFrame((time) => this.loop(time));
  }
  
  stop() {
    this.running = false;
  }
}
```

---

## API Integration

### Chess.com API Wrapper

```javascript
class ChessComClient {
  constructor() {
    this.baseURL = 'https://api.chess.com/pub';
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }
  
  async fetch(endpoint) {
    // Check cache
    if (this.cache.has(endpoint)) {
      const cached = this.cache.get(endpoint);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      // Cache result
      this.cache.set(endpoint, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error(`Chess.com API error: ${error.message}`);
      throw error;
    }
  }
  
  async getPlayer(username) {
    return await this.fetch(`/player/${username}`);
  }
  
  async getPlayerStats(username) {
    return await this.fetch(`/player/${username}/stats`);
  }
  
  async getPlayerGames(username, year, month) {
    const monthStr = String(month).padStart(2, '0');
    return await this.fetch(`/player/${username}/games/${year}/${monthStr}`);
  }
  
  async getDailyPuzzle() {
    // Chess.com doesn't have this, use Lichess instead
    const response = await fetch('https://lichess.org/api/puzzle/daily');
    return await response.json();
  }
}
```

---

## Build System (Optional)

### Using Vite for Development

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        chess: 'chess.html',
        tetris: 'tetris.html',
        // ... other games
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  worker: {
    format: 'es'
  }
});
```

---

## Testing Framework

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/vendor/**',
    '!js/workers/**'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
};

// Example test
describe('Chess AI', () => {
  let ai;
  
  beforeEach(() => {
    ai = new ChessAI(5);
  });
  
  test('finds checkmate in one', async () => {
    const fen = 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4';
    const move = await ai.getMove(fen);
    expect(move).toBeTruthy();
  });
});
```

---

## Deployment

### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## Security Considerations

1. **Input Validation**: Sanitize all user inputs
2. **API Keys**: Never commit API keys (use env vars)
3. **CORS**: Handle CORS properly for external APIs
4. **XSS Prevention**: Escape user-generated content
5. **CSP**: Implement Content Security Policy headers

---

## Performance Targets

- **FPS**: Maintain 60 FPS for all games
- **AI Response**: < 1 second for chess moves (depth 10)
- **Load Time**: < 3 seconds initial load
- **Memory**: < 100MB RAM usage
- **Storage**: < 10MB IndexedDB usage

---

Ready for implementation! 🚀

