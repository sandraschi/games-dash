import { describe, it, expect, beforeEach } from 'vitest';

// Tic-Tac-Toe game logic
class TicTacToe {
  constructor() {
    this.board = Array(3).fill(null).map(() => Array(3).fill(0));
    this.currentPlayer = 1; // 1 = X, 2 = O
    this.winner = null;
  }

  makeMove(row, col) {
    if (this.board[row][col] !== 0 || this.winner) return false;
    
    this.board[row][col] = this.currentPlayer;
    
    if (this.checkWin(row, col)) {
      this.winner = this.currentPlayer;
      return { win: true, winner: this.currentPlayer };
    }
    
    if (this.isBoardFull()) {
      this.winner = 'draw';
      return { win: true, winner: 'draw' };
    }
    
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    return { win: false };
  }

  checkWin(row, col) {
    const player = this.board[row][col];
    
    // Check row
    if (this.board[row].every(cell => cell === player)) return true;
    
    // Check column
    if (this.board.every(r => r[col] === player)) return true;
    
    // Check diagonal
    if (row === col && this.board.every((r, i) => r[i] === player)) return true;
    
    // Check anti-diagonal
    if (row + col === 2 && this.board.every((r, i) => r[2 - i] === player)) return true;
    
    return false;
  }

  isBoardFull() {
    return this.board.every(row => row.every(cell => cell !== 0));
  }
}

describe('Tic-Tac-Toe Game Logic', () => {
  let game;

  beforeEach(() => {
    game = new TicTacToe();
  });

  describe('Move Validation', () => {
    it('should allow valid move', () => {
      const result = game.makeMove(0, 0);
      expect(result.win).toBe(false);
      expect(game.board[0][0]).toBe(1);
    });

    it('should reject move on occupied cell', () => {
      game.makeMove(0, 0);
      const result = game.makeMove(0, 0);
      expect(result).toBe(false);
    });

    it('should reject move after game ends', () => {
      // Create a win
      game.makeMove(0, 0); // X
      game.makeMove(1, 0); // O
      game.makeMove(0, 1); // X
      game.makeMove(1, 1); // O
      game.makeMove(0, 2); // X wins
      
      const result = game.makeMove(2, 0);
      expect(result).toBe(false);
    });
  });

  describe('Win Detection', () => {
    it('should detect horizontal win', () => {
      game.makeMove(0, 0); // X
      game.makeMove(1, 0); // O
      game.makeMove(0, 1); // X
      game.makeMove(1, 1); // O
      const result = game.makeMove(0, 2); // X wins
      
      expect(result.win).toBe(true);
      expect(result.winner).toBe(1);
    });

    it('should detect vertical win', () => {
      game.makeMove(0, 0); // X
      game.makeMove(0, 1); // O
      game.makeMove(1, 0); // X
      game.makeMove(1, 1); // O
      const result = game.makeMove(2, 0); // X wins
      
      expect(result.win).toBe(true);
      expect(result.winner).toBe(1);
    });

    it('should detect diagonal win', () => {
      game.makeMove(0, 0); // X
      game.makeMove(0, 1); // O
      game.makeMove(1, 1); // X
      game.makeMove(0, 2); // O
      const result = game.makeMove(2, 2); // X wins
      
      expect(result.win).toBe(true);
      expect(result.winner).toBe(1);
    });

    it('should detect draw', () => {
      // Create a draw scenario
      game.makeMove(0, 0); // X
      game.makeMove(0, 1); // O
      game.makeMove(0, 2); // X
      game.makeMove(1, 0); // O
      game.makeMove(1, 2); // X
      game.makeMove(1, 1); // O
      game.makeMove(2, 0); // X
      game.makeMove(2, 2); // O
      const result = game.makeMove(2, 1); // X - draw
      
      expect(result.win).toBe(true);
      expect(result.winner).toBe('draw');
    });
  });

  describe('Player Switching', () => {
    it('should start with player 1 (X)', () => {
      expect(game.currentPlayer).toBe(1);
    });

    it('should switch players after each move', () => {
      game.makeMove(0, 0);
      expect(game.currentPlayer).toBe(2);
      game.makeMove(0, 1);
      expect(game.currentPlayer).toBe(1);
    });
  });
});

