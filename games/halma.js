// Halma Game Logic
// **Timestamp**: 2025-12-10

const BOARD_SIZE = 16;
let board = [];
let currentPlayer = 0; // 0=red, 1=blue, 2=green, 3=yellow
let selectedPiece = null;
let validMoves = [];
let aiEnabled = false;
let gameActive = false;

const PLAYERS = [
    { name: 'Red', color: 'red', startZone: 'top-left', endZone: 'bottom-right' },
    { name: 'Blue', color: 'blue', startZone: 'top-right', endZone: 'bottom-left' },
    { name: 'Green', color: 'green', startZone: 'bottom-right', endZone: 'top-left' },
    { name: 'Yellow', color: 'yellow', startZone: 'bottom-left', endZone: 'top-right' }
];

// Start zones (corners) - 19 pieces each
const START_ZONES = {
    'top-left': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,1],[2,2],[2,3],[3,0],[3,1],[3,2],[4,0],[4,1]],
    'top-right': [[0,11],[0,12],[0,13],[0,14],[0,15],[1,11],[1,12],[1,13],[1,14],[1,15],[2,11],[2,12],[2,13],[2,14],[3,11],[3,12],[3,13],[4,11],[4,12]],
    'bottom-right': [[11,11],[11,12],[11,13],[11,14],[11,15],[12,11],[12,12],[12,13],[12,14],[12,15],[13,11],[13,12],[13,13],[13,14],[14,11],[14,12],[14,13],[15,11],[15,12]],
    'bottom-left': [[11,0],[11,1],[11,2],[11,3],[11,4],[12,0],[12,1],[12,2],[12,3],[12,4],[13,0],[13,1],[13,2],[13,3],[14,0],[14,1],[14,2],[15,0],[15,1]]
};

const END_ZONES = {
    'top-left': START_ZONES['bottom-right'],
    'top-right': START_ZONES['bottom-left'],
    'bottom-right': START_ZONES['top-left'],
    'bottom-left': START_ZONES['top-right']
};

function initBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    
    // Place pieces in start zones (2-player mode: red vs blue)
    const startZones = [
        START_ZONES['top-left'],    // Red
        START_ZONES['top-right']    // Blue
    ];
    
    startZones.forEach((zone, playerIndex) => {
        zone.forEach(([row, col]) => {
            board[row][col] = playerIndex;
        });
    });
    
    currentPlayer = 0;
    selectedPiece = null;
    validMoves = [];
    gameActive = true;
    renderBoard();
    updateStatus();
}

function getAdjacentMoves(row, col) {
    const moves = [];
    const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    
    directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && board[newRow][newCol] === null) {
            moves.push([newRow, newCol]);
        }
    });
    
    return moves;
}

function getJumpMoves(row, col, visited = new Set()) {
    const moves = [];
    const key = `${row},${col}`;
    if (visited.has(key)) return moves;
    visited.add(key);
    
    const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    
    directions.forEach(([dr, dc]) => {
        const jumpRow = row + dr * 2;
        const jumpCol = col + dc * 2;
        const middleRow = row + dr;
        const middleCol = col + dc;
        
        // Check if jump is valid (middle square has a piece, destination is empty)
        if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE &&
            board[middleRow][middleCol] !== null && board[jumpRow][jumpCol] === null) {
            moves.push([jumpRow, jumpCol]);
            // Recursive jumps
            const furtherJumps = getJumpMoves(jumpRow, jumpCol, visited);
            moves.push(...furtherJumps);
        }
    });
    
    return moves;
}

