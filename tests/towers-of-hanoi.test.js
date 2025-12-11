import { describe, it, expect, beforeEach } from 'vitest';

// Towers of Hanoi game logic
class TowersOfHanoi {
  constructor(numDisks = 3) {
    this.numDisks = numDisks;
    this.towers = [[], [], []];
    this.moveCount = 0;
    
    // Initialize: all disks on first tower
    for (let i = numDisks; i >= 1; i--) {
      this.towers[0].push(i);
    }
  }

  isValidMove(fromTower, toTower) {
    if (fromTower < 0 || fromTower > 2 || toTower < 0 || toTower > 2) {
      return false;
    }
    
    if (fromTower === toTower) {
      return false;
    }
    
    if (this.towers[fromTower].length === 0) {
      return false; // No disk to move
    }
    
    const disk = this.towers[fromTower][this.towers[fromTower].length - 1];
    const targetTop = this.towers[toTower].length > 0 
      ? this.towers[toTower][this.towers[toTower].length - 1]
      : Infinity;
    
    return disk < targetTop; // Can only place smaller on larger
  }

  moveDisk(fromTower, toTower) {
    if (!this.isValidMove(fromTower, toTower)) {
      return false;
    }
    
    const disk = this.towers[fromTower].pop();
    this.towers[toTower].push(disk);
    this.moveCount++;
    return true;
  }

  isSolved() {
    // Solved when all disks are on the last tower
    return this.towers[0].length === 0 && 
           this.towers[1].length === 0 && 
           this.towers[2].length === this.numDisks;
  }

  getMinimumMoves() {
    // Minimum moves to solve: 2^n - 1
    return Math.pow(2, this.numDisks) - 1;
  }

  reset() {
    this.towers = [[], [], []];
    this.moveCount = 0;
    for (let i = this.numDisks; i >= 1; i--) {
      this.towers[0].push(i);
    }
  }
}

describe('Towers of Hanoi Game Logic', () => {
  let game;

  beforeEach(() => {
    game = new TowersOfHanoi(3);
  });

  describe('Initialization', () => {
    it('should initialize with all disks on first tower', () => {
      expect(game.towers[0]).toEqual([3, 2, 1]);
      expect(game.towers[1]).toEqual([]);
      expect(game.towers[2]).toEqual([]);
    });

    it('should support different disk counts', () => {
      const game5 = new TowersOfHanoi(5);
      expect(game5.towers[0]).toEqual([5, 4, 3, 2, 1]);
      expect(game5.numDisks).toBe(5);
    });
  });

  describe('Move Validation', () => {
    it('should allow valid move (smaller on larger)', () => {
      expect(game.isValidMove(0, 1)).toBe(true);
    });

    it('should reject move from empty tower', () => {
      expect(game.isValidMove(1, 2)).toBe(false);
    });

    it('should reject move to same tower', () => {
      expect(game.isValidMove(0, 0)).toBe(false);
    });

    it('should reject move placing larger on smaller', () => {
      game.moveDisk(0, 1); // Move disk 1 to tower 1
      expect(game.isValidMove(0, 1)).toBe(false); // Can't move disk 2 onto disk 1
    });

    it('should reject invalid tower indices', () => {
      expect(game.isValidMove(-1, 1)).toBe(false);
      expect(game.isValidMove(0, 5)).toBe(false);
    });
  });

  describe('Move Execution', () => {
    it('should move disk correctly', () => {
      game.moveDisk(0, 1);
      expect(game.towers[0]).toEqual([3, 2]);
      expect(game.towers[1]).toEqual([1]);
      expect(game.moveCount).toBe(1);
    });

    it('should increment move count', () => {
      expect(game.moveCount).toBe(0);
      game.moveDisk(0, 1);
      expect(game.moveCount).toBe(1);
      game.moveDisk(0, 2);
      expect(game.moveCount).toBe(2);
    });

    it('should not move on invalid move', () => {
      const initial = JSON.parse(JSON.stringify(game.towers));
      game.moveDisk(0, 0); // Invalid
      expect(game.towers).toEqual(initial);
      expect(game.moveCount).toBe(0);
    });
  });

  describe('Win Detection', () => {
    it('should detect solved state', () => {
      // Solve 3-disk puzzle (minimum 7 moves)
      game.moveDisk(0, 2); // 1 to tower 2
      game.moveDisk(0, 1); // 2 to tower 1
      game.moveDisk(2, 1); // 1 to tower 1
      game.moveDisk(0, 2); // 3 to tower 2
      game.moveDisk(1, 0); // 1 to tower 0
      game.moveDisk(1, 2); // 2 to tower 2
      game.moveDisk(0, 2); // 1 to tower 2
      
      expect(game.isSolved()).toBe(true);
      expect(game.towers[2]).toEqual([3, 2, 1]);
    });

    it('should not detect win if not solved', () => {
      game.moveDisk(0, 1);
      expect(game.isSolved()).toBe(false);
    });
  });

  describe('Minimum Moves', () => {
    it('should calculate minimum moves correctly', () => {
      expect(game.getMinimumMoves()).toBe(7); // 2^3 - 1
      
      const game5 = new TowersOfHanoi(5);
      expect(game5.getMinimumMoves()).toBe(31); // 2^5 - 1
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      game.moveDisk(0, 1);
      game.moveDisk(0, 2);
      game.reset();
      
      expect(game.towers[0]).toEqual([3, 2, 1]);
      expect(game.towers[1]).toEqual([]);
      expect(game.towers[2]).toEqual([]);
      expect(game.moveCount).toBe(0);
    });
  });
});









