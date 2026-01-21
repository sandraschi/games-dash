// Carcassonne (Simplified)

const TILE_TYPES = ['road', 'city', 'field', 'monastery'];
const TILE_EMOJIS = {
    'road': '🛤️',
    'city': '🏰',
    'field': '🌾',
    'monastery': '⛪'
};

// Game state
let gameState = {
    board: Array(5).fill(null).map(() => Array(5).fill(null)),
    currentTile: null,
    score: 0,
    tilesPlaced: 0,
    gameActive: true
};

// Initialize game
function newGame() {
    gameState.board = Array(5).fill(null).map(() => Array(5).fill(null));
    gameState.score = 0;
    gameState.tilesPlaced = 0;
    gameState.gameActive = true;
    
    // Start with center tile
    gameState.board[2][2] = 'city';
    
    drawNewTile();
    renderBoard();
    updateDisplay();
    updateStatus('Place the tile on the board!');
}

// Draw new tile
function drawNewTile() {
    const type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
    gameState.currentTile = type;
    
    const currentTileEl = document.getElementById('current-tile');
    currentTileEl.textContent = TILE_EMOJIS[type];
    currentTileEl.className = `current-tile ${type}`;
}

// Place tile
function placeTile() {
    if (!gameState.currentTile) return;
    
    // Find empty spot adjacent to placed tiles
    let placed = false;
    for (let row = 0; row < 5 && !placed; row++) {
        for (let col = 0; col < 5 && !placed; col++) {
            if (gameState.board[row][col] === null) {
                // Check if adjacent to placed tile
                const hasAdjacent = 
                    (row > 0 && gameState.board[row - 1][col] !== null) ||
                    (row < 4 && gameState.board[row + 1][col] !== null) ||
                    (col > 0 && gameState.board[row][col - 1] !== null) ||
                    (col < 4 && gameState.board[row][col + 1] !== null);
                
                if (hasAdjacent) {
                    gameState.board[row][col] = gameState.currentTile;
                    gameState.tilesPlaced++;
                    gameState.score += 5; // Points for placing
                    placed = true;
                }
            }
        }
    }
    
    if (placed) {
        renderBoard();
        updateDisplay();
        drawNewTile();
        updateStatus('Tile placed! Draw and place next tile.');
        
        if (gameState.tilesPlaced >= 20) {
            endGame();
        }
    } else {
        updateStatus('No valid placement! Try again.');
    }
}

// Place tile manually at specific position
function placeTileAt(row, col) {
    if (!gameState.currentTile || gameState.board[row][col] !== null) return;

    // Check if adjacent to placed tile (or center tile)
    const hasAdjacent =
        (row > 0 && gameState.board[row - 1][col] !== null) ||
        (row < 4 && gameState.board[row + 1][col] !== null) ||
        (col > 0 && gameState.board[row][col - 1] !== null) ||
        (col < 4 && gameState.board[row][col + 1] !== null);

    if (hasAdjacent || (row === 2 && col === 2)) { // Allow center placement
        gameState.board[row][col] = gameState.currentTile;
        gameState.tilesPlaced++;
        gameState.score += 10; // More points for manual placement

        renderBoard();
        updateDisplay();
        drawNewTile();
        updateStatus('Tile placed! Draw and place next tile.');

        if (gameState.tilesPlaced >= 20) {
            endGame();
        }
    } else {
        updateStatus('Must place adjacent to existing tiles!');
    }
}

// Render board
function renderBoard() {
    const gridEl = document.getElementById('tile-grid');
    gridEl.innerHTML = '';

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const tile = gameState.board[row][col];
            const cell = document.createElement('div');
            cell.className = 'tile';

            if (tile) {
                cell.classList.add(tile);
                cell.classList.add('placed');
                // Keep emoji for now but style will override with graphics
                cell.textContent = TILE_EMOJIS[tile];
            } else {
                cell.classList.add('empty');
            }

            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.onclick = () => placeTileAt(row, col);

            gridEl.appendChild(cell);
        }
    }
}

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame() {
    gameState.gameActive = false;
    updateStatus(`🎉 Game Over! Final Score: ${gameState.score} points!`);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
