// Battleship Game Logic

// Ship sizes
const SHIPS = [
    { name: 'Carrier', size: 5 },
    { name: 'Battleship', size: 4 },
    { name: 'Cruiser', size: 3 },
    { name: 'Submarine', size: 3 },
    { name: 'Destroyer', size: 2 }
];

// Game state
let gameState = {
    playerBoard: Array(10).fill(null).map(() => Array(10).fill(null)),
    enemyBoard: Array(10).fill(null).map(() => Array(10).fill(null)),
    playerShips: [],
    enemyShips: [],
    currentPlayer: 'player',
    gameActive: false,
    placingShips: true,
    shipsPlaced: 0
};

// Initialize boards
function initBoards() {
    const playerBoard = document.getElementById('player-board');
    const enemyBoard = document.getElementById('enemy-board');
    
    playerBoard.innerHTML = '';
    enemyBoard.innerHTML = '';
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            // Player board
            const cell1 = document.createElement('div');
            cell1.className = 'cell';
            cell1.dataset.row = row;
            cell1.dataset.col = col;
            cell1.onclick = () => handlePlayerCellClick(row, col);
            playerBoard.appendChild(cell1);
            
            // Enemy board
            const cell2 = document.createElement('div');
            cell2.className = 'cell';
            cell2.dataset.row = row;
            cell2.dataset.col = col;
            cell2.onclick = () => handleEnemyCellClick(row, col);
            enemyBoard.appendChild(cell2);
        }
    }
}

// Auto-place ships
function autoPlaceShips() {
    gameState.playerShips = [];
    gameState.enemyShips = [];
    
    // Place player ships
    placeShipsRandomly(gameState.playerBoard, gameState.playerShips);
    
    // Place enemy ships
    placeShipsRandomly(gameState.enemyBoard, gameState.enemyShips);
    
    updateDisplay();
    gameState.placingShips = false;
    gameState.shipsPlaced = SHIPS.length;
    
    document.getElementById('place-ships-btn').style.display = 'none';
    document.getElementById('start-btn').style.display = 'inline-block';
    updateStatus('Ships placed! Click "Start Game" to begin.');
}

// Place ships randomly
function placeShipsRandomly(board, ships) {
    const boardCopy = Array(10).fill(null).map(() => Array(10).fill(null));
    
    SHIPS.forEach(ship => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const horizontal = Math.random() > 0.5;
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            
            if (canPlaceShip(boardCopy, row, col, ship.size, horizontal)) {
                const shipCells = [];
                for (let i = 0; i < ship.size; i++) {
                    const r = horizontal ? row : row + i;
                    const c = horizontal ? col + i : col;
                    boardCopy[r][c] = ship.name;
                    shipCells.push({ row: r, col: c });
                }
                ships.push({ name: ship.name, cells: shipCells, hits: 0 });
                placed = true;
            }
            attempts++;
        }
    });
    
    // Copy to actual board
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            board[row][col] = boardCopy[row][col];
        }
    }
}

// Check if ship can be placed
function canPlaceShip(board, row, col, size, horizontal) {
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        
        if (r >= 10 || c >= 10) return false;
        if (board[r][c] !== null) return false;
        
        // Check adjacent cells
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && board[nr][nc] !== null) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Handle player cell click (during placement)
function handlePlayerCellClick(row, col) {
    if (!gameState.placingShips) return;
    // Manual placement not implemented - use auto-place
}

// Handle enemy cell click (attack)
function handleEnemyCellClick(row, col) {
    if (!gameState.gameActive || gameState.currentPlayer !== 'player') return;
    
    const cell = gameState.enemyBoard[row][col];
    if (cell === 'hit' || cell === 'miss') return; // Already attacked
    
    if (cell !== null) {
        // Hit!
        gameState.enemyBoard[row][col] = 'hit';
        updateStatus('🎯 Hit!');
        
        // Check if ship is sunk
        const ship = gameState.enemyShips.find(s => 
            s.cells.some(c => c.row === row && c.col === col)
        );
        if (ship) {
            ship.hits++;
            if (ship.hits === ship.cells.length) {
                updateStatus(`💥 ${ship.name} sunk!`);
            }
        }
        
        // Check win
        if (gameState.enemyShips.every(s => s.hits === s.cells.length)) {
            endGame('player');
            return;
        }
    } else {
        // Miss
        gameState.enemyBoard[row][col] = 'miss';
        updateStatus('💨 Miss! AI turn...');
        gameState.currentPlayer = 'ai';
        setTimeout(() => aiTurn(), 1000);
    }
    
    updateDisplay();
}

