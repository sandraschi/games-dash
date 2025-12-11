import { describe, it, expect, beforeEach } from 'vitest';

// Checkers game logic
class Checkers {
  constructor() {
    this.size = 8;
    this.board = Array(8).fill(null).map(() => Array(8).fill(0));
    this.currentPlayer = 1; // 1 = red, 2 = black
    this.setup();
  }

  setup() {
    // Red pieces (1) on top rows, Black pieces (2) on bottom rows
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          this.board[row][col] = 2; // Black
        }
      }
    }
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          this.board[row][col] = 1; // Red
        }
      }
    }
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    // Check bounds
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) return false;
    if (fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8) return false;

    const piece = this.board[fromRow][fromCol];
    if (piece === 0 || piece !== this.currentPlayer) return false;
    if (this.board[toRow][toCol] !== 0) return false;

    // Must move diagonally
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    if (rowDiff !== colDiff) return false;

    // Regular pieces move forward only
    if (piece === 1 && toRow > fromRow) return false; // Red moves up
    if (piece === 2 && toRow < fromRow) return false; // Black moves down

    // Can move one square or jump two
    if (rowDiff === 1) return true;
    if (rowDiff === 2) {
      // Check if jumping over opponent
      const midRow = (fromRow + toRow) / 2;
      const midCol = (fromCol + toCol) / 2;
      const midPiece = this.board[midRow][midCol];
      return midPiece !== 0 && midPiece !== this.currentPlayer;
    }

    return false;
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
      return false;
    }

    const piece = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = 0;
    this.board[toRow][toCol] = piece;

    // Handle jump
    const rowDiff = Math.abs(toRow - fromRow);
    if (rowDiff === 2) {
      const midRow = (fromRow + toRow) / 2;
      const midCol = (fromCol + toCol) / 2;
      this.board[midRow][midCol] = 0; // Remove captured piece
    }

    // Check for king promotion
    if (piece === 1 && toRow === 0) {
      this.board[toRow][toCol] = 3; // Red king
    } else if (piece === 2 && toRow === 7) {
      this.board[toRow][toCol] = 4; // Black king
    }

    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    return true;
  }

  checkWinner() {
    let redCount = 0;
    let blackCount = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece === 1 || piece === 3) redCount++;
        if (piece === 2 || piece === 4) blackCount++;
      }
    }

    if (redCount === 0) return 2; // Black wins
    if (blackCount === 0) return 1; // Red wins
    return 0; // Game continues
  }
}

describe('Checkers Game Logic', () => {
  let game;

  beforeEach(() => {
    game = new Checkers();
  });

  describe('Initial Setup', () => {
    it('should setup board with pieces', () => {
      expect(game.board[0][1]).toBe(2); // Black piece
      expect(game.board[7][0]).toBe(1); // Red piece
    });

    it('should start with red player', () => {
      expect(game.currentPlayer).toBe(1);
    });
  });

  describe('Move Validation', () => {
    it('should allow forward diagonal move', () => {
      // Red piece at (5,0) can move to (4,1) - setup valid position
      game.board[5][0] = 1; // Place red piece on valid dark square
      expect(game.isValidMove(5, 0, 4, 1)).toBe(true);
    });

    it('should reject backward move for regular piece', () => {
      // Red piece cannot move backward
      game.board[5][0] = 1;
      expect(game.isValidMove(5, 0, 6, 1)).toBe(false);
    });

    it('should reject move to occupied square', () => {
      game.board[5][0] = 1;
      game.board[4][1] = 2; // Black piece blocking
      expect(game.isValidMove(5, 0, 4, 1)).toBe(false);
    });

    it('should reject non-diagonal move', () => {
      game.board[5][0] = 1;
      expect(game.isValidMove(5, 0, 5, 2)).toBe(false); // Horizontal
      expect(game.isValidMove(5, 0, 4, 0)).toBe(false); // Vertical
    });

    it('should allow jump over opponent', () => {
      // Setup: red at (5,1), black at (4,0), empty at (3,1)
      game.board[5][1] = 1;
      game.board[4][0] = 2;
      game.board[3][1] = 0;
      
      expect(game.isValidMove(5, 1, 3, 1)).toBe(false); // Not diagonal
      
      // Setup diagonal jump
      game.board[5][1] = 1;
      game.board[4][2] = 2;
      game.board[3][3] = 0;
      expect(game.isValidMove(5, 1, 3, 3)).toBe(true);
    });
  });

  describe('Move Execution', () => {
    it('should move piece correctly', () => {
      game.board[5][0] = 1;
      game.makeMove(5, 0, 4, 1);
      expect(game.board[5][0]).toBe(0);
      expect(game.board[4][1]).toBe(1);
    });

    it('should capture piece on jump', () => {
      game.board[5][1] = 1;
      game.board[4][2] = 2;
      game.board[3][3] = 0;
      
      game.makeMove(5, 1, 3, 3);
      expect(game.board[4][2]).toBe(0); // Captured
      expect(game.board[3][3]).toBe(1); // Moved
    });

    it('should promote to king on opposite end', () => {
      // Move red piece to top row
      game.board[1][1] = 1; // Valid dark square
      game.currentPlayer = 1;
      game.makeMove(1, 1, 0, 0);
      expect(game.board[0][0]).toBe(3); // Red king
    });

    it('should switch player after move', () => {
      game.board[5][0] = 1;
      const initialPlayer = game.currentPlayer;
      game.makeMove(5, 0, 4, 1);
      expect(game.currentPlayer).not.toBe(initialPlayer);
    });
  });

  describe('Win Detection', () => {
    it('should detect red win', () => {
      // Remove all black pieces
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (game.board[row][col] === 2 || game.board[row][col] === 4) {
            game.board[row][col] = 0;
          }
        }
      }
      expect(game.checkWinner()).toBe(1);
    });

    it('should detect black win', () => {
      // Remove all red pieces
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (game.board[row][col] === 1 || game.board[row][col] === 3) {
            game.board[row][col] = 0;
          }
        }
      }
      expect(game.checkWinner()).toBe(2);
    });

    it('should return 0 when game continues', () => {
      expect(game.checkWinner()).toBe(0);
    });
  });
});

