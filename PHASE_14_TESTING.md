# Phase 14: Testing & QA Infrastructure 🧪

**Timeline**: 1-2 weeks  
**Priority**: HIGH (for production quality)  
**Date**: 2025-12-03  
**Type**: Quality Assurance

---

## Vision

Build a **comprehensive automated testing suite** that ensures:
- All games work correctly
- Stockfish is the real engine (not test version!)
- Works offline and online
- Cross-browser compatibility
- Performance targets met (60 FPS, <1s AI)
- No memory leaks
- Multiplayer functions properly

**Goal**: Professional-grade quality assurance with CI/CD automation.

---

## Testing Strategy

### Test Pyramid

```
       /\
      /E2E\      (10% - Full game playthroughs)
     /------\
    /Integration\ (30% - API, workers, storage)
   /------------\
  /  Unit Tests  \ (60% - Game logic, algorithms)
 /----------------\
```

**Coverage Targets**:
- Unit tests: 80%+ code coverage
- Integration: All external systems
- E2E: All critical user flows
- Performance: All games meet targets

---

## Unit Tests (60% of tests)

### Game Logic Testing

**Chess Rules**:
```javascript
describe('Chess Move Validation', () => {
  test('Pawn moves forward one square', () => {
    const board = new ChessBoard();
    board.setup();
    const valid = board.isValidMove('e2', 'e3');
    expect(valid).toBe(true);
  });
  
  test('Pawn cannot move backwards', () => {
    const board = new ChessBoard();
    board.setup();
    board.makeMove('e2', 'e4');
    const valid = board.isValidMove('e4', 'e3');
    expect(valid).toBe(false);
  });
  
  test('Knight jumps over pieces', () => {
    const board = new ChessBoard();
    board.setup();
    const valid = board.isValidMove('b1', 'c3');
    expect(valid).toBe(true); // Even with pawn at b2
  });
  
  test('Castling requires unmoved king and rook', () => {
    const board = new ChessBoard();
    board.loadFen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    expect(board.canCastle('white', 'kingside')).toBe(true);
    
    board.makeMove('e1', 'f1');
    board.makeMove('f1', 'e1'); // King moved and back
    expect(board.canCastle('white', 'kingside')).toBe(false);
  });
  
  test('En passant only available immediately', () => {
    const board = new ChessBoard();
    board.loadFen('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
    expect(board.isValidMove('e5', 'd6')).toBe(true); // En passant
    
    // After another move, no longer valid
    board.makeMove('a2', 'a3');
    board.makeMove('a7', 'a6');
    expect(board.isValidMove('e5', 'd6')).toBe(false);
  });
});
```

**Tetris Logic**:
```javascript
describe('Tetris Mechanics', () => {
  test('Line clears when full', () => {
    const game = new TetrisGame();
    game.board[19] = Array(10).fill(1); // Bottom row filled
    game.checkLines();
    expect(game.linesCleared).toBe(1);
    expect(game.board[19]).toEqual(Array(10).fill(0));
  });
  
  test('Tetris (4 lines) scores correctly', () => {
    const game = new TetrisGame();
    for (let row = 16; row < 20; row++) {
      game.board[row] = Array(10).fill(1);
    }
    game.checkLines();
    expect(game.linesCleared).toBe(4);
    expect(game.score).toBeGreaterThan(game.linesCleared * 100);
  });
  
  test('Piece collision detection', () => {
    const game = new TetrisGame();
    game.board[10][5] = 1; // Blocked cell
    const collision = game.checkCollision({x: 5, y: 10}, SHAPES.I);
    expect(collision).toBe(true);
  });
});
```

