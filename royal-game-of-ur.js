// Royal Game of Ur - Ancient Mesopotamian Game (2600 BCE)
// Race game with special squares (rosettes) and capturing

// Board layout: 20 squares total
// Player 1 path: Start (off-board) -> 0-7 (shared) -> 8-14 (shared) -> 15-19 (player 1 only) -> Finish
// Player 2 path: Start (off-board) -> 0-7 (shared) -> 8-14 (shared) -> 15-19 (player 2 only) -> Finish
// Rosettes (safe squares, extra turn): 4, 8, 14
const ROSETTE_SQUARES = [4, 8, 14];

// Game state
let gameState = {
    board: Array(20).fill(null), // 0-19 squares
    player1Pieces: 7, // Pieces not yet on board
    player2Pieces: 7,
    player1Finished: 0,
    player2Finished: 0,
    currentPlayer: 1,
    dice: 0,
    gameActive: true,
    canRollAgain: false // For rosette extra turns
};

// Roll dice (4 binary pyramid dice - count white sides)
function rollDice() {
    if (!gameState.gameActive) return;
    if (gameState.dice > 0 && !gameState.canRollAgain) {
        updateStatus('You must move a piece first!');
        return;
    }
    
    let count = 0;
    for (let i = 0; i < 4; i++) {
        if (Math.random() > 0.5) count++;
    }
    
    gameState.dice = count;
    gameState.canRollAgain = false;
    
    if (count === 0) {
        updateStatus('Rolled 0! No move possible. Turn passes.');
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        gameState.dice = 0;
        renderBoard();
        return;
    }
    
    updateStatus(`Rolled ${count}! Player ${gameState.currentPlayer}, select a piece to move or enter a new piece.`);
    renderBoard();
}

// Get valid moves for current player
function getValidMoves() {
    const moves = [];
    
    // Can enter new piece if rolled non-zero and start square (0) is empty or has opponent piece
    if (gameState.dice > 0) {
        const startSquare = 0;
        const piece = gameState.board[startSquare];
        if (piece === null || (piece !== null && piece !== gameState.currentPlayer)) {
            moves.push({ from: -1, to: startSquare, type: 'enter' });
        }
    }
    
    // Check moves for pieces on board
    for (let i = 0; i < gameState.board.length; i++) {
        const piece = gameState.board[i];
        if (piece === gameState.currentPlayer) {
            const newPos = i + gameState.dice;
            
            // Can finish piece
            if (newPos >= gameState.board.length) {
                moves.push({ from: i, to: -1, type: 'finish' });
            } else {
                // Can move if destination is empty or has opponent piece (capture)
                const target = gameState.board[newPos];
                if (target === null || (target !== null && target !== gameState.currentPlayer)) {
                    moves.push({ from: i, to: newPos, type: 'move' });
                }
            }
        }
    }
    
    return moves;
}

// Move piece
function movePiece(fromPos) {
    if (!gameState.gameActive || gameState.dice === 0) return;
    
    const validMoves = getValidMoves();
    const move = validMoves.find(m => m.from === fromPos || (fromPos === -1 && m.type === 'enter'));
    
    if (!move) {
        updateStatus('Invalid move! Select a valid piece or enter square.');
        return;
    }
    
    // Enter new piece
    if (move.type === 'enter') {
        const startSquare = 0;
        const existingPiece = gameState.board[startSquare];
        
        // Capture opponent piece
        if (existingPiece !== null && existingPiece !== gameState.currentPlayer) {
            if (gameState.currentPlayer === 1) {
                gameState.player2Pieces++;
            } else {
                gameState.player1Pieces++;
            }
        }
        
        gameState.board[startSquare] = gameState.currentPlayer;
        if (gameState.currentPlayer === 1) {
            gameState.player1Pieces--;
        } else {
            gameState.player2Pieces--;
        }
    }
    // Finish piece
    else if (move.type === 'finish') {
        gameState.board[move.from] = null;
        if (gameState.currentPlayer === 1) {
            gameState.player1Finished++;
        } else {
            gameState.player2Finished++;
        }
        
        // Check win condition
        if (gameState.player1Finished === 7 || gameState.player2Finished === 7) {
            endGame();
            return;
        }
    }
    // Regular move
    else {
        const existingPiece = gameState.board[move.to];
        
        // Capture opponent piece
        if (existingPiece !== null && existingPiece !== gameState.currentPlayer) {
            if (gameState.currentPlayer === 1) {
                gameState.player2Pieces++;
            } else {
                gameState.player1Pieces++;
            }
        }
        
        gameState.board[move.to] = gameState.currentPlayer;
        gameState.board[move.from] = null;
    }
    
    // Check if landed on rosette (extra turn)
    const landedOnRosette = ROSETTE_SQUARES.includes(move.to !== -1 ? move.to : 0);
    
    gameState.dice = 0;
    
    if (landedOnRosette && move.type !== 'finish') {
        gameState.canRollAgain = true;
        updateStatus(`Landed on rosette! Player ${gameState.currentPlayer} gets an extra turn!`);
    } else {
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateStatus(`Player ${gameState.currentPlayer}, roll dice!`);
    }
    
    renderBoard();
}

