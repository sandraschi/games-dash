// Tetris AI - Pierre Dellacherie Algorithm
// **Timestamp**: 2025-12-03

class TetrisAI {
    constructor() {
        // Optimized weights from genetic algorithm
        this.weights = {
            landingHeight: -4.500158825082766,
            erodedPieces: 3.4181268101392694,
            rowTransitions: -3.2178882868487753,
            colTransitions: -9.348695305445199,
            holes: -7.899265427351652,
            wells: -3.3855972247263626
        };
        
        this.speed = 100; // Pieces per second (adjustable 1-1000)
        this.enabled = false;
    }
    
    findBestMove(board, piece) {
        let bestScore = -Infinity;
        let bestMove = null;
        
        // Try all rotations
        for (let rotation = 0; rotation < 4; rotation++) {
            const rotatedPiece = this.rotatePiece(piece, rotation);
            
            // Try all columns
            for (let col = 0; col < 10; col++) {
                const testBoard = this.cloneBoard(board);
                const row = this.dropPiece(testBoard, rotatedPiece, col);
                
                if (row !== -1) {
                    const score = this.evaluate(testBoard);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { rotation, col };
                    }
                }
            }
        }
        
        return bestMove;
    }
    
    evaluate(board) {
        let score = 0;
        
        score += this.getLandingHeight(board) * this.weights.landingHeight;
        score += this.getRowTransitions(board) * this.weights.rowTransitions;
        score += this.getColTransitions(board) * this.weights.colTransitions;
        score += this.getHoles(board) * this.weights.holes;
        score += this.getWells(board) * this.weights.wells;
        
        return score;
    }
    
    getLandingHeight(board) {
        for (let row = 0; row < 20; row++) {
            if (board[row].some(cell => cell !== 0)) {
                return 20 - row;
            }
        }
        return 0;
    }
    
    getRowTransitions(board) {
        let transitions = 0;
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 9; col++) {
                if ((board[row][col] === 0) !== (board[row][col + 1] === 0)) {
                    transitions++;
                }
            }
        }
        return transitions;
    }
    
    getColTransitions(board) {
        let transitions = 0;
        for (let col = 0; col < 10; col++) {
            for (let row = 0; row < 19; row++) {
                if ((board[row][col] === 0) !== (board[row + 1][col] === 0)) {
                    transitions++;
                }
            }
        }
        return transitions;
    }
    
    getHoles(board) {
        let holes = 0;
        for (let col = 0; col < 10; col++) {
            let blockFound = false;
            for (let row = 0; row < 20; row++) {
                if (board[row][col] !== 0) {
                    blockFound = true;
                } else if (blockFound) {
                    holes++;
                }
            }
        }
        return holes;
    }
    
    getWells(board) {
        let wells = 0;
        for (let col = 0; col < 10; col++) {
            for (let row = 19; row >= 0; row--) {
                if (board[row][col] === 0) {
                    const leftWall = col === 0 || board[row][col - 1] !== 0;
                    const rightWall = col === 9 || board[row][col + 1] !== 0;
                    if (leftWall && rightWall) {
                        wells++;
                    }
                }
            }
        }
        return wells;
    }
    
    rotatePiece(piece, times) {
        // Rotation logic (simplified)
        return piece;
    }
    
    cloneBoard(board) {
        return board.map(row => [...row]);
    }
    
    dropPiece(board, piece, col) {
        // Drop piece simulation (simplified)
        return 0;
    }
    
    setSpeed(piecesPerSecond) {
        this.speed = Math.max(1, Math.min(1000, piecesPerSecond));
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
}

// Export for use
window.TetrisAI = TetrisAI;