// AI turn
function aiTurn() {
    if (!gameState.gameActive || gameState.currentPlayer !== 'ai') return;
    
    // Simple AI: random shot
    let row, col;
    do {
        row = Math.floor(Math.random() * 10);
        col = Math.floor(Math.random() * 10);
    } while (gameState.playerBoard[row][col] === 'hit' || gameState.playerBoard[row][col] === 'miss');
    
    const cell = gameState.playerBoard[row][col];
    
    if (cell !== null && cell !== 'hit' && cell !== 'miss') {
        // Hit!
        gameState.playerBoard[row][col] = 'hit';
        updateStatus('💥 AI hit your ship!');
        
        // Check if ship is sunk
        const ship = gameState.playerShips.find(s => 
            s.cells.some(c => c.row === row && c.col === col)
        );
        if (ship) {
            ship.hits++;
            if (ship.hits === ship.cells.length) {
                updateStatus(`💥 AI sunk your ${ship.name}!`);
            }
        }
        
        // Check loss
        if (gameState.playerShips.every(s => s.hits === s.cells.length)) {
            endGame('ai');
            return;
        }
        
        // AI gets another turn
        setTimeout(() => aiTurn(), 1000);
    } else {
        // Miss
        gameState.playerBoard[row][col] = 'miss';
        updateStatus('💨 AI missed! Your turn.');
        gameState.currentPlayer = 'player';
    }
    
    updateDisplay();
}

// Update display
function updateDisplay() {
    // Update player board
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.querySelector(`#player-board .cell[data-row="${row}"][data-col="${col}"]`);
            const value = gameState.playerBoard[row][col];
            
            cell.className = 'cell';
            if (value === 'hit') {
                cell.classList.add('hit');
                cell.textContent = '✕';
            } else if (value === 'miss') {
                cell.classList.add('miss');
                cell.textContent = '○';
            } else if (value !== null && !gameState.gameActive) {
                cell.classList.add('own-ship');
            } else if (value !== null) {
                cell.classList.add('ship');
            }
        }
    }
    
    // Update enemy board
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.querySelector(`#enemy-board .cell[data-row="${row}"][data-col="${col}"]`);
            const value = gameState.enemyBoard[row][col];
            
            cell.className = 'cell';
            if (value === 'hit') {
                cell.classList.add('hit');
                cell.textContent = '✕';
            } else if (value === 'miss') {
                cell.classList.add('miss');
                cell.textContent = '○';
            }
        }
    }
}

// Start game
function startGame() {
    gameState.gameActive = true;
    gameState.currentPlayer = 'player';
    document.getElementById('start-btn').style.display = 'none';
    updateStatus('Game started! Click on enemy board to attack.');
}

// End game
function endGame(winner) {
    gameState.gameActive = false;
    if (winner === 'player') {
        updateStatus('🎉 You win! All enemy ships destroyed!');
    } else {
        updateStatus('💀 You lose! All your ships were sunk!');
    }
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// New game
function newGame() {
    gameState.playerBoard = Array(10).fill(null).map(() => Array(10).fill(null));
    gameState.enemyBoard = Array(10).fill(null).map(() => Array(10).fill(null));
    gameState.playerShips = [];
    gameState.enemyShips = [];
    gameState.currentPlayer = 'player';
    gameState.gameActive = false;
    gameState.placingShips = true;
    gameState.shipsPlaced = 0;
    
    initBoards();
    document.getElementById('place-ships-btn').style.display = 'inline-block';
    document.getElementById('start-btn').style.display = 'none';
    updateStatus('Place your ships! Click "Auto-Place Ships" to begin.');
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initBoards();
    newGame();
});
