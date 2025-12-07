// Senet - Ancient Egyptian Game (3100 BCE)
// Race game: Move all pieces off the board

const BOARD_SIZE = 30; // 3 rows x 10 columns

// Game state
let gameState = {
    board: Array(BOARD_SIZE).fill(null),
    currentPlayer: 1, // 1 or 2
    sticks: 0, // 0-5 (0 = no move)
    gameActive: true
};

// Initialize board
function initBoard() {
    gameState.board = Array(BOARD_SIZE).fill(null);
    
    // Player 1 pieces (positions 0-4)
    for (let i = 0; i < 5; i++) {
        gameState.board[i] = { player: 1, id: i };
    }
    
    // Player 2 pieces (positions 25-29)
    for (let i = 0; i < 5; i++) {
        gameState.board[25 + i] = { player: 2, id: i };
    }
}

// Roll sticks (4 sticks, count white sides)
function rollSticks() {
    if (!gameState.gameActive) return;
    
    let whiteCount = 0;
    for (let i = 0; i < 4; i++) {
        if (Math.random() > 0.5) whiteCount++;
    }
    
    gameState.sticks = whiteCount;
    
    if (whiteCount === 0) {
        updateStatus('No move! Roll again.');
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        return;
    }
    
    updateStatus(`Rolled ${whiteCount}! Player ${gameState.currentPlayer}, select a piece to move.`);
    renderBoard();
}

// Move piece
function movePiece(position) {
    if (!gameState.gameActive || gameState.sticks === 0) return;
    
    const piece = gameState.board[position];
    if (!piece || piece.player !== gameState.currentPlayer) return;
    
    const newPos = position + gameState.sticks;
    
    // Check if off board (win condition)
    if (newPos >= BOARD_SIZE) {
        gameState.board[position] = null;
        updateStatus(`Piece moved off board!`);
        gameState.sticks = 0;
        
        // Check win
        const remaining = gameState.board.filter(p => p && p.player === gameState.currentPlayer).length;
        if (remaining === 0) {
            endGame(gameState.currentPlayer);
            return;
        }
        
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        renderBoard();
        return;
    }
    
    // Check if blocked
    if (gameState.board[newPos] !== null) {
        updateStatus('Cannot move - space occupied!');
        return;
    }
    
    // Move piece
    gameState.board[newPos] = piece;
    gameState.board[position] = null;
    gameState.sticks = 0;
    
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateStatus(`Player ${gameState.currentPlayer}'s turn. Roll sticks!`);
    renderBoard();
}

// Render board
function renderBoard() {
    const boardEl = document.getElementById('board');
    if (!boardEl) {
        console.error('Board element not found!');
        return;
    }
    boardEl.innerHTML = '';
    
    // 3 rows x 10 columns
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 10; col++) {
            let index;
            if (row === 0) {
                index = col;
            } else if (row === 1) {
                index = 19 - col; // Reverse direction
            } else {
                index = 20 + col;
            }
            
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = '60px';
            cell.style.height = '60px';
            cell.style.minWidth = '60px';
            cell.style.minHeight = '60px';
            cell.style.flexShrink = '0';
            
            // Special squares
            if (index === 14 || index === 25 || index === 26 || index === 27) {
                cell.classList.add('special');
            }
            
            const piece = gameState.board[index];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece player${piece.player}`;
                pieceEl.textContent = '●';
                pieceEl.style.color = piece.player === 1 ? '#FFD700' : '#FF6B6B';
                pieceEl.style.fontSize = '2em';
                cell.appendChild(pieceEl);
                
                // Make clickable if it's player's piece and sticks are rolled
                if (gameState.sticks > 0 && piece.player === gameState.currentPlayer && gameState.gameActive) {
                    cell.style.cursor = 'pointer';
                    cell.style.border = '3px solid #FFD700';
                    cell.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
                    cell.onclick = () => movePiece(index);
                }
            } else {
                // Empty cell - show square number for debugging
                cell.title = `Square ${index}`;
            }
            
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
    updateStatus(`🎉 Player ${winner} wins! All pieces moved off the board!`);
}

// New game
function newGame() {
    gameState.currentPlayer = 1;
    gameState.sticks = 0;
    gameState.gameActive = true;
    initBoard();
    renderBoard();
    updateStatus('Player 1, roll sticks to start!');
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
