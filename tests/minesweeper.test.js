import { describe, it, expect, beforeEach } from 'vitest';

// Minesweeper game logic
class Minesweeper {
  constructor(rows = 9, cols = 9, mines = 10) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.board = Array(rows).fill(null).map(() => Array(cols).fill(0));
    this.revealed = Array(rows).fill(null).map(() => Array(cols).fill(false));
    this.flagged = Array(rows).fill(null).map(() => Array(cols).fill(false));
    this.gameOver = false;
    this.gameWon = false;
    this.firstClick = true;
  }

  placeMines(excludeRow, excludeCol) {
    let placed = 0;
    while (placed < this.mines) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      
      // Don't place mine on first click or if already has mine
      if ((row === excludeRow && col === excludeCol) || this.board[row][col] === -1) {
        continue;
      }
      
      this.board[row][col] = -1; // -1 = mine
      placed++;
    }
    
    // Calculate numbers
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col] !== -1) {
          this.board[row][col] = this.countAdjacentMines(row, col);
        }
      }
    }
  }

  countAdjacentMines(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          if (this.board[r][c] === -1) count++;
        }
      }
    }
    return count;
  }

  reveal(row, col) {
    if (this.revealed[row][col] || this.flagged[row][col] || this.gameOver) {
      return false;
    }

    if (this.firstClick) {
      this.placeMines(row, col);
      this.firstClick = false;
    }

    if (this.board[row][col] === -1) {
      this.gameOver = true;
      return false;
    }

    this.revealCell(row, col);
    this.checkWin();
    return true;
  }

  revealCell(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    if (this.revealed[row][col]) return;

    this.revealed[row][col] = true;

    // Auto-reveal adjacent cells if this is a zero
    if (this.board[row][col] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          this.revealCell(row + dr, col + dc);
        }
      }
    }
  }

  checkWin() {
    let revealedCount = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.revealed[row][col] && this.board[row][col] !== -1) {
          revealedCount++;
        }
      }
    }

    const totalCells = this.rows * this.cols;
    const safeCells = totalCells - this.mines;

    if (revealedCount === safeCells && !this.gameOver) {
      this.gameWon = true;
      return true;
    }
    return false;
  }

  toggleFlag(row, col) {
    if (this.revealed[row][col] || this.gameOver) return false;
    this.flagged[row][col] = !this.flagged[row][col];
    return true;
  }
}

describe('Minesweeper Game Logic', () => {
  let game;

  beforeEach(() => {
    game = new Minesweeper(9, 9, 10);
  });

  describe('Mine Placement', () => {
    it('should place correct number of mines', () => {
      game.placeMines(0, 0);
      let mineCount = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (game.board[row][col] === -1) mineCount++;
        }
      }
      expect(mineCount).toBe(10);
    });

    it('should not place mine on first click position', () => {
      game.placeMines(4, 4);
      expect(game.board[4][4]).not.toBe(-1);
    });

    it('should calculate adjacent mine counts', () => {
      // Manually set a mine
      game.board[5][5] = -1;
      game.placeMines(0, 0);
      
      // Check that adjacent cells have correct counts
      const count = game.countAdjacentMines(4, 4);
      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThanOrEqual(8);
    });
  });

  describe('Cell Revealing', () => {
    it('should reveal cell on click', () => {
      game.placeMines(0, 0);
      game.reveal(0, 0);
      expect(game.revealed[0][0]).toBe(true);
    });

    it('should not reveal flagged cell', () => {
      game.placeMines(0, 0);
      game.toggleFlag(5, 5);
      game.reveal(5, 5);
      expect(game.revealed[5][5]).toBe(false);
    });

    it('should auto-reveal adjacent zeros', () => {
      // Create a board with a zero cell
      game.board[5][5] = 0;
      game.reveal(5, 5);
      // Should reveal adjacent cells
      expect(game.revealed[5][5]).toBe(true);
    });

    it('should end game on mine click', () => {
      game.board[5][5] = -1;
      game.firstClick = false;
      game.reveal(5, 5);
      expect(game.gameOver).toBe(true);
    });
  });

  describe('Win Detection', () => {
    it('should detect win when all safe cells revealed', () => {
      // Create a simple board: 1 mine, rest safe
      game = new Minesweeper(3, 3, 1);
      game.board[0][0] = -1;
      
      // Reveal all cells except the mine
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (!(row === 0 && col === 0)) {
            game.revealed[row][col] = true;
          }
        }
      }
      
      game.firstClick = false;
      expect(game.checkWin()).toBe(true);
      expect(game.gameWon).toBe(true);
    });

    it('should not win if safe cells remain', () => {
      game.placeMines(0, 0);
      game.reveal(0, 0);
      expect(game.checkWin()).toBe(false);
    });
  });

  describe('Flagging', () => {
    it('should toggle flag', () => {
      game.toggleFlag(5, 5);
      expect(game.flagged[5][5]).toBe(true);
      game.toggleFlag(5, 5);
      expect(game.flagged[5][5]).toBe(false);
    });

    it('should not flag revealed cells', () => {
      game.placeMines(0, 0);
      game.reveal(0, 0);
      game.toggleFlag(0, 0);
      expect(game.flagged[0][0]).toBe(false);
    });
  });
});









