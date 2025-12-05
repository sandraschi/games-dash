// Xiangqi - Chinese Chess (Simplified)
// 9x10 board, river in middle, palaces for generals

const PIECES = {
    'R': '車', 'H': '馬', 'E': '象', 'A': '士', 'G': '將', 'C': '炮', 'P': '兵'
};

// Game state
let gameState = {
    board: Array(10).fill(null).map(() => Array(9).fill(null)),
    currentPlayer: 'red',
    selectedPiece: null,
    gameActive: true
};

// Initialize board
function initBoard() {
    // Red pieces (bottom)
    gameState.board[9][0] = { type: 'R', player: 'red' };
    gameState.board[9][1] = { type: 'H', player: 'red' };
    gameState.board[9][2] = { type: 'E', player: 'red' };
    gameState.board[9][3] = { type: 'A', player: 'red' };
    gameState.board[9][4] = { type: 'G', player: 'red' };
    gameState.board[9][5] = { type: 'A', player: 'red' };
    gameState.board[9][6] = { type: 'E', player: 'red' };
    gameState.board[9][7] = { type: 'H', player: 'red' };
    gameState.board[9][8] = { type: 'R', player: 'red' };
    gameState.board[7][1] = { type: 'C', player: 'red' };
    gameState.board[7][7] = { type: 'C', player: 'red' };
    for (let i = 0; i < 9; i += 2) {
        gameState.board[6][i] = { type: 'P', player: 'red' };
    }
    
    // Black pieces (top)
    gameState.board[0][0] = { type: 'R', player: 'black' };
    gameState.board[0][1] = { type: 'H', player: 'black' };
    gameState.board[0][2] = { type: 'E', player: 'black' };
    gameState.board[0][3] = { type: 'A', player: 'black' };
    gameState.board[0][4] = { type: 'G', player: 'black' };
    gameState.board[0][5] = { type: 'A', player: 'black' };
    gameState.board[0][6] = { type: 'E', player: 'black' };
    gameState.board[0][7] = { type: 'H', player: 'black' };
    gameState.board[0][8] = { type: 'R', player: 'black' };
    gameState.board[2][1] = { type: 'C', player: 'black' };
    gameState.board[2][7] = { type: 'C', player: 'black' };
    for (let i = 0; i < 9; i += 2) {
        gameState.board[3][i] = { type: 'P', player: 'black' };
    }
}

// Handle cell click
function handleCellClick(row, col) {
    if (!gameState.gameActive) return;
    
    const piece = gameState.board[row][col];
    
    if (gameState.selectedPiece) {
        const [selRow, selCol] = gameState.selectedPiece;
        
        // Try to move
        if (canMove(selRow, selCol, row, col)) {
            gameState.board[row][col] = gameState.board[selRow][selCol];
            gameState.board[selRow][selCol] = null;
            
            // Check win (captured general)
            if (piece && piece.type === 'G') {
                endGame(gameState.currentPlayer);
                return;
            }
            
            gameState.selectedPiece = null;
            gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
            updateStatus(`${gameState.currentPlayer === 'red' ? 'Red' : 'Black'} player's turn!`);
        } else {
            // Deselect or select new piece
            gameState.selectedPiece = null;
            if (piece && piece.player === gameState.currentPlayer) {
                gameState.selectedPiece = [row, col];
            }
        }
    } else {
        // Select piece
        if (piece && piece.player === gameState.currentPlayer) {
            gameState.selectedPiece = [row, col];
        }
    }
    
    renderBoard();
}

// Can move (simplified rules)
function canMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    if (!piece) return false;
    
    const target = gameState.board[toRow][toCol];
    if (target && target.player === piece.player) return false;
    
    // Simplified movement (basic rules)
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    switch (piece.type) {
        case 'R': // Chariot (Rook)
            return (rowDiff === 0 || colDiff === 0) && !isBlocked(fromRow, fromCol, toRow, toCol);
        case 'H': // Horse (Knight-like)
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        case 'P': // Pawn
            if (piece.player === 'red') {
                return toRow < fromRow && colDiff === 0;
            } else {
                return toRow > fromRow && colDiff === 0;
            }
        default:
            return rowDiff <= 1 && colDiff <= 1; // Simplified for other pieces
    }
}

// Check if path is blocked
function isBlocked(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let r = fromRow + rowStep;
    let c = fromCol + colStep;
    
    while (r !== toRow || c !== toCol) {
        if (gameState.board[r][c] !== null) return true;
        r += rowStep;
        c += colStep;
    }
    
    return false;
}

// Render board
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // River
            if (row >= 5 && row <= 4) {
                cell.classList.add('river');
            }
            
            // Palace
            if ((row >= 7 && row <= 9 && col >= 3 && col <= 5) ||
                (row >= 0 && row <= 2 && col >= 3 && col <= 5)) {
                cell.classList.add('palace');
            }
            
            // Selected
            if (gameState.selectedPiece && gameState.selectedPiece[0] === row && gameState.selectedPiece[1] === col) {
                cell.style.border = '3px solid #FFD700';
            }
            
            // Pieces
            const piece = gameState.board[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${piece.player}`;
                pieceEl.textContent = PIECES[piece.type];
                cell.appendChild(pieceEl);
            }
            
            cell.onclick = () => handleCellClick(row, col);
            boardEl.appendChild(cell);
        }
    }
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame(winner) {
    gameState.gameActive = false;
    updateStatus(`🎉 ${winner === 'red' ? 'Red' : 'Black'} player wins!`);
}

// New game
function newGame() {
    gameState.currentPlayer = 'red';
    gameState.selectedPiece = null;
    gameState.gameActive = true;
    initBoard();
    renderBoard();
    updateStatus('Red player's turn! Click a piece to move.');
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
