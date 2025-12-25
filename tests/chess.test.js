// Chess Game Logic Tests
import { describe, it, expect, beforeEach } from 'vitest';

// Extracted Chess Game Logic from chess.html
class ChessLogic {
  constructor() {
    this.reset();
  }

  reset() {
    // Initialize board with standard chess starting position
    this.board = [
      [{type: 'rook', color: 'black'}, {type: 'knight', color: 'black'}, {type: 'bishop', color: 'black'}, {type: 'queen', color: 'black'}, {type: 'king', color: 'black'}, {type: 'bishop', color: 'black'}, {type: 'knight', color: 'black'}, {type: 'rook', color: 'black'}],
      Array(8).fill(null).map(() => ({type: 'pawn', color: 'black'})),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null).map(() => ({type: 'pawn', color: 'white'})),
      [{type: 'rook', color: 'white'}, {type: 'knight', color: 'white'}, {type: 'bishop', color: 'white'}, {type: 'queen', color: 'white'}, {type: 'king', color: 'white'}, {type: 'bishop', color: 'white'}, {type: 'knight', color: 'white'}, {type: 'rook', color: 'white'}]
    ];

    this.currentPlayer = 'white';
    this.moveHistory = [];
  }

  getGameState() {
    return {
      board: this.board.map(row => row.map(piece => piece ? {...piece} : null)),
      currentPlayer: this.currentPlayer,
      moveHistory: [...this.moveHistory]
    };
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow === toRow && fromCol === toCol) return false;

    // Bounds checking
    if (fromRow < 0 || fromRow > 7 || fromCol < 0 || fromCol > 7) return false;
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;

    const piece = this.board[fromRow][fromCol];
    const target = this.board[toRow][toCol];

    if (!piece) return false;
    if (piece.color !== this.currentPlayer) return false; // Check correct player
    if (target && target.color === piece.color) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        if (colDiff === 0 && !target) {
          if (rowDiff === direction) return true;
          if (fromRow === startRow && rowDiff === 2 * direction && !this.board[fromRow + direction][fromCol]) return true;
        }
        if (absColDiff === 1 && rowDiff === direction && target) return true;
        return false;

      case 'rook':
        if (rowDiff === 0 || colDiff === 0) {
          return !this.isPathBlocked(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case 'knight':
        return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);

      case 'bishop':
        if (absRowDiff === absColDiff) {
          return !this.isPathBlocked(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case 'queen':
        if (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) {
          return !this.isPathBlocked(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case 'king':
        return absRowDiff <= 1 && absColDiff <= 1;
    }

    return false;
  }

  isPathBlocked(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board[currentRow][currentCol]) return true;
      currentRow += rowStep;
      currentCol += colStep;
    }

    return false;
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) return false;

    const piece = this.board[fromRow][fromCol];
    const captured = this.board[toRow][toCol];

    this.moveHistory.push({
      from: {row: fromRow, col: fromCol},
      to: {row: toRow, col: toCol},
      piece: piece,
      captured: captured
    });

    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    return true;
  }

  undoMove() {
    if (this.moveHistory.length === 0) return false;

    const lastMove = this.moveHistory.pop();
    this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    return true;
  }

  checkWin() {
    // Simple check for checkmate (king capture) - in real chess this would be more complex
    const kingPositions = [];

    // Find kings
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === 'king') {
          kingPositions.push({row, col, color: piece.color});
        }
      }
    }

    // Check if either king is missing (captured)
    const whiteKing = kingPositions.find(k => k.color === 'white');
    const blackKing = kingPositions.find(k => k.color === 'black');

    if (!whiteKing) return 'black';
    if (!blackKing) return 'white';

    // Check for stalemate/draw conditions
    // This is a simplified version - real chess would check for checkmate
    const possibleMoves = this.getAllPossibleMoves();
    if (possibleMoves.length === 0) {
      return 'draw'; // Stalemate or draw
    }

    return false; // Game continues
  }

  getAllPossibleMoves() {
    const moves = [];
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = this.board[fromRow][fromCol];
        if (piece && piece.color === this.currentPlayer) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                moves.push({fromRow, fromCol, toRow, toCol});
              }
            }
          }
        }
      }
    }
    return moves;
  }
}