**Card Game Logic**:
```javascript
describe('Poker Hand Evaluation', () => {
  test('Royal flush beats everything', () => {
    const royalFlush = ['A♠', 'K♠', 'Q♠', 'J♠', '10♠'];
    const fourOfKind = ['A♠', 'A♥', 'A♦', 'A♣', 'K♠'];
    
    expect(evaluateHand(royalFlush).rank).toBeGreaterThan(
      evaluateHand(fourOfKind).rank
    );
  });
  
  test('Full house ranking', () => {
    const fullHouseAces = ['A♠', 'A♥', 'A♦', 'K♣', 'K♠'];
    const fullHouseKings = ['K♠', 'K♥', 'K♦', 'A♣', 'A♠'];
    
    expect(evaluateHand(fullHouseAces).value).toBeGreaterThan(
      evaluateHand(fullHouseKings).value
    );
  });
});
```

---

## Integration Tests (30% of tests)

### Stockfish Engine Verification ⭐ CRITICAL

```javascript
describe('Stockfish Engine (REAL, not test version!)', () => {
  let engine;
  
  beforeAll(async () => {
    engine = new StockfishEngine();
    await engine.initialize();
  });
  
  test('Engine loads successfully', () => {
    expect(engine.isReady()).toBe(true);
  });
  
  test('Finds mate in 1', async () => {
    // Back rank mate
    const fen = '6k1/5ppp/8/8/8/8/5PPP/6KR w - - 0 1';
    await engine.setPosition(fen);
    const move = await engine.getBestMove(depth: 5);
    
    expect(move).toBe('h1h8'); // Rh8#
  }, 10000); // 10 second timeout
  
  test('Makes sensible opening moves', async () => {
    await engine.setPosition('startpos');
    const move = await engine.getBestMove(depth: 10);
    
    // Stockfish should play e4, d4, Nf3, or c4
    const goodMoves = ['e2e4', 'd2d4', 'g1f3', 'c2c4'];
    expect(goodMoves).toContain(move);
  });
  
  test('Evaluation is reasonable', async () => {
    // Equal position should be near 0
    await engine.setPosition('startpos');
    const eval = await engine.getEvaluation(depth: 10);
    
    expect(Math.abs(eval)).toBeLessThan(0.5); // Within half a pawn
  });
  
  test('Recognizes winning positions', async () => {
    // White has extra queen
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNRQ w KQkq - 0 1';
    await engine.setPosition(fen);
    const eval = await engine.getEvaluation(depth: 10);
    
    expect(eval).toBeGreaterThan(5.0); // Huge advantage
  });
  
  test('NOT a test/dummy engine', async () => {
    // Run 10 positions, engine should not make random moves
    let sensibleMoves = 0;
    
    for (let i = 0; i < 10; i++) {
      await engine.setPosition('startpos');
      const move = await engine.getBestMove(depth: 10);
      
      // Check if move is one of top opening moves
      if (['e2e4', 'd2d4', 'g1f3', 'c2c4', 'e2e3', 'd2d3'].includes(move)) {
        sensibleMoves++;
      }
    }
    
    // Real Stockfish should make sensible moves >80% of time
    expect(sensibleMoves).toBeGreaterThan(8);
  });
});
```

### Firebase Integration

```javascript
describe('Multiplayer System', () => {
  test('Creates game lobby', async () => {
    const gameId = await multiplayerManager.createGame('chess', {maxPlayers: 2});
    expect(gameId).toBeTruthy();
    
    const game = await multiplayerManager.getGame(gameId);
    expect(game.status).toBe('waiting');
  });
  
  test('Player can join lobby', async () => {
    const gameId = await createTestLobby();
    await multiplayerManager.joinGame(gameId);
    
    const game = await multiplayerManager.getGame(gameId);
    expect(game.currentPlayers).toBe(2);
  });
  
  test('Game state syncs in real-time', async (done) => {
    const gameId = await createTestLobby();
    
    multiplayerManager.listenToGame(gameId, (game) => {
      if (game.gameState.lastMove) {
        expect(game.gameState.lastMove).toBe('e2e4');
        done();
      }
    });
    
    await multiplayerManager.makeMove(gameId, 'e2e4');
  }, 5000);
});
```

### Offline Mode

