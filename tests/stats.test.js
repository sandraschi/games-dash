import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

// Stats Manager (simplified for testing)
class StatsManager {
  constructor() {
    this.stats = this.loadStats();
  }

  loadStats() {
    const stored = localStorage.getItem('gameStats');
    return stored ? JSON.parse(stored) : {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      highScores: {}
    };
  }

  saveStats() {
    localStorage.setItem('gameStats', JSON.stringify(this.stats));
  }

  recordGame(gameName, result, score = 0) {
    this.stats.gamesPlayed++;
    
    if (result === 'win') this.stats.wins++;
    else if (result === 'loss') this.stats.losses++;
    else if (result === 'draw') this.stats.draws++;
    
    if (score > 0) {
      const currentHigh = this.stats.highScores[gameName] || 0;
      if (score > currentHigh) {
        this.stats.highScores[gameName] = score;
      }
    }
    
    this.saveStats();
  }

  getStats() {
    return { ...this.stats };
  }

  getHighScore(gameName) {
    return this.stats.highScores[gameName] || 0;
  }

  resetStats() {
    this.stats = {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      highScores: {}
    };
    this.saveStats();
  }
}

describe('Stats Manager', () => {
  let statsManager;

  beforeEach(() => {
    localStorage.clear();
    statsManager = new StatsManager();
  });

  describe('Initialization', () => {
    it('should initialize with empty stats', () => {
      const stats = statsManager.getStats();
      expect(stats.gamesPlayed).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(0);
    });

    it('should load existing stats from localStorage', () => {
      localStorage.setItem('gameStats', JSON.stringify({
        gamesPlayed: 5,
        wins: 3,
        losses: 2,
        draws: 0,
        highScores: { 'chess': 100 }
      }));
      
      const newManager = new StatsManager();
      const stats = newManager.getStats();
      expect(stats.gamesPlayed).toBe(5);
      expect(stats.wins).toBe(3);
    });
  });

  describe('Recording Games', () => {
    it('should record a win', () => {
      statsManager.recordGame('chess', 'win');
      const stats = statsManager.getStats();
      expect(stats.gamesPlayed).toBe(1);
      expect(stats.wins).toBe(1);
      expect(stats.losses).toBe(0);
    });

    it('should record a loss', () => {
      statsManager.recordGame('chess', 'loss');
      const stats = statsManager.getStats();
      expect(stats.gamesPlayed).toBe(1);
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(1);
    });

    it('should record a draw', () => {
      statsManager.recordGame('chess', 'draw');
      const stats = statsManager.getStats();
      expect(stats.draws).toBe(1);
    });

    it('should track high scores', () => {
      statsManager.recordGame('tetris', 'win', 1000);
      expect(statsManager.getHighScore('tetris')).toBe(1000);
      
      statsManager.recordGame('tetris', 'win', 1500);
      expect(statsManager.getHighScore('tetris')).toBe(1500);
      
      statsManager.recordGame('tetris', 'win', 800);
      expect(statsManager.getHighScore('tetris')).toBe(1500); // Should keep highest
    });

    it('should track multiple games separately', () => {
      statsManager.recordGame('chess', 'win', 100);
      statsManager.recordGame('checkers', 'win', 200);
      
      expect(statsManager.getHighScore('chess')).toBe(100);
      expect(statsManager.getHighScore('checkers')).toBe(200);
    });
  });

  describe('Stats Retrieval', () => {
    it('should return copy of stats', () => {
      statsManager.recordGame('chess', 'win');
      const stats1 = statsManager.getStats();
      const stats2 = statsManager.getStats();
      
      expect(stats1).toEqual(stats2);
      expect(stats1).not.toBe(stats2); // Different objects
    });

    it('should return 0 for non-existent high score', () => {
      expect(statsManager.getHighScore('nonexistent')).toBe(0);
    });
  });

  describe('Stats Reset', () => {
    it('should reset all stats', () => {
      statsManager.recordGame('chess', 'win', 100);
      statsManager.recordGame('checkers', 'loss');
      
      statsManager.resetStats();
      
      const stats = statsManager.getStats();
      expect(stats.gamesPlayed).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.highScores).toEqual({});
    });
  });
});