// Render board - linear display showing all 20 squares
function renderBoard() {
    const boardEl = document.getElementById('board');
    if (!boardEl) {
        console.error('Board element not found!');
        return;
    }
    boardEl.innerHTML = '';
    
    // Display all 20 squares in order
    for (let i = 0; i < 20; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.width = '70px';
        cell.style.height = '70px';
        cell.style.minWidth = '70px';
        cell.style.minHeight = '70px';
        cell.style.flexShrink = '0';
        
        // Rosette square (safe, extra turn)
        if (ROSETTE_SQUARES.includes(i)) {
            cell.classList.add('special');
            cell.title = 'Rosette - Safe square, extra turn!';
        }
        
        const piece = gameState.board[i];
        if (piece) {
            const pieceEl = document.createElement('div');
            pieceEl.className = `piece player${piece}`;
            pieceEl.textContent = '●';
            cell.appendChild(pieceEl);
            
            // Make clickable if valid move
            if (gameState.dice > 0) {
                const validMoves = getValidMoves();
                if (validMoves.some(m => m.from === i)) {
                    cell.style.cursor = 'pointer';
                    cell.style.opacity = '1';
                    cell.style.border = '3px solid #00FF00';
                    cell.onclick = () => movePiece(i);
                } else {
                    cell.style.opacity = '0.6';
                }
            }
        } else {
            // Empty square - can enter piece if it's start square (0)
            if (gameState.dice > 0 && i === 0) {
                const validMoves = getValidMoves();
                if (validMoves.some(m => m.type === 'enter')) {
                    cell.style.cursor = 'pointer';
                    cell.style.border = '2px dashed #FFD700';
                    cell.title = 'Click to enter a new piece';
                    cell.onclick = () => movePiece(-1);
                }
            } else if (gameState.dice > 0) {
                // Show valid destination squares
                const validMoves = getValidMoves();
                if (validMoves.some(m => m.to === i)) {
                    cell.style.border = '2px dashed #00FF00';
                    cell.style.opacity = '0.8';
                }
            }
        }
        
        if (!cell.title) {
            cell.title = `Square ${i}${ROSETTE_SQUARES.includes(i) ? ' (Rosette)' : ''}`;
        }
        
        boardEl.appendChild(cell);
    }
    
    // Update status with piece counts
    const statusEl = document.getElementById('status');
    let baseText = statusEl.textContent.split(' | ')[0];
    statusEl.textContent = `${baseText} | P1: ${gameState.player1Pieces} in hand, ${gameState.player1Finished} finished | P2: ${gameState.player2Pieces} in hand, ${gameState.player2Finished} finished`;
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
    gameState.board = Array(20).fill(null);
    gameState.player1Pieces = 7;
    gameState.player2Pieces = 7;
    gameState.player1Finished = 0;
    gameState.player2Finished = 0;
    gameState.currentPlayer = 1;
    gameState.dice = 0;
    gameState.gameActive = true;
    gameState.canRollAgain = false;
    renderBoard();
    updateStatus('Player 1, roll dice to start!');
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
