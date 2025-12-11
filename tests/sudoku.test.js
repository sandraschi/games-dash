import { describe, it, expect, beforeEach } from 'vitest';

// Sudoku validation logic
class Sudoku {
  constructor() {
    this.size = 9;
    this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
    this.given = Array(9).fill(null).map(() => Array(9).fill(false));
  }

  isValidPlacement(row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && this.grid[row][c] === num) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && this.grid[r][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (r !== row && c !== col && this.grid[r][c] === num) return false;
      }
    }

    return true;
  }

  setCell(row, col, num, isGiven = false) {
    if (isGiven) {
      this.given[row][col] = true;
    } else if (this.given[row][col]) {
      return false; // Can't modify given cells
    }

    if (num < 0 || num > 9) return false;
    this.grid[row][col] = num;
    return true;
  }

  isComplete() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0) return false;
        if (!this.isValidPlacement(row, col, this.grid[row][col])) return false;
      }
    }
    return true;
  }

  hasErrors() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] !== 0 && 
            !this.isValidPlacement(row, col, this.grid[row][col])) {
          return true;
        }
      }
    }
    return false;
  }
}

describe('Sudoku Validation Logic', () => {
  let sudoku;

  beforeEach(() => {
    sudoku = new Sudoku();
  });

  describe('Placement Validation', () => {
    it('should allow valid placement', () => {
      expect(sudoku.isValidPlacement(0, 0, 5)).toBe(true);
    });

    it('should reject duplicate in row', () => {
      sudoku.setCell(0, 0, 5);
      expect(sudoku.isValidPlacement(0, 1, 5)).toBe(false);
    });

    it('should reject duplicate in column', () => {
      sudoku.setCell(0, 0, 5);
      expect(sudoku.isValidPlacement(1, 0, 5)).toBe(false);
    });

    it('should reject duplicate in 3x3 box', () => {
      sudoku.setCell(0, 0, 5);
      expect(sudoku.isValidPlacement(1, 1, 5)).toBe(false);
    });

    it('should allow same number in different box (but not same row)', () => {
      sudoku.setCell(0, 0, 5);
      // Can't place 5 in same row (0,3) even if different box
      expect(sudoku.isValidPlacement(0, 3, 5)).toBe(false);
      // But can place in different row and box
      expect(sudoku.isValidPlacement(3, 3, 5)).toBe(true);
    });
  });

  describe('Cell Setting', () => {
    it('should set cell value', () => {
      sudoku.setCell(0, 0, 5);
      expect(sudoku.grid[0][0]).toBe(5);
    });

    it('should mark given cells', () => {
      sudoku.setCell(0, 0, 5, true);
      expect(sudoku.given[0][0]).toBe(true);
    });

    it('should prevent modifying given cells', () => {
      sudoku.setCell(0, 0, 5, true);
      expect(sudoku.setCell(0, 0, 6)).toBe(false);
      expect(sudoku.grid[0][0]).toBe(5);
    });

    it('should reject invalid numbers', () => {
      expect(sudoku.setCell(0, 0, 10)).toBe(false);
      expect(sudoku.setCell(0, 0, -1)).toBe(false);
    });
  });

  describe('Completion Check', () => {
    it('should detect incomplete grid', () => {
      expect(sudoku.isComplete()).toBe(false);
    });

    it('should detect complete valid grid', () => {
      // Fill with valid solution (simplified)
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const num = ((row * 3 + Math.floor(row / 3) + col) % 9) + 1;
          sudoku.setCell(row, col, num);
        }
      }
      expect(sudoku.isComplete()).toBe(true);
    });

    it('should detect errors in grid', () => {
      sudoku.setCell(0, 0, 5);
      sudoku.setCell(0, 1, 5); // Duplicate in row
      expect(sudoku.hasErrors()).toBe(true);
    });

    it('should not detect errors in valid grid', () => {
      sudoku.setCell(0, 0, 1);
      sudoku.setCell(0, 1, 2);
      sudoku.setCell(0, 2, 3);
      expect(sudoku.hasErrors()).toBe(false);
    });
  });
});

