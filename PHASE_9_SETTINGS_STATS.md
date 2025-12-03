# Phase 9: Settings, Stats & Customization

**Target**: 2 weeks  
**Priority**: MEDIUM-HIGH  
**Date**: 2025-12-03

---

## Universal Settings System

Every game gets a settings modal with game-specific options plus common settings.

### Architecture

```javascript
// settings-manager.js
class SettingsManager {
  constructor() {
    this.globalSettings = this.loadGlobalSettings();
    this.gameSettings = {};
  }
  
  loadGlobalSettings() {
    const defaults = {
      theme: 'dark', // dark, light, auto
      soundEnabled: true,
      musicEnabled: false,
      soundVolume: 0.7,
      musicVolume: 0.5,
      showFPS: false,
      showHints: true,
      confirmActions: true,
      animationSpeed: 'normal', // slow, normal, fast
      language: 'en',
      accessibility: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        colorBlindMode: 'none' // none, protanopia, deuteranopia, tritanopia
      }
    };
    
    const stored = localStorage.getItem('globalSettings');
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  }
  
  saveGlobalSettings() {
    localStorage.setItem('globalSettings', JSON.stringify(this.globalSettings));
  }
  
  loadGameSettings(gameType) {
    const key = `${gameType}_settings`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      this.gameSettings[gameType] = JSON.parse(stored);
    } else {
      this.gameSettings[gameType] = this.getDefaultGameSettings(gameType);
    }
    
    return this.gameSettings[gameType];
  }
  
  saveGameSettings(gameType) {
    const key = `${gameType}_settings`;
    localStorage.setItem(key, JSON.stringify(this.gameSettings[gameType]));
  }
  
  getDefaultGameSettings(gameType) {
    // Game-specific defaults
    const defaults = {
      // Pong
      pong: {
        aiSpeed: 5, // 1-10
        ballSpeed: 5, // 1-10
        paddleSize: 'normal', // small, normal, large
        ballSize: 'normal', // small, normal, large
        numBalls: 1, // 1-5 (multiball madness!)
        scoreLimit: 5,
        powerUps: false,
        wallBounce: true
      },
      
      // Tetris
      tetris: {
        startLevel: 1,
        ghostPiece: true,
        holdPiece: true,
        hardDropEnabled: true,
        rotationSystem: 'SRS', // SRS, Classic
        das: 133, // Delayed Auto Shift (ms)
        arr: 10, // Auto Repeat Rate (ms)
        sdf: 20, // Soft Drop Factor
        nextPiecesShown: 3, // 1-6
        gridStyle: 'classic', // classic, modern, minimal
        colors: 'standard' // standard, monochrome, custom
      },
      
      // Snake
      snake: {
        speed: 5, // 1-10
        gridSize: 20, // 15, 20, 25, 30
        foodCount: 1, // 1-5
        wallCollision: true,
        selfCollision: true,
        growthRate: 1, // pieces per food
        startLength: 3,
        obstacles: false,
        randomObstacles: 0, // 0-10 obstacles
        theme: 'classic' // classic, neon, retro
      },
      
      // Chess
      chess: {
        aiLevel: 10, // 1-20 (Stockfish depth)
        timeControl: 'unlimited', // unlimited, blitz, rapid, classical
        blitzTime: 180, // 3 minutes
        rapidTime: 600, // 10 minutes
        increment: 0, // seconds per move
        showLegalMoves: true,
        highlightLastMove: true,
        autoQueen: false,
        boardStyle: 'standard', // standard, wooden, marble, glass
        pieceSet: 'classic', // classic, modern, minimalist
        soundEffects: true,
        moveValidation: true,
        takeback: true,
        hints: false
      },
      
      // Breakout
      breakout: {
        paddleSize: 'normal', // small, normal, large
        ballSpeed: 5, // 1-10
        brickRows: 5, // 3-8
        brickCols: 9, // 7-12
        ballSize: 'normal', // small, normal, large
        lives: 3, // 1-5
        powerUps: true,
        stickyPaddle: false,
        multiBall: false,
        brickHits: 1 // hits to break (1-3)
      },
      
      // Pac-Man
      pacman: {
        lives: 3,
        ghostAI: 'classic', // classic, easy, hard, random
        fruitFrequency: 'normal', // rare, normal, frequent
        energizerDuration: 6000, // ms
        ghostSpeed: 5, // 1-10
        pacmanSpeed: 5, // 1-10
        mazeStyle: 'classic', // classic, modern, custom
        ghostBehavior: 'original' // original, aggressive, defensive
      },
      
      // Poker
      poker: {
        startingChips: 1000,
        smallBlind: 10,
        bigBlind: 20,
        blindIncreaseInterval: 10, // hands
        timeLimit: 30, // seconds per turn
        aiPersonality: 'balanced', // tight, loose, aggressive, balanced
        showProbabilities: false,
        dealerSpeed: 'normal', // slow, normal, fast
        autoFold: false
      },
      
      // Sudoku
      sudoku: {
        difficulty: 'medium', // easy, medium, hard, expert
        hints: 3, // per puzzle
        autoCheckErrors: true,
        highlightRelated: true,
        pencilMarksEnabled: true,
        timer: true,
        soundOnError: true
      },
      
      // Word Search
      wordsearch: {
        gridSize: '15x15', // 10x10, 15x15, 20x20
        difficulty: 'medium',
        theme: 'random', // or specific themes
        timer: true,
        highlightFound: true,
        allowDiagonals: true,
        allowBackwards: true
      }
    };
    
    return defaults[gameType] || {};
  }
  
  getSetting(key) {
    return this.globalSettings[key];
  }
  
  setSetting(key, value) {
    this.globalSettings[key] = value;
    this.saveGlobalSettings();
    this.applySettings();
  }
  
  getGameSetting(gameType, key) {
    if (!this.gameSettings[gameType]) {
      this.loadGameSettings(gameType);
    }
    return this.gameSettings[gameType][key];
  }
  
  setGameSetting(gameType, key, value) {
    if (!this.gameSettings[gameType]) {
      this.loadGameSettings(gameType);
    }
    this.gameSettings[gameType][key] = value;
    this.saveGameSettings(gameType);
  }
  
  applySettings() {
    // Apply theme
    document.body.className = `theme-${this.globalSettings.theme}`;
    
    // Apply accessibility
    if (this.globalSettings.accessibility.highContrast) {
      document.body.classList.add('high-contrast');
    }
    
    if (this.globalSettings.accessibility.largeText) {
      document.body.classList.add('large-text');
    }
  }
}

export const settingsManager = new SettingsManager();
```

