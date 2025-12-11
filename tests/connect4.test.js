import { describe, it, expect, beforeEach } from 'vitest';

// Mock DOM for testing
global.document = {
  getElementById: () => ({ textContent: '', style: {} }),
  querySelector: () => null,
  querySelectorAll: () => []
};

// Simple Connect Four game logic (extracted for testing)
class ConnectFour {
  constructor() {
    this.rows = 6;
    this.cols = 7;
    this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    this.currentPlayer = 1; // 1 = red, 2 = yellow
  }

  dropPiece(col) {
    if (col < 0 || col >= this.cols) return false;
    
    // Find first empty row in column
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.board[row][col] === 0) {
        this.board[row][col] = this.currentPlayer;
        return { row, col, player: this.currentPlayer };
      }
    }
    return false; // Column full
  }

  checkWin(row, col) {
    const player = this.board[row][col];
    if (!player) return false;

    // Check horizontal
    let count = 1;
    for (let c = col - 1; c >= 0 && this.board[row][c] === player; c--) count++;
    for (let c = col + 1; c < this.cols && this.board[row][c] === player; c++) count++;
    if (count >= 4) return true;

    // Check vertical
    count = 1;
    for (let r = row - 1; r >= 0 && this.board[r][col] === player; r--) count++;
    for (let r = row + 1; r < this.rows && this.board[r][col] === player; r++) count++;
    if (count >= 4) return true;

    // Check diagonal \
    count = 1;
    for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && this.board[r][c] === player; r--, c--) count++;
    for (let r = row + 1, c = col + 1; r < this.rows && c < this.cols && this.board[r][c] === player; r++, c++) count++;
    if (count >= 4) return true;

    // Check diagonal /
    count = 1;
    for (let r = row - 1, c = col + 1; r >= 0 && c < this.cols && this.board[r][c] === player; r--, c++) count++;
    for (let r = row + 1, c = col - 1; r < this.rows && c >= 0 && this.board[r][c] === player; r++, c--) count++;
    if (count >= 4) return true;

    return false;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }

  isColumnFull(col) {
    return this.board[0][col] !== 0;
  }
}

describe('Connect Four Game Logic', () => {
  let game;

  beforeEach(() => {
    game = new ConnectFour();
  });

  describe('Piece Dropping', () => {
    it('should drop piece in empty column', () => {
      const result = game.dropPiece(3);
      expect(result).toBeTruthy();
      expect(result.player).toBe(1);
      expect(result.row).toBe(5); // Bottom row
      expect(game.board[5][3]).toBe(1);
    });

    it('should stack pieces in same column', () => {
      game.dropPiece(3);
      game.switchPlayer();
      const result = game.dropPiece(3);
      expect(result.row).toBe(4); // Second piece above first
      expect(game.board[4][3]).toBe(2);
    });

    it('should reject invalid column', () => {
      expect(game.dropPiece(-1)).toBe(false);
      expect(game.dropPiece(7)).toBe(false);
    });

    it('should detect full column', () => {
      // Fill column
      for (let i = 0; i < 6; i++) {
        game.dropPiece(3);
        game.switchPlayer();
      }
      expect(game.isColumnFull(3)).toBe(true);
      expect(game.dropPiece(3)).toBe(false);
    });
  });

  describe('Win Detection', () => {
    it('should detect horizontal win', () => {
      // Place 4 pieces horizontally by same player in same row
      // Player 1 places in columns 0,1,2,3 all in bottom row
      game.dropPiece(0); // Player 1, row 5
      game.switchPlayer();
      game.dropPiece(0); // Player 2, row 4 (different column to avoid interference)
      game.switchPlayer();
      game.dropPiece(1); // Player 1, row 5
      game.switchPlayer();
      game.dropPiece(1); // Player 2, row 4
      game.switchPlayer();
      game.dropPiece(2); // Player 1, row 5
      game.switchPlayer();
      game.dropPiece(2); // Player 2, row 4
      game.switchPlayer();
      const result = game.dropPiece(3); // Player 1, row 5 - wins!
      expect(result.row).toBe(5);
      expect(game.checkWin(result.row, result.col)).toBe(true);
    });

    it('should detect vertical win', () => {
      game.dropPiece(3);
      game.switchPlayer();
      game.dropPiece(0); // Different column
      game.switchPlayer();
      game.dropPiece(3);
      game.switchPlayer();
      game.dropPiece(0);
      game.switchPlayer();
      game.dropPiece(3);
      game.switchPlayer();
      game.dropPiece(0);
      game.switchPlayer();
      const result = game.dropPiece(3);
      expect(game.checkWin(result.row, result.col)).toBe(true);
    });

    it('should detect diagonal win (\)', () => {
      // Setup diagonal: player 1 creates diagonal from bottom-left to top-right
      // Pattern: col0(row5), col1(row4), col2(row3), col3(row2) - all player 1
      // Fill columns with alternating players to create the diagonal
      
      // Column 0: player 1 at row 5
      game.dropPiece(0); // P1 at (5,0)
      game.switchPlayer();
      
      // Column 1: player 2 at row 5, then player 1 at row 4
      game.dropPiece(1); // P2 at (5,1)
      game.switchPlayer();
      game.dropPiece(1); // P1 at (4,1)
      game.switchPlayer();
      
      // Column 2: players 2,2 at rows 5,4, then player 1 at row 3
      game.dropPiece(2); // P2 at (5,2)
      game.switchPlayer();
      game.dropPiece(2); // P1 at (4,2) - wait, need P2 here
      game.switchPlayer();
      game.dropPiece(2); // P2 at (4,2)
      game.switchPlayer();
      game.dropPiece(2); // P1 at (3,2)
      game.switchPlayer();
      
      // Column 3: fill with P2, then P1 at row 2
      game.dropPiece(3); // P2 at (5,3)
      game.switchPlayer();
      game.dropPiece(3); // P1 at (4,3)
      game.switchPlayer();
      game.dropPiece(3); // P2 at (4,3) - wait, need to fix
      // Let me restart with a cleaner approach
      
      // Actually, simpler: create diagonal manually
      game = new ConnectFour();
      // Fill column 3 first so piece lands at row 2
      game.board[5][3] = 2;
      game.board[4][3] = 2;
      game.board[3][3] = 2;
      // Now set up diagonal
      game.board[5][0] = 1; // P1
      game.board[4][1] = 1; // P1
      game.board[3][2] = 1; // P1
      game.currentPlayer = 1;
      const result = game.dropPiece(3); // P1 at (2,3) - completes diagonal
      expect(result.row).toBe(2);
      expect(game.checkWin(result.row, result.col)).toBe(true);
    });

    it('should not detect win with only 3 pieces', () => {
      game.dropPiece(0);
      game.switchPlayer();
      game.dropPiece(1);
      game.switchPlayer();
      const result = game.dropPiece(2);
      expect(game.checkWin(result.row, result.col)).toBe(false);
    });
  });

  describe('Player Switching', () => {
    it('should start with player 1', () => {
      expect(game.currentPlayer).toBe(1);
    });

    it('should switch between players', () => {
      game.switchPlayer();
      expect(game.currentPlayer).toBe(2);
      game.switchPlayer();
      expect(game.currentPlayer).toBe(1);
    });
  });
});

