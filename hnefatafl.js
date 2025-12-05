// Hnefatafl - Viking Strategy Game
// Asymmetric game: Defenders (blue) try to get King to corner, Attackers (red) try to capture King

const BOARD_SIZE = 11;
const CORNERS = [[0, 0], [0, 10], [10, 0], [10, 10]];

// Game state
let gameState = {
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
    currentPlayer: 'defender', // 'defender' or 'attacker'
    selectedPiece: null,
    validMoves: [],
    gameActive: true
};

// Initialize board
function initBoard() {
    // Clear board
    gameState.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    
    // Center throne (king starts here)
    const center = Math.floor(BOARD_SIZE / 2);
    gameState.board[center][center] = { type: 'king', player: 'defender' };
    
    // Defenders around king
    const defenderPositions = [
        [center-1, center], [center+1, center], [center, center-1], [center, center+1],
        [center-2, center], [center+2, center], [center, center-2], [center, center+2],
        [center-1, center-1], [center+1, center+1], [center-1, center+1], [center+1, center-1]
    ];
    defenderPositions.forEach(([r, c]) => {
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            gameState.board[r][c] = { type: 'defender', player: 'defender' };
        }
    });
    
    // Attackers on edges
    for (let i = 0; i < BOARD_SIZE; i++) {
        // Top and bottom rows (except corners and center)
        if (i !== center && i !== 0 && i !== BOARD_SIZE - 1) {
            gameState.board[0][i] = { type: 'attacker', player: 'attacker' };
            gameState.board[BOARD_SIZE - 1][i] = { type: 'attacker', player: 'attacker' };
        }
        // Left and right columns (except corners and center)
        if (i !== center && i !== 0 && i !== BOARD_SIZE - 1) {
            gameState.board[i][0] = { type: 'attacker', player: 'attacker' };
            gameState.board[i][BOARD_SIZE - 1] = { type: 'attacker', player: 'attacker' };
        }
    }
}

// Get valid moves for a piece
function getValidMoves(row, col) {
    const piece = gameState.board[row][col];
    if (!piece) return [];
    
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Orthogonal only
    
    directions.forEach(([dr, dc]) => {
        for (let dist = 1; dist < BOARD_SIZE; dist++) {
            const newRow = row + dr * dist;
            const newCol = col + dc * dist;
            
            if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
            
            // Can't move through pieces
            if (gameState.board[newRow][newCol] !== null) break;
            
            // Can't move to throne (except king)
            if (newRow === Math.floor(BOARD_SIZE / 2) && newCol === Math.floor(BOARD_SIZE / 2) && piece.type !== 'king') break;
            
            // Can't move to corners (except king)
            if (CORNERS.some(([cr, cc]) => cr === newRow && cc === newCol) && piece.type !== 'king') break;
            
            moves.push([newRow, newCol]);
        }
    });
    
    return moves;
}

// Check capture
function checkCapture(row, col, player) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const captured = [];
    
    directions.forEach(([dr, dc]) => {
        const adjRow = row + dr;
        const adjCol = col + dc;
        
        if (adjRow < 0 || adjRow >= BOARD_SIZE || adjCol < 0 || adjCol >= BOARD_SIZE) return;
        
        const adjPiece = gameState.board[adjRow][adjCol];
        if (!adjPiece || adjPiece.player === player) return;
        
        // Check if sandwiched
        const oppRow = adjRow + dr;
        const oppCol = adjCol + dc;
        
        if (oppRow >= 0 && oppRow < BOARD_SIZE && oppCol >= 0 && oppCol < BOARD_SIZE) {
            const oppPiece = gameState.board[oppRow][oppCol];
            if (oppPiece && oppPiece.player === player) {
                // Sandwiched! (but king needs 4 sides)
                if (adjPiece.type === 'king') {
                    // Check all 4 sides
                    const sides = directions.filter(([dR, dC]) => {
                        const checkRow = row + dR;
                        const checkCol = col + dC;
                        if (checkRow < 0 || checkRow >= BOARD_SIZE || checkCol < 0 || checkCol >= BOARD_SIZE) return false;
                        const p = gameState.board[checkRow][checkCol];
                        return p && p.player === player;
                    });
                    if (sides.length >= 4) {
                        captured.push([adjRow, adjCol]);
                    }
                } else {
                    captured.push([adjRow, adjCol]);
                }
            }
        }
    });
    
    return captured;
}