---

## Settings Modal UI

### Universal Settings Modal

```html
<!-- settings-modal.html -->
<div id="settings-modal" class="modal">
  <div class="modal-content settings-content">
    <div class="settings-header">
      <h2>⚙️ Settings</h2>
      <button class="close-btn" onclick="closeSettings()">×</button>
    </div>
    
    <div class="settings-tabs">
      <button class="tab-btn active" data-tab="general">General</button>
      <button class="tab-btn" data-tab="game">Game Settings</button>
      <button class="tab-btn" data-tab="audio">Audio</button>
      <button class="tab-btn" data-tab="accessibility">Accessibility</button>
    </div>
    
    <div class="settings-content-area">
      <!-- General Tab -->
      <div class="tab-content active" id="general-tab">
        <div class="setting-group">
          <label>Theme</label>
          <select id="theme-select">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>
        
        <div class="setting-group">
          <label>Language</label>
          <select id="language-select">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        
        <div class="setting-group">
          <label>Animation Speed</label>
          <div class="radio-group">
            <label><input type="radio" name="animSpeed" value="slow"> Slow</label>
            <label><input type="radio" name="animSpeed" value="normal" checked> Normal</label>
            <label><input type="radio" name="animSpeed" value="fast"> Fast</label>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="checkbox-label">
            <input type="checkbox" id="show-fps"> Show FPS Counter
          </label>
        </div>
        
        <div class="setting-group">
          <label class="checkbox-label">
            <input type="checkbox" id="show-hints" checked> Show Hints
          </label>
        </div>
        
        <div class="setting-group">
          <label class="checkbox-label">
            <input type="checkbox" id="confirm-actions" checked> Confirm Important Actions
          </label>
        </div>
      </div>
      
      <!-- Game Settings Tab (Dynamic based on current game) -->
      <div class="tab-content" id="game-tab">
        <div id="game-settings-container">
          <!-- Populated dynamically -->
        </div>
      </div>
      
      <!-- Audio Tab -->
      <div class="tab-content" id="audio-tab">
        <div class="setting-group">
          <label class="checkbox-label">
            <input type="checkbox" id="sound-enabled" checked> Sound Effects
          </label>
        </div>
        
        <div class="setting-group">
          <label>Sound Volume</label>
          <input type="range" id="sound-volume" min="0" max="100" value="70">
          <span class="value-display">70%</span>
        </div>
        
        <div class="setting-group">
          <label class="checkbox-label">
            <input type="checkbox" id="music-enabled"> Background Music
          </label>
        </div>
        
        <div class="setting-group">
          <label>Music Volume</label>
          <input type="range" id="music-volume" min="0" max="100" value="50">
          <span class="value-display">50%</span>
        </div>
      </div>
      
      <!-- Accessibility Tab -->
      <div class="tab-content" id="accessibility-tab">
        <div class="setting-group">
          <label class="checkbox-label">
            <input type="checkbox" id="high-contrast"> High Contrast Mode
          </label>
        </div>
        
        <div class="setting-group">
          <label class="checkbox-label">
            <input type="checkbox" id="large-text"> Large Text
          </label>
        </div>
        
        <div class="setting-group">
          <label>Color Blind Mode</label>
          <select id="colorblind-mode">
            <option value="none">None</option>
            <option value="protanopia">Protanopia (Red-Blind)</option>
            <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
            <option value="tritanopia">Tritanopia (Blue-Blind)</option>
          </select>
        </div>
        
        <div class="setting-group">
          <label class="checkbox-label">
            <input type="checkbox" id="screen-reader"> Screen Reader Support
          </label>
        </div>
      </div>
    </div>
    
    <div class="settings-footer">
      <button class="btn-secondary" onclick="resetToDefaults()">Reset to Defaults</button>
      <button class="btn-primary" onclick="saveSettings()">Save Changes</button>
    </div>
  </div>
</div>
```

