/**
 * Tri-Dimensional Chess Logic Engine (Standard Rules)
 * Based on Andrew Bartmess / Charles Roth ruleset
 */

class TDChessLogic {
    constructor() {
        this.boardSize = 4; // Main boards are 4x4
        this.attackBoardSize = 2; // Attack boards are 2x2
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        this.gameOver = false;

        // Piece types and their basic 3D capabilities
        this.pieces = {
            king: { unicode: { white: '♔', black: '♚' }, value: 1000 },
            queen: { unicode: { white: '♕', black: '♛' }, value: 9 },
            rook: { unicode: { white: '♖', black: '♜' }, value: 5 },
            bishop: { unicode: { white: '♗', black: '♝' }, value: 3 },
            knight: { unicode: { white: '♘', black: '♞' }, value: 3 },
            pawn: { unicode: { white: '♙', black: '♟' }, value: 1 }
        };

        this.initGame();
    }

    initGame() {
        // State for 7 boards
        // 0-2: Neutral Boards (White, Neutral, Black)
        // 3-4: White Attack Boards (Queen's, King's)
        // 5-6: Black Attack Boards (Queen's, King's)
        this.boards = [
            this.createBoard(4, 0), // NB1 (Bottom)
            this.createBoard(4, 1), // NB2 (Middle)
            this.createBoard(4, 2), // NB3 (Top)
            this.createBoard(2, 3, 'white', 0), // AB_WQ (Pin 0/a1 on NB1)
            this.createBoard(2, 4, 'white', 1), // AB_WK (Pin 3/d1 on NB1)
            this.createBoard(2, 5, 'black', 2), // AB_BQ (Pin 2/a4 on NB3)
            this.createBoard(2, 6, 'black', 3)  // AB_BK (Pin 3/d4 on NB3)
        ];

        this.setupInitialPositions();
    }

    createBoard(size, id, owner = null, pin = null) {
        let squares = [];
        for (let r = 0; r < size; r++) {
            squares[r] = [];
            for (let c = 0; c < size; c++) {
                squares[r][c] = null;
            }
        }
        return {
            id,
            size,
            squares,
            owner, // For attack boards
            pin,   // Current pin index on neutral board (0-3)
            level: id < 3 ? id : (id < 5 ? 0 : 2) // Initial logical level (0, 1, or 2)
        };
    }

    setupInitialPositions() {
        // Standard TDC Piece Placement
        // White Q-Side AB (id 3): Q on (0,0), Rook on (0,1), Pawns on (1,0), (1,1)
        this.placePiece(3, 0, 0, 'queen', 'white');
        this.placePiece(3, 1, 0, 'rook', 'white');
        this.placePiece(3, 0, 1, 'pawn', 'white');
        this.placePiece(3, 1, 1, 'pawn', 'white');

        // White K-Side AB (id 4): K on (1,0), Bishop on (0,0), Pawns on (0,1), (1,1)
        this.placePiece(4, 1, 0, 'king', 'white');
        this.placePiece(4, 0, 0, 'bishop', 'white');
        this.placePiece(4, 0, 1, 'pawn', 'white');
        this.placePiece(4, 1, 1, 'pawn', 'white');

        // NB1 (id 0): Knights and Pawns
        this.placePiece(0, 1, 0, 'knight', 'white');
        this.placePiece(0, 2, 0, 'knight', 'white');
        this.placePiece(0, 1, 1, 'pawn', 'white');
        this.placePiece(0, 2, 1, 'pawn', 'white');

        // Black pieces mirrored
        this.placePiece(5, 0, 1, 'queen', 'black');
        this.placePiece(5, 1, 1, 'rook', 'black');
        this.placePiece(5, 0, 0, 'pawn', 'black');
        this.placePiece(5, 1, 0, 'pawn', 'black');

        this.placePiece(6, 1, 1, 'king', 'black');
        this.placePiece(6, 0, 1, 'bishop', 'black');
        this.placePiece(6, 0, 0, 'pawn', 'black');
        this.placePiece(6, 1, 0, 'pawn', 'black');

        this.placePiece(2, 1, 3, 'knight', 'black');
        this.placePiece(2, 2, 3, 'knight', 'black');
        this.placePiece(2, 1, 2, 'pawn', 'black');
        this.placePiece(2, 2, 2, 'pawn', 'black');
    }

    placePiece(boardId, x, y, type, color) {
        if (this.boards[boardId]) {
            this.boards[boardId].squares[y][x] = { type, color };
        }
    }

    // --- Board Movement ---

    getValidBoardMoves(boardId) {
        const board = this.boards[boardId];
        if (boardId < 3) return []; // Neutral boards don't move

        let pieceCount = 0;
        let occupant = null;
        for (let r = 0; r < board.size; r++) {
            for (let c = 0; c < board.size; c++) {
                if (board.squares[r][c]) {
                    pieceCount++;
                    occupant = board.squares[r][c];
                }
            }
        }

        if (pieceCount > 1) return [];
        if (occupant && occupant.color !== this.currentPlayer) return [];
        if (!occupant && board.owner !== this.currentPlayer) return [];

        let validPins = [];
        const currentPin = board.pin;
        for (let p = 0; p < 4; p++) {
            if (p === currentPin) continue;
            const isOccupied = this.boards.some(b => b.id > 2 && b.id !== boardId && b.level === board.level && b.pin === p);
            if (!isOccupied) validPins.push(p);
        }

        return validPins.map(p => ({ type: 'board_move', boardId, pin: p }));
    }