// Handle cell click
function handleCellClick(row, col) {
    if (!gameState.gameActive) return;
    
    const piece = gameState.board[row][col];
    
    if (gameState.selectedPiece) {
        const [selRow, selCol] = gameState.selectedPiece;
        
        // Check if clicking valid move
        if (gameState.validMoves.some(([r, c]) => r === row && c === col)) {
            // Move piece
            gameState.board[row][col] = gameState.board[selRow][selCol];
            gameState.board[selRow][selCol] = null;
            
            // Check captures
            const captured = checkCapture(row, col, gameState.currentPlayer);
            captured.forEach(([r, c]) => {
                if (gameState.board[r][c]?.type === 'king') {
                    endGame('attacker');
                    return;
                }
                gameState.board[r][c] = null;
            });
            
            // Check win: King in corner
            if (piece?.type === 'king' && CORNERS.some(([cr, cc]) => cr === row && cc === col)) {
                endGame('defender');
                return;
            }
            
            gameState.selectedPiece = null;
            gameState.validMoves = [];
            gameState.currentPlayer = gameState.currentPlayer === 'defender' ? 'attacker' : 'defender';
            
            if (gameState.currentPlayer === 'attacker') {
                setTimeout(() => aiTurn(), 1000);
            }
        } else {
            // Deselect or select new piece
            gameState.selectedPiece = null;
            gameState.validMoves = [];
            if (piece && piece.player === gameState.currentPlayer) {
                gameState.selectedPiece = [row, col];
                gameState.validMoves = getValidMoves(row, col);
            }
        }
    } else {
        // Select piece
        if (piece && piece.player === gameState.currentPlayer) {
            gameState.selectedPiece = [row, col];
            gameState.validMoves = getValidMoves(row, col);
        }
    }
    
    updateDisplay();
}

// AI turn (attacker)
function aiTurn() {
    if (!gameState.gameActive || gameState.currentPlayer !== 'attacker') return;
    
    // Find all attacker pieces
    const pieces = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.player === 'attacker') {
                const moves = getValidMoves(r, c);
                if (moves.length > 0) {
                    pieces.push({ row: r, col: c, moves });
                }
            }
        }
    }
    
    if (pieces.length === 0) {
        endGame('defender');
        return;
    }
    
    // Random move
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    const move = piece.moves[Math.floor(Math.random() * piece.moves.length)];
    
    // Move
    gameState.board[move[0]][move[1]] = gameState.board[piece.row][piece.col];
    gameState.board[piece.row][piece.col] = null;
    
    // Check captures
    const captured = checkCapture(move[0], move[1], 'attacker');
    captured.forEach(([r, c]) => {
        if (gameState.board[r][c]?.type === 'king') {
            endGame('attacker');
            return;
        }
        gameState.board[r][c] = null;
    });
    
    gameState.currentPlayer = 'defender';
    updateDisplay();
    updateStatus('Your turn! Move the King to a corner!');
}

// Render board
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // Throne
            if (row === Math.floor(BOARD_SIZE / 2) && col === Math.floor(BOARD_SIZE / 2)) {
                cell.classList.add('throne');
            }
            
            // Corners
            if (CORNERS.some(([cr, cc]) => cr === row && cc === col)) {
                cell.classList.add('corner');
            }
            
            // Selected
            if (gameState.selectedPiece && gameState.selectedPiece[0] === row && gameState.selectedPiece[1] === col) {
                cell.classList.add('selected');
            }
            
            // Valid moves
            if (gameState.validMoves.some(([r, c]) => r === row && c === col)) {
                cell.classList.add('valid-move');
            }
            
            // Pieces
            const piece = gameState.board[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${piece.type}`;
                if (piece.type === 'king') {
                    pieceEl.textContent = '👑';
                } else if (piece.type === 'defender') {
                    pieceEl.textContent = '🛡️';
                } else {
                    pieceEl.textContent = '⚔️';
                }
                cell.appendChild(pieceEl);
            }
            
            cell.onclick = () => handleCellClick(row, col);
            boardEl.appendChild(cell);
        }
    }
}

// Update display
function updateDisplay() {
    renderBoard();
    
    if (gameState.currentPlayer === 'defender') {
        updateStatus('Your turn! Move the King to a corner!');
    } else {
        updateStatus('AI (Attackers) turn...');
    }
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame(winner) {
    gameState.gameActive = false;
    if (winner === 'defender') {
        updateStatus('🎉 Victory! The King escaped to safety!');
    } else {
        updateStatus('💀 Defeat! The King was captured!');
    }
}

// New game
function newGame() {
    gameState.currentPlayer = 'defender';
    gameState.selectedPiece = null;
    gameState.validMoves = [];
    gameState.gameActive = true;
    initBoard();
    updateDisplay();
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