### Pong-Specific Settings (Example)

```html
<!-- Pong Settings (injected into game-settings-container) -->
<div class="game-settings" id="pong-settings">
  <h3>🏓 Pong Settings</h3>
  
  <div class="setting-group">
    <label>AI Paddle Speed</label>
    <input type="range" id="ai-speed" min="1" max="10" value="5">
    <span class="value-display">5</span>
    <p class="setting-description">How fast the AI paddle moves (1=Slow, 10=Lightning)</p>
  </div>
  
  <div class="setting-group">
    <label>Ball Speed</label>
    <input type="range" id="ball-speed" min="1" max="10" value="5">
    <span class="value-display">5</span>
  </div>
  
  <div class="setting-group">
    <label>Paddle Size</label>
    <select id="paddle-size">
      <option value="small">Small (40px)</option>
      <option value="normal" selected>Normal (80px)</option>
      <option value="large">Large (120px)</option>
      <option value="huge">Huge (160px)</option>
    </select>
  </div>
  
  <div class="setting-group">
    <label>Ball Size</label>
    <select id="ball-size">
      <option value="tiny">Tiny (5px)</option>
      <option value="small">Small (8px)</option>
      <option value="normal" selected>Normal (10px)</option>
      <option value="large">Large (15px)</option>
      <option value="huge">Huge (20px)</option>
    </select>
  </div>
  
  <div class="setting-group">
    <label>Number of Balls 🎱</label>
    <input type="range" id="num-balls" min="1" max="5" value="1">
    <span class="value-display">1</span>
    <div class="multiball-preview">
      <span class="ball" v-for="n in numBalls">●</span>
    </div>
    <p class="setting-description">1 = Classic, 5 = Multiball Mayhem!</p>
  </div>
  
  <div class="setting-group">
    <label>Score to Win</label>
    <input type="number" id="score-limit" min="1" max="21" value="5">
  </div>
  
  <div class="setting-group">
    <label class="checkbox-label">
      <input type="checkbox" id="power-ups"> Enable Power-Ups
    </label>
    <p class="setting-description">Speed boost, slow motion, paddle resize</p>
  </div>
  
  <div class="setting-group">
    <label class="checkbox-label">
      <input type="checkbox" id="wall-bounce" checked> Walls Bounce
    </label>
    <p class="setting-description">If unchecked, hitting top/bottom wall is game over!</p>
  </div>
  
  <div class="setting-group">
    <label>Game Mode</label>
    <select id="game-mode">
      <option value="classic">Classic</option>
      <option value="survival">Survival (AI gets faster)</option>
      <option value="challenge">Challenge (Random events)</option>
    </select>
  </div>
  
  <div class="settings-preview">
    <h4>Preview</h4>
    <canvas id="settings-preview-canvas" width="300" height="200"></canvas>
  </div>
</div>
```

---

## Statistics System

### Stats Dashboard