function getValidMoves(row, col) {
    if (board[row][col] !== currentPlayer) return [];
    
    const moves = [];
    
    // Adjacent moves
    moves.push(...getAdjacentMoves(row, col));
    
    // Jump moves (can chain)
    const jumpMoves = getJumpMoves(row, col);
    moves.push(...jumpMoves);
    
    // Remove duplicates
    const uniqueMoves = [];
    const seen = new Set();
    moves.forEach(([r, c]) => {
        const key = `${r},${c}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueMoves.push([r, c]);
        }
    });
    
    return uniqueMoves;
}

function checkWin() {
    const player = PLAYERS[currentPlayer];
    const endZone = END_ZONES[player.endZone];
    
    // Check if all pieces are in end zone
    let piecesInEndZone = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === currentPlayer) {
                if (endZone.some(([r, c]) => r === row && c === col)) {
                    piecesInEndZone++;
                }
            }
        }
    }
    
    return piecesInEndZone === 19;
}

function handleSquareClick(row, col) {
    if (!gameActive) return;
    
    // If piece is selected, try to move
    if (selectedPiece) {
        const [selRow, selCol] = selectedPiece;
        const isValid = validMoves.some(([r, c]) => r === row && c === col);
        
        if (isValid) {
            // Move piece
            board[row][col] = board[selRow][selCol];
            board[selRow][selCol] = null;
            
            // Check for win
            if (checkWin()) {
                gameActive = false;
                document.getElementById('status').textContent = `🎉 ${PLAYERS[currentPlayer].name} WINS! 🎉`;
                return;
            }
            
            // Next player
            currentPlayer = (currentPlayer + 1) % 2; // 2-player mode
            selectedPiece = null;
            validMoves = [];
            renderBoard();
            updateStatus();
            
            if (aiEnabled && currentPlayer === 1) {
                setTimeout(aiMove, 500);
            }
        } else {
            // Deselect or select new piece
            selectedPiece = null;
            validMoves = [];
            if (board[row][col] === currentPlayer) {
                selectedPiece = [row, col];
                validMoves = getValidMoves(row, col);
            }
            renderBoard();
        }
    } else {
        // Select piece
        if (board[row][col] === currentPlayer) {
            selectedPiece = [row, col];
            validMoves = getValidMoves(row, col);
            renderBoard();
        }
    }
}

function aiMove() {
    if (!gameActive || currentPlayer !== 1) return;
    
    // Find all pieces and their moves
    const allMoves = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === currentPlayer) {
                const moves = getValidMoves(row, col);
                moves.forEach(([r, c]) => {
                    allMoves.push({ from: [row, col], to: [r, c] });
                });
            }
        }
    }
    
    if (allMoves.length === 0) {
        // No moves available, skip turn
        currentPlayer = 0;
        updateStatus();
        return;
    }
    
    // Simple AI: prefer moves toward end zone
    const endZone = END_ZONES[PLAYERS[currentPlayer].endZone];
    const centerEnd = endZone.reduce((acc, [r, c]) => [acc[0] + r, acc[1] + c], [0, 0]);
    centerEnd[0] = Math.round(centerEnd[0] / endZone.length);
    centerEnd[1] = Math.round(centerEnd[1] / endZone.length);
    
    // Score moves by distance to end zone center
    allMoves.forEach(move => {
        const dist = Math.abs(move.to[0] - centerEnd[0]) + Math.abs(move.to[1] - centerEnd[1]);
        move.score = -dist; // Negative because we want to minimize distance
    });
    
    // Sort by score and pick best move
    allMoves.sort((a, b) => b.score - a.score);
    const bestMove = allMoves[0];
    
    // Execute move
    board[bestMove.to[0]][bestMove.to[1]] = board[bestMove.from[0]][bestMove.from[1]];
    board[bestMove.from[0]][bestMove.from[1]] = null;
    
    // Check for win
    if (checkWin()) {
        gameActive = false;
        document.getElementById('status').textContent = `🎉 ${PLAYERS[currentPlayer].name} WINS! 🎉`;
        return;
    }
    
    // Next player
    currentPlayer = 0;
    renderBoard();
    updateStatus();
}

function renderBoard() {
    const boardEl = document.getElementById('halmaBoard');
    boardEl.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'halma-square';
            
            // Mark start/end zones
            if (START_ZONES['top-left'].some(([r, c]) => r === row && c === col)) {
                cell.classList.add('start-zone');
            }
            if (END_ZONES['top-left'].some(([r, c]) => r === row && c === col)) {
                cell.classList.add('end-zone');
            }
            
            // Highlight selected piece
            if (selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col) {
                cell.classList.add('selected');
            }
            
            // Highlight valid moves
            if (validMoves.some(([r, c]) => r === row && c === col)) {
                cell.classList.add('valid-move');
            }
            
            // Add piece if present
            if (board[row][col] !== null) {
                const piece = document.createElement('div');
                piece.className = `halma-piece ${PLAYERS[board[row][col]].color}`;
                cell.appendChild(piece);
            }
            
            cell.onclick = () => handleSquareClick(row, col);
            boardEl.appendChild(cell);
        }
    }
}

function updateStatus() {
    if (!gameActive) return;
    const player = PLAYERS[currentPlayer];
    document.getElementById('status').textContent = `${player.name}'s Turn${selectedPiece ? ' - Select destination' : ' - Select a piece'}`;
}

function newGame() {
    initBoard();
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    document.getElementById('aiToggle').textContent = aiEnabled ? '👤 Play vs Human' : '🤖 Play vs AI';
    
    if (aiEnabled && currentPlayer === 1) {
        setTimeout(aiMove, 500);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initBoard();
});

