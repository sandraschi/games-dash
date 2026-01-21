// Reversi (Othello) Game Logic
// **Timestamp**: 2025-12-10

const BOARD_SIZE = 8;
let board = [];
let currentPlayer = 'black'; // 'black' or 'white'
let aiEnabled = false;
let gameOver = false;

// Directions: [row, col] offsets
const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

function initBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    
    // Initial setup: 4 pieces in center
    const center = BOARD_SIZE / 2;
    board[center - 1][center - 1] = 'white';
    board[center - 1][center] = 'black';
    board[center][center - 1] = 'black';
    board[center][center] = 'white';
    
    currentPlayer = 'black';
    gameOver = false;
    renderBoard();
    updateStatus();
}

function isValidMove(row, col, player) {
    if (board[row][col] !== null) return false;
    
    const opponent = player === 'black' ? 'white' : 'black';
    
    // Check all 8 directions
    for (let [dr, dc] of DIRECTIONS) {
        let r = row + dr;
        let c = col + dc;
        let foundOpponent = false;
        
        // Move in direction while finding opponent pieces
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
            foundOpponent = true;
            r += dr;
            c += dc;
        }
        
        // If we found opponent pieces and then our own piece, it's valid
        if (foundOpponent && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            return true;
        }
    }
    
    return false;
}

function getValidMoves(player) {
    const moves = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (isValidMove(row, col, player)) {
                moves.push([row, col]);
            }
        }
    }
    return moves;
}

function makeMove(row, col, player) {
    if (!isValidMove(row, col, player)) return false;
    
    board[row][col] = player;
    const opponent = player === 'black' ? 'white' : 'black';
    const piecesToFlip = [];
    
    // Check all 8 directions and collect pieces to flip
    for (let [dr, dc] of DIRECTIONS) {
        let r = row + dr;
        let c = col + dc;
        const directionPieces = [];
        
        // Move in direction while finding opponent pieces
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
            directionPieces.push([r, c]);
            r += dr;
            c += dc;
        }
        
        // If we found our own piece, flip all opponent pieces in this direction
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            piecesToFlip.push(...directionPieces);
        }
    }
    
    // Flip all pieces
    piecesToFlip.forEach(([r, c]) => {
        board[r][c] = player;
    });
    
    return true;
}

function handleCellClick(row, col) {
    if (gameOver || aiEnabled && currentPlayer === 'white') return;
    if (!isValidMove(row, col, currentPlayer)) return;
    
    makeMove(row, col, currentPlayer);
    renderBoard();
    
    // Switch player
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    
    // Check if game is over
    const blackMoves = getValidMoves('black');
    const whiteMoves = getValidMoves('white');
    
    if (blackMoves.length === 0 && whiteMoves.length === 0) {
        endGame();
        return;
    }
    
    // If current player has no moves, skip turn
    const currentMoves = getValidMoves(currentPlayer);
    if (currentMoves.length === 0) {
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        updateStatus();
        if (aiEnabled && currentPlayer === 'white') {
            setTimeout(aiMove, 500);
        }
    } else {
        updateStatus();
        if (aiEnabled && currentPlayer === 'white') {
            setTimeout(aiMove, 500);
        }
    }
}

function aiMove() {
    if (gameOver || currentPlayer !== 'white') return;
    
    const moves = getValidMoves('white');
    if (moves.length === 0) {
        // No moves available, skip turn
        currentPlayer = 'black';
        updateStatus();
        return;
    }
    
    // Simple AI: choose move that flips most pieces
    let bestMove = null;
    let maxFlips = 0;
    
    for (let [row, col] of moves) {
        // Simulate move to count flips
        const testBoard = board.map(r => [...r]);
        testBoard[row][col] = 'white';
        let flips = 0;
        
        for (let [dr, dc] of DIRECTIONS) {
            let r = row + dr;
            let c = col + dc;
            const directionPieces = [];
            
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && testBoard[r][c] === 'black') {
                directionPieces.push([r, c]);
                r += dr;
                c += dc;
            }
            
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && testBoard[r][c] === 'white') {
                flips += directionPieces.length;
            }
        }
        
        if (flips > maxFlips) {
            maxFlips = flips;
            bestMove = [row, col];
        }
    }
    
    // If no best move found, pick random
    if (!bestMove) {
        bestMove = moves[Math.floor(Math.random() * moves.length)];
    }
    
    makeMove(bestMove[0], bestMove[1], 'white');
    renderBoard();
    
    // Switch player
    currentPlayer = 'black';
    
    // Check if game is over
    const blackMoves = getValidMoves('black');
    const whiteMoves = getValidMoves('white');
    
    if (blackMoves.length === 0 && whiteMoves.length === 0) {
        endGame();
        return;
    }
    
    // If current player has no moves, skip turn
    const currentMoves = getValidMoves(currentPlayer);
    if (currentMoves.length === 0) {
        currentPlayer = 'white';
        updateStatus();
        setTimeout(aiMove, 500);
    } else {
        updateStatus();
    }
}

function renderBoard() {
    const boardEl = document.getElementById('reversiBoard');
    boardEl.innerHTML = '';
    
    const validMoves = getValidMoves(currentPlayer);
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'reversi-square';
            
            if (validMoves.some(([r, c]) => r === row && c === col)) {
                cell.classList.add('valid-move');
            }
            
            if (board[row][col]) {
                const piece = document.createElement('div');
                piece.className = `reversi-piece ${board[row][col]}`;
                cell.appendChild(piece);
            }
            
            cell.onclick = () => handleCellClick(row, col);
            boardEl.appendChild(cell);
        }
    }
    
    updateScores();
}

function updateScores() {
    let blackCount = 0;
    let whiteCount = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === 'black') blackCount++;
            if (board[row][col] === 'white') whiteCount++;
        }
    }
    
    document.getElementById('blackScore').textContent = blackCount;
    document.getElementById('whiteScore').textContent = whiteCount;
}

function updateStatus() {
    if (gameOver) return;
    
    const validMoves = getValidMoves(currentPlayer);
    if (validMoves.length === 0) {
        const opponent = currentPlayer === 'black' ? 'white' : 'black';
        document.getElementById('status').textContent = `${currentPlayer === 'black' ? '⚫' : '⚪'} ${currentPlayer.toUpperCase()} has no moves! ${opponent === 'black' ? '⚫' : '⚪'} ${opponent.toUpperCase()}'s turn.`;
    } else {
        document.getElementById('status').textContent = `${currentPlayer === 'black' ? '⚫' : '⚪'} ${currentPlayer.toUpperCase()}'s Turn`;
    }
}

function endGame() {
    gameOver = true;
    let blackCount = 0;
    let whiteCount = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === 'black') blackCount++;
            if (board[row][col] === 'white') whiteCount++;
        }
    }
    
    let winner = '';
    if (blackCount > whiteCount) {
        winner = '⚫ BLACK WINS!';
    } else if (whiteCount > blackCount) {
        winner = '⚪ WHITE WINS!';
    } else {
        winner = '🤝 DRAW!';
    }
    
    document.getElementById('status').textContent = `Game Over! ${winner} (⚫ ${blackCount} - ⚪ ${whiteCount})`;
}

function newGame() {
    initBoard();
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    document.getElementById('aiToggle').textContent = aiEnabled ? '👤 Play vs Human' : '🤖 Play vs AI';
    
    if (aiEnabled && currentPlayer === 'white') {
        setTimeout(aiMove, 500);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initBoard();
});