```javascript
describe('Offline Functionality', () => {
  beforeAll(() => {
    // Simulate offline
    window.navigator.onLine = false;
  });
  
  test('Games work without internet', () => {
    const chess = new ChessGame();
    expect(() => chess.start()).not.toThrow();
  });
  
  test('Settings save locally', () => {
    settingsManager.setSetting('theme', 'dark');
    const retrieved = settingsManager.getSetting('theme');
    expect(retrieved).toBe('dark');
  });
  
  test('Stats save locally', async () => {
    await statsManager.recordGame({score: 1000, result: 'win'});
    const stats = await statsManager.getLocalStats();
    expect(stats.gamesPlayed).toBeGreaterThan(0);
  });
});
```

---

## E2E Tests (10% of tests)

### Full Game Playthrough

```javascript
describe('Complete Chess Game', () => {
  test('Can play full game vs AI', async () => {
    const game = new ChessGame();
    game.startVsAI(difficulty: 5);
    
    // Play Scholar's Mate
    await game.makeMove('e2', 'e4');
    await game.waitForAI();
    await game.makeMove('f1', 'c4');
    await game.waitForAI();
    await game.makeMove('d1', 'h5');
    await game.waitForAI();
    await game.makeMove('h5', 'f7');
    
    expect(game.isCheckmate()).toBe(true);
    expect(game.winner).toBe('white');
  }, 30000);
});
```

---

## Performance Tests

### FPS Monitoring

```javascript
describe('Performance Benchmarks', () => {
  test('Chess renders at 60 FPS', async () => {
    const game = new ChessGame();
    const fps = await measureFPS(game, 5000); // 5 seconds
    expect(fps).toBeGreaterThan(55); // Allow small margin
  });
  
  test('Tetris at max speed maintains FPS', async () => {
    const game = new TetrisGame();
    game.setSpeed(10); // Maximum
    const fps = await measureFPS(game, 5000);
    expect(fps).toBeGreaterThan(55);
  });
  
  test('Match-3 particle effects dont tank FPS', async () => {
    const game = new GemCascadeGame();
    // Create big cascade
    const fps = await measureFPSDuring(() => {
      game.triggerMassiveCascade();
    });
    expect(fps).toBeGreaterThan(30); // Even with particles
  });
});
```

### AI Performance

```javascript
describe('AI Response Times', () => {
  test('Chess AI responds within 1 second', async () => {
    const game = new ChessGame();
    const startTime = Date.now();
    await game.getAIMove(depth: 10);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(1000);
  });
  
  test('Tetris AI evaluates 10,000 positions/sec', () => {
    const ai = new TetrisAI();
    const board = generateRandomBoard();
    
    const startTime = Date.now();
    for (let i = 0; i < 10000; i++) {
      ai.evaluate(board, SHAPES.I);
    }
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(1000); // 10k evals in <1 sec
  });
});
```

---

## Cross-Browser Testing

### Playwright Configuration

```javascript
// playwright.config.js
module.exports = {
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } }
  ],
  
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};
```

### Browser-Specific Tests