    makeBoardMove(boardId, pin) {
        const board = this.boards[boardId];
        board.pin = pin;
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        return true;
    }

    // --- Piece Movement ---

    getValidMoves(boardId, x, y) {
        const piece = this.boards[boardId].squares[y][x];
        if (!piece) return [];

        let moves = [];
        for (let bId = 0; bId < 7; bId++) {
            const b = this.boards[bId];
            for (let r = 0; r < b.size; r++) {
                for (let c = 0; c < b.size; c++) {
                    if (this.isValidMove(boardId, x, y, bId, c, r)) {
                        moves.push({ boardId: bId, x: c, y: r });
                    }
                }
            }
        }
        return moves;
    }

    isValidMove(fromB, fromX, fromY, toB, toX, toY) {
        const piece = this.boards[fromB].squares[fromY][fromX];
        const target = this.boards[toB].squares[toY][toX];

        if (target && target.color === piece.color) return false;

        const p1 = this.getGlobalCoords(fromB, fromX, fromY);
        const p2 = this.getGlobalCoords(toB, toX, toY);

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;

        if (piece.type !== 'knight' && !this.isPathClear(p1, p2)) return false;

        switch (piece.type) {
            case 'rook': return this.isStraightLine(dx, dy, dz);
            case 'bishop': return this.isDiagonalLine(dx, dy, dz);
            case 'queen': return this.isStraightLine(dx, dy, dz) || this.isDiagonalLine(dx, dy, dz);
            case 'king': return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && Math.abs(dz) <= 1;
            case 'knight': return this.isKnightLeap(dx, dy, dz);
            case 'pawn': return this.isPawnMove(piece.color, dx, dy, dz, target !== null);
            default: return false;
        }
    }

    getGlobalCoords(boardId, x, y) {
        const b = this.boards[boardId];
        if (boardId < 3) {
            return { x, y, z: boardId * 2 };
        } else {
            const pins = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 }];
            const pin = pins[b.pin];
            const z = b.level * 2 + (b.owner === 'white' ? -1 : 1);
            return { x: pin.x + x, y: pin.y + y, z };
        }
    }

    isStraightLine(dx, dy, dz) {
        let nonZero = 0;
        if (dx !== 0) nonZero++;
        if (dy !== 0) nonZero++;
        if (dz !== 0) nonZero++;
        return nonZero === 1;
    }

    isDiagonalLine(dx, dy, dz) {
        const ax = Math.abs(dx), ay = Math.abs(dy), az = Math.abs(dz);
        if (ax === ay && az === 0) return true;
        if (ax === az && ay === 0) return true;
        if (ay === az && ax === 0) return true;
        if (ax === ay && ay === az) return true;
        return false;
    }

    isKnightLeap(dx, dy, dz) {
        const vals = [Math.abs(dx), Math.abs(dy), Math.abs(dz)].sort();
        return vals[0] === 0 && vals[1] === 1 && vals[2] === 2;
    }

    isPawnMove(color, dx, dy, dz, isCapture) {
        const forward = color === 'white' ? 1 : -1;
        if (!isCapture) {
            return dx === 0 && dy === forward && Math.abs(dz) <= 1;
        } else {
            return Math.abs(dx) === 1 && dy === forward && Math.abs(dz) <= 1;
        }
    }

    isPathClear(p1, p2) {
        const dx = Math.sign(p2.x - p1.x);
        const dy = Math.sign(p2.y - p1.y);
        const dz = Math.sign(p2.z - p1.z);
        let curX = p1.x + dx, curY = p1.y + dy, curZ = p1.z + dz;

        while (Math.abs(curX - p2.x) > 0.1 || Math.abs(curY - p2.y) > 0.1 || Math.abs(curZ - p2.z) > 0.1) {
            if (this.isSquareOccupiedAt(curX, curY, curZ)) return false;
            curX += dx; curY += dy; curZ += dz;
            if (Math.abs(curX) > 10 || Math.abs(curY) > 10) break;
        }
        return true;
    }

    isSquareOccupiedAt(gx, gy, gz) {
        for (let bId = 0; bId < 7; bId++) {
            const b = this.boards[bId];
            for (let r = 0; r < b.size; r++) {
                for (let c = 0; c < b.size; c++) {
                    if (b.squares[r][c]) {
                        const gc = this.getGlobalCoords(bId, c, r);
                        if (Math.abs(gc.x - gx) < 0.1 && Math.abs(gc.y - gy) < 0.1 && Math.abs(gc.z - gz) < 0.1) return true;
                    }
                }
            }
        }
        return false;
    }

    makeMove(from, to) {
        const piece = this.boards[from.boardId].squares[from.y][from.x];
        const captured = this.boards[to.boardId].squares[to.y][to.x];
        this.boards[to.boardId].squares[to.y][to.x] = piece;
        this.boards[from.boardId].squares[from.y][from.x] = null;
        this.moveHistory.push({ from, to, piece, captured });
        if (captured && captured.type === 'king') this.gameOver = true;
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        return true;
    }
}

window.TDGame = null;
function initGame() {
    window.TDGame = new TDChessLogic();
    if (window.visuals) window.visuals.render();
}
