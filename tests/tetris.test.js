import { describe, it, expect, beforeEach } from 'vitest';

// Tetris game logic
class Tetris {
  constructor(rows = 20, cols = 10) {
    this.rows = rows;
    this.cols = cols;
    this.board = Array(rows).fill(null).map(() => Array(cols).fill(0));
    this.score = 0;
    this.linesCleared = 0;
    this.level = 1;
  }

  placePiece(piece, row, col) {
    // Place piece on board (1 = filled, 0 = empty)
    for (let pr = 0; pr < piece.length; pr++) {
      for (let pc = 0; pc < piece[pr].length; pc++) {
        if (piece[pr][pc] === 1) {
          const boardRow = row + pr;
          const boardCol = col + pc;
          if (boardRow >= 0 && boardRow < this.rows && 
              boardCol >= 0 && boardCol < this.cols) {
            this.board[boardRow][boardCol] = 1;
          }
        }
      }
    }
  }

  checkLines() {
    let linesToClear = [];
    
    for (let row = 0; row < this.rows; row++) {
      if (this.board[row].every(cell => cell === 1)) {
        linesToClear.push(row);
      }
    }
    
    return linesToClear;
  }

  clearLines(linesToClear) {
    linesToClear.sort((a, b) => b - a); // Sort descending
    
    for (const row of linesToClear) {
      this.board.splice(row, 1);
      this.board.unshift(Array(this.cols).fill(0));
    }
    
    this.linesCleared += linesToClear.length;
    this.updateScore(linesToClear.length);
    this.updateLevel();
  }

  updateScore(linesCleared) {
    const points = [0, 100, 300, 500, 800]; // Single, double, triple, tetris
    this.score += points[linesCleared] * this.level;
  }

  updateLevel() {
    this.level = Math.floor(this.linesCleared / 10) + 1;
  }

  checkCollision(piece, row, col) {
    for (let pr = 0; pr < piece.length; pr++) {
      for (let pc = 0; pc < piece[pr].length; pc++) {
        if (piece[pr][pc] === 1) {
          const boardRow = row + pr;
          const boardCol = col + pc;
          
          // Check bounds
          if (boardRow < 0 || boardRow >= this.rows || 
              boardCol < 0 || boardCol >= this.cols) {
            return true;
          }
          
          // Check collision with existing blocks
          if (this.board[boardRow][boardCol] === 1) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isGameOver() {
    // Game over if top row has blocks
    return this.board[0].some(cell => cell === 1);
  }
}

describe('Tetris Game Logic', () => {
  let game;

  beforeEach(() => {
    game = new Tetris(20, 10);
  });

  describe('Piece Placement', () => {
    it('should place piece on board', () => {
      const piece = [[1, 1], [1, 1]]; // 2x2 square
      game.placePiece(piece, 18, 4);
      expect(game.board[18][4]).toBe(1);
      expect(game.board[18][5]).toBe(1);
      expect(game.board[19][4]).toBe(1);
      expect(game.board[19][5]).toBe(1);
    });

    it('should not place piece outside bounds', () => {
      const piece = [[1, 1]];
      game.placePiece(piece, 0, 9);
      // Should only place what fits
      expect(game.board[0][9]).toBe(1);
    });
  });

  describe('Line Clearing', () => {
    it('should detect full line', () => {
      // Fill a line
      for (let col = 0; col < 10; col++) {
        game.board[19][col] = 1;
      }
      
      const lines = game.checkLines();
      expect(lines).toEqual([19]);
    });

    it('should detect multiple full lines', () => {
      // Fill two lines
      for (let row = 18; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          game.board[row][col] = 1;
        }
      }
      
      const lines = game.checkLines();
      expect(lines).toEqual([18, 19]);
    });

    it('should not detect incomplete line', () => {
      game.board[19][0] = 1;
      game.board[19][1] = 1;
      const lines = game.checkLines();
      expect(lines).toEqual([]);
    });

    it('should clear lines and shift down', () => {
      // Fill bottom line
      for (let col = 0; col < 10; col++) {
        game.board[19][col] = 1;
      }
      // Add a block above
      game.board[17][5] = 1;
      
      game.clearLines([19]);
      
      // Bottom line should be empty
      expect(game.board[19].every(cell => cell === 0)).toBe(true);
      // Block should have shifted down
      expect(game.board[18][5]).toBe(1);
    });
  });

  describe('Scoring', () => {
    it('should score single line', () => {
      game.clearLines([19]);
      expect(game.score).toBe(100);
    });

    it('should score double line', () => {
      game.clearLines([18, 19]);
      expect(game.score).toBe(300);
    });

    it('should score tetris (4 lines)', () => {
      game.clearLines([16, 17, 18, 19]);
      expect(game.score).toBe(800);
    });

    it('should increase score with level', () => {
      game.level = 2;
      game.clearLines([19]);
      expect(game.score).toBe(200); // 100 * 2
    });
  });

  describe('Level Progression', () => {
    it('should start at level 1', () => {
      expect(game.level).toBe(1);
    });

    it('should increase level every 10 lines', () => {
      game.linesCleared = 9;
      game.updateLevel();
      expect(game.level).toBe(1);
      
      game.linesCleared = 10;
      game.updateLevel();
      expect(game.level).toBe(2);
      
      game.linesCleared = 20;
      game.updateLevel();
      expect(game.level).toBe(3);
    });
  });

  describe('Collision Detection', () => {
    it('should detect collision with board edge', () => {
      const piece = [[1, 1]];
      expect(game.checkCollision(piece, 0, -1)).toBe(true); // Left edge
      expect(game.checkCollision(piece, 0, 10)).toBe(true); // Right edge
      expect(game.checkCollision(piece, -1, 0)).toBe(true); // Top edge
    });

    it('should detect collision with existing blocks', () => {
      game.board[18][5] = 1;
      const piece = [[1, 1]];
      expect(game.checkCollision(piece, 18, 4)).toBe(true);
    });

    it('should not detect collision for valid placement', () => {
      const piece = [[1, 1]];
      expect(game.checkCollision(piece, 18, 4)).toBe(false);
    });
  });

  describe('Game Over', () => {
    it('should detect game over when top row filled', () => {
      game.board[0][5] = 1;
      expect(game.isGameOver()).toBe(true);
    });

    it('should not detect game over when top row empty', () => {
      game.board[19][5] = 1;
      expect(game.isGameOver()).toBe(false);
    });
  });
});