```javascript
test('Stockfish works in all browsers', async () => {
  // Playwright runs this in Chrome, Firefox, Safari automatically
  await page.goto('http://localhost:3000/chess.html');
  await page.click('#vs-ai-button');
  await page.click('[data-square="e2"]');
  await page.click('[data-square="e4"]');
  
  // Wait for AI response
  await page.waitForSelector('.ai-thinking', { state: 'hidden', timeout: 5000 });
  
  // Check AI made a move
  const moveCount = await page.locator('.move-history .move').count();
  expect(moveCount).toBe(2); // User + AI
});
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Test and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint code
      run: npm run lint
    
    - name: Unit tests
      run: npm run test:unit
    
    - name: Integration tests
      run: npm run test:integration
    
    - name: E2E tests
      run: npm run test:e2e
    
    - name: Performance tests
      run: npm run test:performance
    
    - name: Test offline mode
      run: npm run test:offline
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
  
  build:
    name: Build Production
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install and build
      run: |
        npm ci
        npm run build
    
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: production-build
        path: dist/
  
  deploy:
    name: Deploy to GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Download artifact
      uses: actions/download-artifact@v3
      with:
        name: production-build
        path: dist/
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

---

## Special Tests: Stockfish Validation

### The "Is This Real Stockfish?" Test Suite

```javascript
describe('Stockfish Sanity Checks', () => {
  test('Engine identifies itself correctly', async () => {
    const engine = new StockfishEngine();
    const info = await engine.getInfo();
    
    expect(info.name).toContain('Stockfish');
    expect(info.author).toBeTruthy();
  });
  
  test('Finds forced mate sequences', async () => {
    // Test multiple mate-in-1 positions
    const matePositions = [
      { fen: '6k1/5ppp/8/8/8/8/8/R6K w - - 0 1', mate: 'a1a8' },
      { fen: 'r6k/6pp/8/8/8/8/6PP/R6K w - - 0 1', mate: 'a1a8' },
      { fen: '3qk3/8/3K4/8/8/8/8/8 b - - 0 1', mate: 'd8d6' }
    ];
    
    for (const pos of matePositions) {
      await engine.setPosition(pos.fen);
      const move = await engine.getBestMove(depth: 5);
      expect(move).toBe(pos.mate);
    }
  });
  
  test('Does not hang pieces stupidly', async () => {
    // Position where queen can be taken
    const fen = 'rnbqkbnr/pppppppp/8/8/4Q3/8/PPPPPPPP/RNB1KBNR b KQkq - 0 1';
    await engine.setPosition(fen);
    const move = await engine.getBestMove(depth: 5);
    
    // Stockfish should capture queen, not make random move
    expect(move).toMatch(/[a-h][1-8]e4/); // Something captures on e4
  });
  
  test('Opening moves are standard', async () => {
    const trials = 20;
    const goodOpenings = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'e2e3', 'd2d3'];
    let sensibleCount = 0;
    
    for (let i = 0; i < trials; i++) {
      await engine.setPosition('startpos');
      const move = await engine.getBestMove(depth: 10);
      
      if (goodOpenings.includes(move)) {
        sensibleCount++;
      }
    }
    
    // Real Stockfish should be consistent (>90%)
    expect(sensibleCount).toBeGreaterThan(18);
  });
  
  test('Evaluation is stable', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    // Same position should give same evaluation
    const evals = [];
    for (let i = 0; i < 5; i++) {
      await engine.setPosition(fen);
      const eval = await engine.getEvaluation(depth: 10);
      evals.push(eval);
    }
    
    // All evaluations should be similar (±0.1)
    const avg = evals.reduce((a, b) => a + b) / evals.length;
    evals.forEach(e => {
      expect(Math.abs(e - avg)).toBeLessThan(0.1);
    });
  });
});
```

---

## Test Data & Fixtures

### Chess Test Positions

```javascript
const TEST_POSITIONS = {
  mateInOne: [
    'r6k/6pp/8/8/8/8/6PP/R6K w - - 0 1',
    '6k1/5ppp/8/8/8/8/5PPP/6KR w - - 0 1',
    // ... 50+ positions
  ],
  
  tactics: [
    { fen: '...', theme: 'fork', solution: 'Nf7' },
    { fen: '...', theme: 'pin', solution: 'Bg5' },
    // ... 100+ tactical positions
  ],
  
  famous: [
    { name: 'Immortal Game', moves: '1. e4 e5 2. f4...', year: 1851 },
    // ... famous games
  ]
};
```

---

## Summary

**Test Suite Size**: 200+ tests  
**Coverage Target**: 80%+  
**Automation**: Full CI/CD with GitHub Actions  
**Critical Focus**: Verify Stockfish is real, not test version!  

**Development Time**: 1-2 weeks  
**Benefit**: Professional quality, catches bugs, confident deployments  

**Priority Items**:
1. ✅ Verify Stockfish is full-strength engine
2. ✅ All games work offline
3. ✅ Cross-browser compatibility
4. ✅ Performance targets met
5. ✅ No memory leaks

Ready for professional-grade QA! 🧪✅