```javascript
// stats-manager.js
class StatsManager {
  constructor() {
    this.db = getFirestore();
  }
  
  async recordGame(gameResult) {
    const user = authManager.getCurrentUser();
    
    // Save to games history
    await addDoc(collection(this.db, 'games'), {
      ...gameResult,
      timestamp: serverTimestamp()
    });
    
    // Update user stats
    await this.updateUserStats(user.uid, gameResult);
    
    // Update game-specific stats
    await this.updateGameStats(user.uid, gameResult.gameType, gameResult);
    
    // Check achievements
    await this.checkAchievements(user.uid, gameResult);
  }
  
  async updateUserStats(uid, gameResult) {
    const userRef = doc(this.db, 'users', uid);
    const userDoc = await getDoc(userRef);
    const currentStats = userDoc.data().stats || {};
    
    const updates = {
      'stats.gamesPlayed': (currentStats.gamesPlayed || 0) + 1,
      'stats.totalPlayTime': (currentStats.totalPlayTime || 0) + gameResult.duration,
      'stats.lastGame': serverTimestamp()
    };
    
    if (gameResult.result === 'win') {
      updates['stats.gamesWon'] = (currentStats.gamesWon || 0) + 1;
    }
    
    await updateDoc(userRef, updates);
  }
  
  async updateGameStats(uid, gameType, gameResult) {
    const statsRef = doc(this.db, 'stats', `${uid}_${gameType}`);
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      // Create new stats document
      await setDoc(statsRef, {
        uid,
        gameType,
        gamesPlayed: 1,
        wins: gameResult.result === 'win' ? 1 : 0,
        losses: gameResult.result === 'loss' ? 1 : 0,
        draws: gameResult.result === 'draw' ? 1 : 0,
        highScore: gameResult.score || 0,
        averageScore: gameResult.score || 0,
        totalTime: gameResult.duration || 0,
        elo: 1500,
        eloHistory: [{ date: new Date(), elo: 1500 }],
        gameSpecific: this.getGameSpecificStats(gameType, gameResult)
      });
    } else {
      // Update existing stats
      const currentStats = statsDoc.data();
      const newGamesPlayed = currentStats.gamesPlayed + 1;
      
      const updates = {
        gamesPlayed: newGamesPlayed,
        wins: gameResult.result === 'win' ? currentStats.wins + 1 : currentStats.wins,
        losses: gameResult.result === 'loss' ? currentStats.losses + 1 : currentStats.losses,
        draws: gameResult.result === 'draw' ? currentStats.draws + 1 : currentStats.draws,
        totalTime: currentStats.totalTime + gameResult.duration,
        highScore: Math.max(currentStats.highScore, gameResult.score || 0),
        averageScore: (currentStats.averageScore * currentStats.gamesPlayed + (gameResult.score || 0)) / newGamesPlayed
      };
      
      // Update ELO
      if (gameResult.opponent && gameResult.opponent.elo) {
        const newElo = this.calculateElo(currentStats.elo, gameResult.opponent.elo, gameResult.result);
        updates.elo = newElo;
        updates.eloHistory = [...(currentStats.eloHistory || []), { date: new Date(), elo: newElo }];
      }
      
      // Update game-specific stats
      updates.gameSpecific = this.updateGameSpecificStats(
        gameType,
        currentStats.gameSpecific || {},
        gameResult
      );
      
      await updateDoc(statsRef, updates);
    }
  }
  
  getGameSpecificStats(gameType, gameResult) {
    switch(gameType) {
      case 'tetris':
        return {
          linesCleared: gameResult.lines || 0,
          tetrisCount: gameResult.tetrises || 0,
          level: gameResult.level || 1
        };
      case 'chess':
        return {
          checkmates: gameResult.checkmate ? 1 : 0,
          stalemates: gameResult.stalemate ? 1 : 0,
          averageMoves: gameResult.moves || 0,
          opening: gameResult.opening || 'unknown'
        };
      case 'poker':
        return {
          handsPlayed: 1,
          biggestPot: gameResult.pot || 0,
          handsWon: gameResult.result === 'win' ? 1 : 0
        };
      default:
        return {};
    }
  }
  
  updateGameSpecificStats(gameType, currentStats, gameResult) {
    switch(gameType) {
      case 'tetris':
        return {
          linesCleared: (currentStats.linesCleared || 0) + (gameResult.lines || 0),
          tetrisCount: (currentStats.tetrisCount || 0) + (gameResult.tetrises || 0),
          level: Math.max(currentStats.level || 1, gameResult.level || 1)
        };
      case 'chess':
        return {
          checkmates: (currentStats.checkmates || 0) + (gameResult.checkmate ? 1 : 0),
          stalemates: (currentStats.stalemates || 0) + (gameResult.stalemate ? 1 : 0),
          averageMoves: ((currentStats.averageMoves || 0) * (currentStats.gamesPlayed || 1) + (gameResult.moves || 0)) / ((currentStats.gamesPlayed || 1) + 1),
          openingsPlayed: {
            ...(currentStats.openingsPlayed || {}),
            [gameResult.opening || 'unknown']: ((currentStats.openingsPlayed || {})[gameResult.opening || 'unknown'] || 0) + 1
          }
        };
      default:
        return currentStats;
    }
  }
  
  calculateElo(playerElo, opponentElo, result) {
    const K = 32; // K-factor
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    return Math.round(playerElo + K * (actualScore - expectedScore));
  }
  
  async getStats(uid, gameType = null) {
    if (gameType) {
      const statsRef = doc(this.db, 'stats', `${uid}_${gameType}`);
      const statsDoc = await getDoc(statsRef);
      return statsDoc.exists() ? statsDoc.data() : null;
    } else {
      // Get all stats for user
      const statsQuery = query(
        collection(this.db, 'stats'),
        where('uid', '==', uid)
      );
      const snapshot = await getDocs(statsQuery);
      const stats = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        stats[data.gameType] = data;
      });
      return stats;
    }
  }
  
  async getLeaderboard(gameType, metric = 'elo', limit = 100) {
    const statsQuery = query(
      collection(this.db, 'stats'),
      where('gameType', '==', gameType),
      orderBy(metric, 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(statsQuery);
    const leaderboard = [];
    
    snapshot.forEach(doc => {
      leaderboard.push(doc.data());
    });
    
    return leaderboard;
  }
}

export const statsManager = new StatsManager();
```

