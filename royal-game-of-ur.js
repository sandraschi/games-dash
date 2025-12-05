// Royal Game of Ur - Ancient Mesopotamian Game (2600 BCE)
// Race game with special squares

const BOARD_PATH = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
];

// Game state
let gameState = {
    board: Array(21).fill(null),
    player1Pieces: 7, // Pieces not yet on board
    player2Pieces: 7,
    player1Finished: 0,
    player2Finished: 0,
    currentPlayer: 1,
    dice: 0,
    gameActive: true
};

// Roll dice (4-sided pyramid dice)
function rollDice() {
    if (!gameState.gameActive) return;
    
    let count = 0;
    for (let i = 0; i < 4; i++) {
        if (Math.random() > 0.5) count++;
    }
    
    gameState.dice = count;
    
    if (count === 0) {
        updateStatus('No move! Roll again.');
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        return;
    }
    
    updateStatus(`Rolled ${count}! Player ${gameState.currentPlayer}, select a piece to move.`);
    renderBoard();
}

// Move piece
function movePiece(position) {
    if (!gameState.gameActive || gameState.dice === 0) return;
    
    const piece = gameState.board[position];
    if (!piece || piece !== gameState.currentPlayer) {
        // Try to enter piece
        if (gameState.currentPlayer === 1 && position === 0) {
            if (gameState.player1Pieces > 0 && gameState.board[0] === null) {
                gameState.board[0] = 1;
                gameState.player1Pieces--;
                gameState.dice = 0;
                gameState.currentPlayer = 2;
                updateStatus('Player 2, roll dice!');
                renderBoard();
                return;
            }
        } else if (gameState.currentPlayer === 2 && position === 0) {
            if (gameState.player2Pieces > 0 && gameState.board[0] === null) {
                gameState.board[0] = 2;
                gameState.player2Pieces--;
                gameState.dice = 0;
                gameState.currentPlayer = 1;
                updateStatus('Player 1, roll dice!');
                renderBoard();
                return;
            }
        }
        return;
    }
    
    const newPos = position + gameState.dice;
    
    // Check if off board (win condition)
    if (newPos >= BOARD_PATH.length) {
        gameState.board[position] = null;
        if (gameState.currentPlayer === 1) {
            gameState.player1Finished++;
        } else {
            gameState.player2Finished++;
        }
        
        // Check win
        if (gameState.player1Finished === 7 || gameState.player2Finished === 7) {
            endGame();
            return;
        }
        
        gameState.dice = 0;
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateStatus(`Player ${gameState.currentPlayer}, roll dice!`);
        renderBoard();
        return;
    }
    
    // Check if blocked
    if (gameState.board[newPos] !== null && gameState.board[newPos] === gameState.currentPlayer) {
        updateStatus('Cannot move - space occupied by your piece!');
        return;
    }
    
    // Move piece
    gameState.board[newPos] = gameState.currentPlayer;
    gameState.board[position] = null;
    gameState.dice = 0;
    
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateStatus(`Player ${gameState.currentPlayer}, roll dice!`);
    renderBoard();
}

// Render board
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    
    // Simplified board display
    for (let i = 0; i < BOARD_PATH.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        // Special squares
        if (i === 4 || i === 8 || i === 14) {
            cell.classList.add('special');
        }
        
        const piece = gameState.board[i];
        if (piece) {
            const pieceEl = document.createElement('div');
            pieceEl.className = `piece player${piece}`;
            pieceEl.textContent = piece === 1 ? '●' : '●';
            cell.appendChild(pieceEl);
            
            if (gameState.dice > 0 && piece === gameState.currentPlayer) {
                cell.style.cursor = 'pointer';
                cell.onclick = () => movePiece(i);
            }
        } else if (gameState.dice > 0 && i === 0) {
            cell.style.cursor = 'pointer';
            cell.onclick = () => movePiece(0);
        }
        
        boardEl.appendChild(cell);
    }
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame() {
    gameState.gameActive = false;
    const winner = gameState.player1Finished === 7 ? 1 : 2;
    updateStatus(`🎉 Player ${winner} wins! All pieces finished!`);
}

// New game
function newGame() {
    gameState.board = Array(21).fill(null);
    gameState.player1Pieces = 7;
    gameState.player2Pieces = 7;
    gameState.player1Finished = 0;
    gameState.player2Finished = 0;
    gameState.currentPlayer = 1;
    gameState.dice = 0;
    gameState.gameActive = true;
    renderBoard();
    updateStatus('Player 1, roll dice to start!');
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
