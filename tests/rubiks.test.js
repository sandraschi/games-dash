import { describe, it, expect, beforeEach } from 'vitest';

// Rubik's Cube state management (simplified for testing)
class RubiksCube {
  constructor(size = 3) {
    this.size = size;
    this.moveHistory = [];
    this.moveCount = 0;
  }

  recordMove(move) {
    this.moveHistory.push(move);
    this.moveCount++;
  }

  reverseMove(move) {
    if (move.endsWith("'")) {
      return move.slice(0, -1); // Remove prime
    } else {
      return move + "'"; // Add prime
    }
  }

  getReversedMoves() {
    return [...this.moveHistory].reverse().map(m => this.reverseMove(m));
  }

  scramble(moves = 20) {
    const faces = ['U', 'D', 'F', 'B', 'R', 'L'];
    this.moveHistory = [];
    
    for (let i = 0; i < moves; i++) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      const prime = Math.random() < 0.5;
      const move = face + (prime ? "'" : '');
      this.recordMove(move);
    }
    
    return this.moveHistory.length;
  }
}

describe('Rubik\'s Cube Logic', () => {
  let cube;

  beforeEach(() => {
    cube = new RubiksCube(3);
  });

  describe('Move Recording', () => {
    it('should record moves', () => {
      cube.recordMove('U');
      cube.recordMove('R');
      expect(cube.moveHistory).toEqual(['U', 'R']);
      expect(cube.moveCount).toBe(2);
    });

    it('should record prime moves', () => {
      cube.recordMove("U'");
      cube.recordMove("R'");
      expect(cube.moveHistory).toEqual(["U'", "R'"]);
    });
  });

  describe('Move Reversal', () => {
    it('should reverse normal move', () => {
      expect(cube.reverseMove('U')).toBe("U'");
      expect(cube.reverseMove('R')).toBe("R'");
    });

    it('should reverse prime move', () => {
      expect(cube.reverseMove("U'")).toBe('U');
      expect(cube.reverseMove("R'")).toBe('R');
    });

    it('should reverse sequence correctly', () => {
      cube.recordMove('U');
      cube.recordMove('R');
      cube.recordMove("F'");
      
      const reversed = cube.getReversedMoves();
      expect(reversed).toEqual(['F', "R'", "U'"]);
    });
  });

  describe('Scrambling', () => {
    it('should generate scramble moves', () => {
      const count = cube.scramble(20);
      expect(count).toBe(20);
      expect(cube.moveHistory.length).toBe(20);
    });

    it('should use valid face notation', () => {
      cube.scramble(50);
      const validFaces = ['U', 'D', 'F', 'B', 'R', 'L'];
      
      cube.moveHistory.forEach(move => {
        const face = move.replace("'", '');
        expect(validFaces).toContain(face);
      });
    });
  });

  describe('Cube Sizes', () => {
    it('should support 2x2 cube', () => {
      const cube2x2 = new RubiksCube(2);
      expect(cube2x2.size).toBe(2);
    });

    it('should support 4x4 cube', () => {
      const cube4x4 = new RubiksCube(4);
      expect(cube4x4.size).toBe(4);
    });

    it('should support 5x5 cube', () => {
      const cube5x5 = new RubiksCube(5);
      expect(cube5x5.size).toBe(5);
    });
  });
});