### Stats Dashboard UI

```html
<!-- stats-dashboard.html -->
<div class="stats-dashboard">
  <div class="stats-header">
    <h2>📊 Statistics</h2>
    <select id="game-filter">
      <option value="all">All Games</option>
      <option value="chess">Chess</option>
      <option value="poker">Poker</option>
      <option value="tetris">Tetris</option>
      <!-- ... -->
    </select>
  </div>
  
  <div class="stats-grid">
    <!-- Overview Cards -->
    <div class="stat-card">
      <div class="stat-icon">🎮</div>
      <div class="stat-value">150</div>
      <div class="stat-label">Games Played</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-value">75</div>
      <div class="stat-label">Wins</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">📈</div>
      <div class="stat-value">50%</div>
      <div class="stat-label">Win Rate</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">⏱️</div>
      <div class="stat-value">10h</div>
      <div class="stat-label">Play Time</div>
    </div>
  </div>
  
  <!-- Charts -->
  <div class="stats-charts">
    <div class="chart-container">
      <h3>ELO Progression</h3>
      <canvas id="elo-chart"></canvas>
    </div>
    
    <div class="chart-container">
      <h3>Games by Type</h3>
      <canvas id="games-pie-chart"></canvas>
    </div>
    
    <div class="chart-container">
      <h3>Win/Loss Trend</h3>
      <canvas id="winloss-chart"></canvas>
    </div>
  </div>
  
  <!-- Detailed Stats Tables -->
  <div class="stats-tables">
    <h3>Detailed Statistics</h3>
    <table class="stats-table">
      <thead>
        <tr>
          <th>Game</th>
          <th>Played</th>
          <th>Won</th>
          <th>Win Rate</th>
          <th>ELO</th>
          <th>High Score</th>
          <th>Avg Score</th>
        </tr>
      </thead>
      <tbody id="stats-table-body">
        <!-- Populated dynamically -->
      </tbody>
    </table>
  </div>
  
  <!-- Recent Games -->
  <div class="recent-games">
    <h3>Recent Games</h3>
    <div class="games-list" id="recent-games-list">
      <!-- Game entries -->
    </div>
  </div>
</div>
```

---

## Settings Presets

Quick settings for different play styles:

```javascript
const PRESETS = {
  casual: {
    aiLevel: 3,
    timeControl: 'unlimited',
    hints: true,
    animations: 'normal'
  },
  competitive: {
    aiLevel: 8,
    timeControl: 'rapid',
    hints: false,
    animations: 'fast'
  },
  learning: {
    aiLevel: 4,
    timeControl: 'unlimited',
    hints: true,
    showSuggestions: true,
    animations: 'slow'
  },
  speedrun: {
    aiLevel: 10,
    animations: 'fast',
    autoConfirm: true,
    hints: false
  }
};
```

---

## Summary

**Settings System**: Complete customization for all games
- Universal settings (theme, sound, accessibility)
- Game-specific settings (AI speed, difficulty, visuals)
- Settings presets for quick configuration
- Live preview of settings changes

**Stats System**: Comprehensive tracking
- Per-game statistics
- ELO rating system
- Leaderboards
- Achievement tracking
- Detailed analytics with charts

**Total Time**: 2 weeks implementation

All ready for Phase 7-9 implementation! 🚀