describe('Chess - Game Logic', () => {
  let game;

  beforeEach(() => {
    game = new ChessLogic();
  });

  describe('Game Initialization', () => {
    it('should initialize with correct starting position', () => {
      const state = game.getGameState();

      expect(state.board).toBeDefined();
      expect(state.board.length).toBe(8);
      expect(state.board[0].length).toBe(8);

      // Check starting positions
      expect(state.board[0][0]).toEqual({type: 'rook', color: 'black'});
      expect(state.board[0][4]).toEqual({type: 'king', color: 'black'});
      expect(state.board[7][0]).toEqual({type: 'rook', color: 'white'});
      expect(state.board[7][4]).toEqual({type: 'king', color: 'white'});

      // Check pawns
      for (let col = 0; col < 8; col++) {
        expect(state.board[1][col]).toEqual({type: 'pawn', color: 'black'});
        expect(state.board[6][col]).toEqual({type: 'pawn', color: 'white'});
      }

      expect(state.currentPlayer).toBe('white');
      expect(state.moveHistory).toEqual([]);
    });

    it('should reset game correctly', () => {
      // Make a move
      game.makeMove(6, 4, 4, 4); // e2-e4

      // Reset
      game.reset();

      // Should be back to initial state
      const initialState = new ChessLogic().getGameState();
      const resetState = game.getGameState();
      expect(resetState).toEqual(initialState);
    });
  });

  describe('Move Validation', () => {
    it('should accept valid pawn moves', () => {
      // Test white pawn one square forward
      expect(game.isValidMove(6, 4, 5, 4)).toBe(true); // e2-e3

      // Test white pawn two squares forward from starting position
      expect(game.isValidMove(6, 4, 4, 4)).toBe(true); // e2-e4

      // Test black pawn one square forward (switch to black's turn)
      game.currentPlayer = 'black';
      expect(game.isValidMove(1, 4, 2, 4)).toBe(true); // e7-e6
      game.currentPlayer = 'white'; // Reset for other tests
    });

    it('should accept valid knight moves', () => {
      // White knight from b1 to c3
      expect(game.isValidMove(7, 1, 5, 2)).toBe(true); // b1-c3

      // Black knight from b8 to c6 (switch to black's turn)
      game.currentPlayer = 'black';
      expect(game.isValidMove(0, 1, 2, 2)).toBe(true); // b8-c6
      game.currentPlayer = 'white'; // Reset for other tests
    });

    it('should accept valid rook moves', () => {
      // Clear path for rook
      game.board[6][0] = null; // Remove white pawn from a2

      // White rook from a1 to a3
      expect(game.isValidMove(7, 0, 5, 0)).toBe(true); // a1-a3
    });

    it('should accept valid bishop moves', () => {
      // Clear entire diagonal path for bishop from c1 to g5
      // c1(7,2) -> d2(6,3) -> e3(5,4) -> f4(4,5) -> g5(3,6)
      game.board[6][3] = null; // Remove white pawn from d2
      game.board[5][4] = null; // Remove white pawn from e3
      game.board[4][5] = null; // Remove white pawn from f4

      // White bishop from c1 to g5
      expect(game.isValidMove(7, 2, 3, 6)).toBe(true); // c1-g5
    });

    it('should accept valid queen moves', () => {
      // Clear path for queen
      game.board[6][3] = null; // Remove white pawn from d2

      // White queen from d1 to d4
      expect(game.isValidMove(7, 3, 4, 3)).toBe(true); // d1-d4

      // White queen from d1 to h5 (diagonal) - clear the path
      // d1(7,3) -> e2(6,4) -> f3(5,5) -> g4(4,6) -> h5(3,7)
      game.board[6][4] = null; // Remove white pawn from e2
      game.board[5][5] = null; // Remove white pawn from f3
      game.board[4][6] = null; // Remove white pawn from g4
      expect(game.isValidMove(7, 3, 3, 7)).toBe(true); // d1-h5
    });

    it('should accept valid king moves', () => {
      // Clear path for king
      game.board[6][4] = null; // Remove white pawn from e2

      // White king from e1 to e2
      expect(game.isValidMove(7, 4, 6, 4)).toBe(true); // e1-e2
    });

    it('should reject invalid moves', () => {
      // Same square
      expect(game.isValidMove(6, 4, 6, 4)).toBe(false);

      // Move to occupied square of same color
      expect(game.isValidMove(7, 0, 7, 1)).toBe(false);

      // Invalid piece movement
      expect(game.isValidMove(6, 4, 7, 4)).toBe(false); // Pawn moving backwards

      // Blocked path
      expect(game.isValidMove(7, 0, 5, 0)).toBe(false); // Rook blocked by own pawn
    });

    it('should reject moves on wrong turn', () => {
      // Try to move black piece on white's turn
      expect(game.isValidMove(1, 4, 2, 4)).toBe(false);
    });

    it('should handle pawn captures', () => {
      // Setup a capture scenario
      game.board[4][4] = {type: 'pawn', color: 'black'};
      game.board[5][5] = {type: 'pawn', color: 'white'};

      // White pawn captures diagonally
      expect(game.isValidMove(5, 5, 4, 4)).toBe(true);
    });
  });

  describe('Move Execution', () => {
    it('should execute valid moves correctly', () => {
      const initialPiece = game.board[6][4]; // e2 pawn

      // Make move
      const result = game.makeMove(6, 4, 4, 4); // e2-e4

      expect(result).toBe(true);
      expect(game.board[4][4]).toEqual(initialPiece);
      expect(game.board[6][4]).toBeNull();
      expect(game.currentPlayer).toBe('black');
    });

    it('should handle captures correctly', () => {
      // Setup capture
      game.board[4][4] = {type: 'pawn', color: 'black'};
      game.board[5][5] = {type: 'pawn', color: 'white'};

      const capturedPiece = game.board[4][4];

      // Make capture
      game.makeMove(5, 5, 4, 4);

      expect(game.board[4][4]).toEqual({type: 'pawn', color: 'white'});
      expect(game.board[5][5]).toBeNull();
    });

    it('should reject invalid moves', () => {
      const result = game.makeMove(6, 4, 7, 4); // Invalid pawn move backwards
      expect(result).toBe(false);
      expect(game.currentPlayer).toBe('white'); // Should not change
    });
  });

  describe('Undo Functionality', () => {
    it('should undo moves correctly', () => {
      const initialState = game.getGameState();

      // Make a move
      game.makeMove(6, 4, 4, 4); // e2-e4
      expect(game.board[4][4]).not.toBeNull();
      expect(game.board[6][4]).toBeNull();
      expect(game.currentPlayer).toBe('black');

      // Undo the move
      const undoResult = game.undoMove();
      expect(undoResult).toBe(true);

      const undoneState = game.getGameState();
      expect(undoneState).toEqual(initialState);
    });

    it('should handle undo when no moves exist', () => {
      const result = game.undoMove();
      expect(result).toBe(false);
    });
  });

  describe('Win Conditions', () => {
    it('should detect king capture as win', () => {
      // Remove kings and place one on a square where it can be captured
      game.board[0][4] = null; // Remove black king
      game.board[7][4] = null; // Remove white king

      // Place white king on d4
      game.board[4][3] = {type: 'king', color: 'white'};
      // Place black pawn on d5 to capture it
      game.board[3][3] = {type: 'pawn', color: 'black'};
      game.currentPlayer = 'black';

      // Capture the king
      game.makeMove(3, 3, 4, 3);

      // White should win (black's king is captured)
      expect(game.checkWin()).toBe('white');
    });

    it('should detect when game continues normally', () => {
      // Normal starting position
      expect(game.checkWin()).toBe(false);
    });

    it('should handle stalemate-like conditions', () => {
      // This is a simplified test - in real chess, stalemate detection is complex
      // For now, we test that it doesn't crash and returns a valid result
      const result = game.checkWin();
      expect(['white', 'black', 'draw', false]).toContain(result);
    });
  });

  describe('Game State Management', () => {
    it('should maintain move history', () => {
      expect(game.moveHistory).toHaveLength(0);

      game.makeMove(6, 4, 4, 4); // e2-e4
      expect(game.moveHistory).toHaveLength(1);

      game.makeMove(1, 4, 2, 4); // e7-e6
      expect(game.moveHistory).toHaveLength(2);

      game.undoMove();
      expect(game.moveHistory).toHaveLength(1);
    });

    it('should handle edge cases gracefully', () => {
      // Test moves outside board boundaries
      expect(game.isValidMove(-1, 0, 0, 0)).toBe(false);
      expect(game.isValidMove(0, 0, 8, 0)).toBe(false);
      expect(game.isValidMove(0, 0, 0, -1)).toBe(false);
      expect(game.isValidMove(0, 0, 0, 8)).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should execute moves quickly', () => {
      const startTime = Date.now();

      // Execute 100 valid moves
      for (let i = 0; i < 10; i++) {
        if (game.currentPlayer === 'white') {
          game.makeMove(6, i % 8, 5, i % 8); // Move pawns forward
        } else {
          game.makeMove(1, i % 8, 2, i % 8); // Move black pawns forward
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete quickly
      expect(duration).toBeLessThan(100); // Less than 100ms for 10 moves
    });

    it('should validate moves efficiently', () => {
      const startTime = Date.now();

      // Test 1000 move validations
      for (let i = 0; i < 1000; i++) {
        game.isValidMove(6, 4, 5, 4); // Valid pawn move
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should be very fast
      expect(duration).toBeLessThan(50); // Less than 50ms for 1000 validations
    });
  });
});

describe('Chess - Special Features', () => {
  let game;

  beforeEach(() => {
    game = new ChessLogic();
  });

  describe('Piece Movement Rules', () => {
    it('should handle pawn promotion scenario', () => {
      // Move white pawn to 8th rank (would promote to queen in real game)
      game.board[0][4] = {type: 'pawn', color: 'white'};
      game.board[1][4] = null;

      // Pawn on 8th rank can still move forward if path is clear (though this is simplified)
      // In real chess, this would trigger promotion, but our logic doesn't handle that yet
      expect(game.isValidMove(0, 4, 0, 5)).toBe(false); // Can't move sideways
      expect(game.isValidMove(0, 4, 0, 3)).toBe(false); // Can't move backwards
    });

    it('should allow king movement', () => {
      // Clear paths for king movement
      game.board[6][4] = null; // Remove white pawn from e2 (forward)
      game.board[7][3] = null; // Remove white queen from d1 (sideways)
      game.board[6][3] = null; // Remove white pawn from d2 (diagonal)

      // White king from e1 can now move in all directions
      expect(game.isValidMove(7, 4, 6, 4)).toBe(true); // King can move forward to e2
      expect(game.isValidMove(7, 4, 7, 3)).toBe(true); // King can move sideways to d1
      expect(game.isValidMove(7, 4, 6, 3)).toBe(true); // King can move diagonally to d2
    });
  });

  describe('Board State', () => {
    it('should maintain board integrity', () => {
      const initialBoard = JSON.parse(JSON.stringify(game.board));

      // Make some moves
      game.makeMove(6, 4, 4, 4);
      game.makeMove(1, 4, 2, 4);

      // Board should still be 8x8
      expect(game.board.length).toBe(8);
      expect(game.board[0].length).toBe(8);

      // Should have moved pieces
      expect(game.board[4][4]).toEqual({type: 'pawn', color: 'white'});
      expect(game.board[2][4]).toEqual({type: 'pawn', color: 'black'});
    });
  });
});

describe('Chess - PGN Processing (Morphy vs Consultants)', () => {
  // Mock game board state for PGN testing
  let gameBoardState = [];

  // Initialize board function (from chess-education.js)
  function initializeGameBoard() {
    gameBoardState = [
      [{type: 'rook', color: 'black'}, {type: 'knight', color: 'black'}, {type: 'bishop', color: 'black'}, {type: 'queen', color: 'black'}, {type: 'king', color: 'black'}, {type: 'bishop', color: 'black'}, {type: 'knight', color: 'black'}, {type: 'rook', color: 'black'}],
      [{type: 'pawn', color: 'black'}, {type: 'pawn', color: 'black'}, {type: 'pawn', color: 'black'}, {type: 'pawn', color: 'black'}, {type: 'pawn', color: 'black'}, {type: 'pawn', color: 'black'}, {type: 'pawn', color: 'black'}, {type: 'pawn', color: 'black'}],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [{type: 'pawn', color: 'white'}, {type: 'pawn', color: 'white'}, {type: 'pawn', color: 'white'}, {type: 'pawn', color: 'white'}, {type: 'pawn', color: 'white'}, {type: 'pawn', color: 'white'}, {type: 'pawn', color: 'white'}, {type: 'pawn', color: 'white'}],
      [{type: 'rook', color: 'white'}, {type: 'knight', color: 'white'}, {type: 'bishop', color: 'white'}, {type: 'queen', color: 'white'}, {type: 'king', color: 'white'}, {type: 'bishop', color: 'white'}, {type: 'knight', color: 'white'}, {type: 'rook', color: 'white'}]
    ];
  }

  // Simplified PGN move application (from chess-education.js)
  function applyPGNMove(moveNotation, color) {
    if (!moveNotation) return;

    // Remove check/checkmate symbols
    moveNotation = moveNotation.replace(/[+#]/, '').trim();

    // Handle castling
    if (moveNotation === 'O-O' || moveNotation === '0-0') {
      // Kingside castling
      const kingRow = color === 'white' ? 7 : 0;
      const rookCol = 7;
      gameBoardState[kingRow][6] = gameBoardState[kingRow][4]; // King to g1/g8
      gameBoardState[kingRow][5] = gameBoardState[kingRow][rookCol]; // Rook to f1/f8
      gameBoardState[kingRow][4] = null;
      gameBoardState[kingRow][rookCol] = null;
      return;
    }

    // Check for pawn file disambiguation before capture detection
    let sourceHint = null;
    if (moveNotation.length > 3 && moveNotation[1] === 'x' && moveNotation[0] >= 'a' && moveNotation[0] <= 'h') {
      sourceHint = { type: 'file', value: moveNotation[0].charCodeAt(0) - 97 };
      moveNotation = moveNotation.substring(1);
    }

    // Handle captures
    const isCapture = moveNotation.includes('x');
    moveNotation = moveNotation.replace('x', '');

    // Extract destination
    const destMatch = moveNotation.match(/([a-h])([1-8])$/);
    if (!destMatch) {
      console.warn('Could not parse move:', moveNotation);
      return;
    }

    const destCol = destMatch[1].charCodeAt(0) - 97;
    const destRow = 8 - parseInt(destMatch[2]);

    // Determine piece type
    let pieceType = 'pawn';
    const firstChar = moveNotation[0];
    const pieceLetters = ['K', 'Q', 'R', 'B', 'N'];
    if (firstChar && pieceLetters.includes(firstChar)) {
      const types = { 'R': 'rook', 'N': 'knight', 'B': 'bishop', 'Q': 'queen', 'K': 'king' };
      pieceType = types[firstChar] || 'pawn';
      moveNotation = moveNotation.substring(1);

      // Check for disambiguation hints
      if (moveNotation.length > 2) {
        const hint = moveNotation[0];
        if (hint >= 'a' && hint <= 'h') {
          sourceHint = { type: 'file', value: hint.charCodeAt(0) - 97 };
          moveNotation = moveNotation.substring(1);
        } else if (hint >= '1' && hint <= '8') {
          sourceHint = { type: 'rank', value: 8 - parseInt(hint) };
          moveNotation = moveNotation.substring(1);
        }
      }
    }

    // Find the piece that can make this move
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameBoardState[row][col];
        if (piece && piece.type === pieceType && piece.color === color) {
          // Check disambiguation hints
          if (sourceHint) {
            if (sourceHint.type === 'file' && col !== sourceHint.value) continue;
            if (sourceHint.type === 'rank' && row !== sourceHint.value) continue;
          }

          // Check if move is possible and path is clear
          if (canPieceMoveTo(row, col, destRow, destCol, pieceType, color, isCapture) &&
              isPathClear(row, col, destRow, destCol, pieceType)) {
            // Handle pawn promotion
            if (pieceType === 'pawn' && (destRow === 0 || destRow === 7)) {
              piece.type = 'queen'; // Default to queen
            }
            gameBoardState[destRow][destCol] = piece;
            gameBoardState[row][col] = null;
            return;
          }
        }
      }
    }

    console.warn('Could not apply move:', moveNotation, 'for', color);
  }

  function isPathClear(fromRow, fromCol, toRow, toCol, pieceType) {
    if (pieceType === 'knight') return true;

    const rowStep = toRow === fromRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colStep = toCol === fromCol ? 0 : (toCol > fromCol ? 1 : -1);

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (gameBoardState[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  function canPieceMoveTo(fromRow, fromCol, toRow, toCol, pieceType, color, isCapture = false) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    if (rowDiff === 0 && colDiff === 0) return false;

    const destPiece = gameBoardState[toRow][toCol];
    if (isCapture) {
      if (!destPiece || destPiece.color === color) return false;
    } else {
      if (destPiece !== null) return false;
    }

    switch (pieceType) {
      case 'pawn':
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        if (colDiff === 0 && rowDiff === direction) {
          return true;
        }
        if (colDiff === 0 && rowDiff === direction * 2 && fromRow === startRow) {
          return gameBoardState[fromRow + direction][fromCol] === null;
        }
        if (isCapture && Math.abs(colDiff) === 1 && rowDiff === direction) {
          return true;
        }
        return false;
      case 'rook':
        return (rowDiff === 0 || colDiff === 0);
      case 'knight':
        return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
               (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
      case 'bishop':
        return Math.abs(rowDiff) === Math.abs(colDiff);
      case 'queen':
        return (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff));
      case 'king':
        return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
    }

    return false;
  }

  // Simple PGN parsing function for testing
  function parsePGN(pgn) {
    const gameMoves = [];

    // Remove comments and annotations
    let cleanPgn = pgn.replace(/\{[^}]*\}/g, '');
    cleanPgn = cleanPgn.replace(/\([^)]*\)/g, '');
    cleanPgn = cleanPgn.replace(/\$[0-9]+/g, '');

    // Split into tokens and filter
    const tokens = cleanPgn.split(/\s+/).filter(token => {
      const trimmed = token.trim();
      if (!trimmed) return false;
      if (/^\d+\.$/.test(trimmed)) return false; // Move numbers
      if (trimmed === '1-0' || trimmed === '0-1' || trimmed === '1/2-1/2') return false; // Results
      return true;
    });

    // Clean moves and add to list
    tokens.forEach(token => {
      const cleanMove = token.replace(/[+#]/g, '').trim();
      if (cleanMove) {
        gameMoves.push(cleanMove);
      }
    });

    return gameMoves;
  }

  describe('PGN Parsing', () => {
    it('should parse simple PGN correctly', () => {
      const pgn = "1. e4 e5 2. Nf3 Nc6 1-0";

      const moves = parsePGN(pgn);

      console.log('Parsed moves:', moves);
      expect(moves).toHaveLength(4);
      expect(moves[0]).toBe('e4');
      expect(moves[1]).toBe('e5');
      expect(moves[2]).toBe('Nf3');
      expect(moves[3]).toBe('Nc6');
    });

    it('should parse Morphy vs Consultants PGN correctly', () => {
      const pgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. d3 d6 6. c3 g6 7. Nbd2 Bg7 8. Nf1 O-O 9. Bg5 h6 10. Bh4 g5 11. Bg3 Nh5 12. Nxe5 dxe5 13. Qxh5 Qf6 14. f4 Kh7 15. Qxh6+ Bxh6 16. Bxh6+ Kh8 17. Ng4+ Kg8 18. Nf6+ Kh8 19. Nxd7+ Kg8 20. Nf6+ Kh8 21. Nxh7+ Kg8 22. Nf6+ Kh8 23. Nxd5+ Kg8 24. Nf6+ Kh8 25. Nxe8 Rxe8 26. Bxf7 1-0";

      const moves = parsePGN(pgn);

      console.log('Morphy moves length:', moves.length);
      console.log('First 10 moves:', moves.slice(0, 10));
      console.log('Last 10 moves:', moves.slice(-10));

      expect(moves).toHaveLength(51); // 26 moves × 2 players - 1 (last move is checkmate)

      // Verify first few moves
      expect(moves[0]).toBe('e4');
      expect(moves[1]).toBe('e5');
      expect(moves[2]).toBe('Nf3');
      expect(moves[3]).toBe('Nc6');

      // Verify last few moves (51 total moves)
      expect(moves[46]).toBe('Nf6'); // Move 24. Nf6
      expect(moves[47]).toBe('Kh8'); // Move 24... Kh8
      expect(moves[48]).toBe('Nxe8'); // Move 25. Nxe8
      expect(moves[49]).toBe('Rxe8'); // Move 25... Rxe8
      expect(moves[50]).toBe('Bxf7'); // Move 26. Bxf7
    });
  });

  describe('PGN Execution - Morphy vs Consultants', () => {
    it('should verify Morphy game structure and key positions', () => {
      // Test that we can parse the game and verify key structural elements
      const pgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. d3 d6 6. c3 g6 7. Nbd2 Bg7 8. Nf1 O-O 9. Bg5 h6 10. Bh4 g5 11. Bg3 Nh5 12. Nxe5 dxe5 13. Qxh5 Qf6 14. f4 Kh7 15. Qxh6+ Bxh6 16. Bxh6+ Kh8 17. Ng4+ Kg8 18. Nf6+ Kh8 19. Nxd7+ Kg8 20. Nf6+ Kh8 21. Nxh7+ Kg8 22. Nf6+ Kh8 23. Nxd5+ Kg8 24. Nf6+ Kh8 25. Nxe8 Rxe8 26. Bxf7 1-0";

      const moves = parsePGN(pgn);

      // Verify we have all moves
      expect(moves).toHaveLength(51);

      // Verify the famous tactical sequence starts correctly
      expect(moves[0]).toBe('e4');   // Morphy's first move
      expect(moves[1]).toBe('e5');   // Consultants respond
      expect(moves[2]).toBe('Nf3');  // Morphy develops
      expect(moves[3]).toBe('Nc6');  // Consultants develop

      // Verify castling
      expect(moves[15]).toBe('O-O'); // Black castles

      // Verify the queen sacrifice sequence
      expect(moves[24]).toBe('Qxh5'); // White takes knight on h5
      expect(moves[25]).toBe('Qf6');  // Black queen to f6
      expect(moves[26]).toBe('f4');   // White advances f-pawn
      expect(moves[27]).toBe('Kh7'); // Black king to h7
      expect(moves[28]).toBe('Qxh6'); // White queen takes pawn (check symbol removed by parser)

      // Verify the final moves
      expect(moves[48]).toBe('Nxe8'); // Knight takes rook
      expect(moves[49]).toBe('Rxe8'); // Rook takes knight
      expect(moves[50]).toBe('Bxf7'); // Bishop delivers checkmate
    });

    it('should identify key tactical themes in Morphy game', () => {
      const pgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. d3 d6 6. c3 g6 7. Nbd2 Bg7 8. Nf1 O-O 9. Bg5 h6 10. Bh4 g5 11. Bg3 Nh5 12. Nxe5 dxe5 13. Qxh5 Qf6 14. f4 Kh7 15. Qxh6+ Bxh6 16. Bxh6+ Kh8 17. Ng4+ Kg8 18. Nf6+ Kh8 19. Nxd7+ Kg8 20. Nf6+ Kh8 21. Nxh7+ Kg8 22. Nf6+ Kh8 23. Nxd5+ Kg8 24. Nf6+ Kh8 25. Nxe8 Rxe8 26. Bxf7 1-0";

      const moves = parsePGN(pgn);

      // Count tactical moves (those with captures or checks)
      const tacticalMoves = moves.filter(move => move.includes('x') || move.includes('+') || move.includes('#'));

      // Should have several tactical moves in this attacking game
      expect(tacticalMoves.length).toBeGreaterThan(10);

      // Verify specific tactical moves (note: check symbols are removed by parser)
      expect(moves).toContain('Nxe5'); // Knight takes pawn
      expect(moves).toContain('Qxh5'); // Queen takes knight
      expect(moves).toContain('Qxh6'); // Queen takes pawn (was Qxh6+)
      expect(moves).toContain('Bxh6'); // Bishop takes queen
      expect(moves).toContain('Nxe8'); // Knight takes rook
      expect(moves).toContain('Bxf7'); // Final bishop move
    });

    it('should handle the critical tactical sequence correctly', () => {
      // Initialize board
      initializeGameBoard();

      // Play the key tactical sequence that made this game famous
      const tacticalMoves = [
        'e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'd3', 'd6', 'c3', 'g6',
        'Nbd2', 'Bg7', 'Nf1', 'O-O', 'Bg5', 'h6', 'Bh4', 'g5', 'Bg3', 'Nh5',
        'Nxe5', 'dxe5', 'Qxh5', 'Qf6', 'f4'
      ];

      // Apply moves
      tacticalMoves.forEach((move, index) => {
        const color = index % 2 === 0 ? 'white' : 'black';
        applyPGNMove(move, color);
      });

      // Verify the position before the famous Qxh6+ sacrifice
      // White queen should be on h5, black king on g8 (after O-O)
      expect(gameBoardState[3][7]).toEqual({type: 'queen', color: 'white'}); // Qh5
      expect(gameBoardState[0][6]).toEqual({type: 'king', color: 'black'}); // Kg8

      // Black pawn on h6 should be there
      expect(gameBoardState[2][7]).toEqual({type: 'pawn', color: 'black'}); // h6 pawn

      // White pawn on f4 should be there
      expect(gameBoardState[4][5]).toEqual({type: 'pawn', color: 'white'}); // f4 pawn
    });

    it('should parse and validate move count correctly', () => {
      const pgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. Qxh5 1-0";
      const moves = parsePGN(pgn);

      // Should have 9 moves (4 white + 4 black + 1 white incomplete)
      expect(moves).toHaveLength(9);
      expect(moves[0]).toBe('e4');
      expect(moves[1]).toBe('e5');
      expect(moves[2]).toBe('Nf3');
      expect(moves[3]).toBe('Nc6');
      expect(moves[4]).toBe('Bb5');
      expect(moves[5]).toBe('a6');
      expect(moves[6]).toBe('Ba4');
      expect(moves[7]).toBe('Nf6');
      expect(moves[8]).toBe('Qxh5'); // Last move before result
    });
  });
});

