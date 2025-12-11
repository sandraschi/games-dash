import { describe, it, expect, beforeEach } from 'vitest';

// Gomoku game logic (5 in a row)
class Gomoku {
  constructor(size = 15) {
    this.size = size;
    this.board = Array(size).fill(null).map(() => Array(size).fill(0));
    this.currentPlayer = 1; // 1 = black, 2 = white
  }

  placeStone(row, col) {
    if (this.board[row][col] !== 0) return false;
    this.board[row][col] = this.currentPlayer;
    return true;
  }

  checkWin(row, col) {
    const color = this.board[row][col];
    if (!color) return false;

    const directions = [
      [[0, 1], [0, -1]],   // Horizontal
      [[1, 0], [-1, 0]],   // Vertical
      [[1, 1], [-1, -1]],  // Diagonal \
      [[1, -1], [-1, 1]]   // Diagonal /
    ];

    for (const [dir1, dir2] of directions) {
      let count = 1;
      count += this.countDirection(row, col, dir1[0], dir1[1], color);
      count += this.countDirection(row, col, dir2[0], dir2[1], color);

      if (count >= 5) return true;
    }

    return false;
  }

  countDirection(row, col, dr, dc, color) {
    let count = 0;
    let r = row + dr;
    let c = col + dc;

    while (r >= 0 && r < this.size && c >= 0 && c < this.size && 
           this.board[r][c] === color) {
      count++;
      r += dr;
      c += dc;
    }

    return count;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }
}

describe('Gomoku Game Logic', () => {
  let game;

  beforeEach(() => {
    game = new Gomoku(15);
  });

  describe('Stone Placement', () => {
    it('should place stone on empty cell', () => {
      expect(game.placeStone(7, 7)).toBe(true);
      expect(game.board[7][7]).toBe(1);
    });

    it('should reject placement on occupied cell', () => {
      game.placeStone(7, 7);
      expect(game.placeStone(7, 7)).toBe(false);
    });

    it('should reject placement outside board', () => {
      expect(() => game.placeStone(-1, 7)).toThrow();
      expect(() => game.placeStone(15, 7)).toThrow();
    });
  });

  describe('Win Detection', () => {
    it('should detect horizontal win', () => {
      game.placeStone(7, 5);
      game.switchPlayer();
      game.placeStone(6, 5);
      game.switchPlayer();
      game.placeStone(7, 6);
      game.switchPlayer();
      game.placeStone(6, 6);
      game.switchPlayer();
      game.placeStone(7, 7);
      game.switchPlayer();
      game.placeStone(6, 7);
      game.switchPlayer();
      game.placeStone(7, 8);
      game.switchPlayer();
      game.placeStone(6, 8);
      game.switchPlayer();
      game.placeStone(7, 9);
      
      expect(game.checkWin(7, 9)).toBe(true);
    });

    it('should detect vertical win', () => {
      // Place 5 stones vertically, all same player
      game.placeStone(5, 7);
      game.placeStone(6, 7);
      game.placeStone(7, 7);
      game.placeStone(8, 7);
      game.placeStone(9, 7);
      expect(game.checkWin(9, 7)).toBe(true);
    });

    it('should detect diagonal win (\)', () => {
      // Place 5 stones diagonally, all same player
      game.placeStone(5, 5);
      game.placeStone(6, 6);
      game.placeStone(7, 7);
      game.placeStone(8, 8);
      game.placeStone(9, 9);
      expect(game.checkWin(9, 9)).toBe(true);
    });

    it('should detect diagonal win (/)', () => {
      // Place 5 stones diagonally (other direction), all same player
      game.placeStone(5, 9);
      game.placeStone(6, 8);
      game.placeStone(7, 7);
      game.placeStone(8, 6);
      game.placeStone(9, 5);
      expect(game.checkWin(9, 5)).toBe(true);
    });

    it('should not detect win with only 4 in a row', () => {
      for (let i = 0; i < 4; i++) {
        game.placeStone(7, 5 + i);
        if (i < 3) game.switchPlayer();
      }
      expect(game.checkWin(7, 8)).toBe(false);
    });
  });

  describe('Player Switching', () => {
    it('should start with player 1 (black)', () => {
      expect(game.currentPlayer).toBe(1);
    });

    it('should switch players', () => {
      game.switchPlayer();
      expect(game.currentPlayer).toBe(2);
      game.switchPlayer();
      expect(game.currentPlayer).toBe(1);
    });
  });
});

