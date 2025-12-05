// Mancala (Oware) - African Strategy Game
// 2 rows of 6 pits, 2 stores (mancalas)

// Game state
let gameState = {
    pits: Array(2).fill(null).map(() => Array(6).fill(4)), // 4 seeds per pit
    stores: [0, 0], // Player stores
    currentPlayer: 0, // 0 or 1
    gameActive: true
};

// Sow seeds from a pit
function sowSeeds(player, pitIndex) {
    if (!gameState.gameActive || gameState.currentPlayer !== player) return;
    if (gameState.pits[player][pitIndex] === 0) return;
    
    let seeds = gameState.pits[player][pitIndex];
    gameState.pits[player][pitIndex] = 0;
    
    let currentPlayer = player;
    let currentPit = pitIndex + 1;
    
    while (seeds > 0) {
        // Move to next pit
        if (currentPit < 6) {
            // Same row
            gameState.pits[currentPlayer][currentPit]++;
            seeds--;
            currentPit++;
        } else if (currentPit === 6 && currentPlayer === player) {
            // Own store
            gameState.stores[currentPlayer]++;
            seeds--;
            currentPit = 0;
            currentPlayer = currentPlayer === 0 ? 1 : 0;
        } else {
            // Opponent's row
            currentPit = 0;
            currentPlayer = currentPlayer === 0 ? 1 : 0;
            gameState.pits[currentPlayer][currentPit]++;
            seeds--;
            currentPit++;
        }
    }
    
    // Check capture (simplified)
    const lastPit = currentPit - 1;
    if (currentPlayer !== player && lastPit >= 0 && lastPit < 6) {
        if (gameState.pits[currentPlayer][lastPit] === 2 || gameState.pits[currentPlayer][lastPit] === 3) {
            gameState.stores[player] += gameState.pits[currentPlayer][lastPit];
            gameState.pits[currentPlayer][lastPit] = 0;
        }
    }
    
    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 0 ? 1 : 0;
    
    // Check win
    const player1Total = gameState.pits[0].reduce((a, b) => a + b, 0) + gameState.stores[0];
    const player2Total = gameState.pits[1].reduce((a, b) => a + b, 0) + gameState.stores[1];
    
    if (player1Total >= 25 || player2Total >= 25) {
        endGame();
    }
    
    updateDisplay();
}

// Render board
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    
    // Player 2 store (top)
    const store2 = document.createElement('div');
    store2.className = 'store';
    store2.textContent = gameState.stores[1];
    boardEl.appendChild(store2);
    
    // Player 2 pits (top row)
    for (let i = 5; i >= 0; i--) {
        const pit = document.createElement('div');
        pit.className = 'pit';
        if (gameState.currentPlayer === 1) {
            pit.classList.add('player2');
        }
        if (gameState.pits[1][i] === 0) {
            pit.classList.add('empty');
        }
        pit.textContent = gameState.pits[1][i];
        pit.onclick = () => sowSeeds(1, i);
        boardEl.appendChild(pit);
    }
    
    // Player 1 store (bottom)
    const store1 = document.createElement('div');
    store1.className = 'store';
    store1.textContent = gameState.stores[0];
    boardEl.appendChild(store1);
    
    // Player 1 pits (bottom row)
    for (let i = 0; i < 6; i++) {
        const pit = document.createElement('div');
        pit.className = 'pit';
        if (gameState.currentPlayer === 0) {
            pit.classList.add('player1');
        }
        if (gameState.pits[0][i] === 0) {
            pit.classList.add('empty');
        }
        pit.textContent = gameState.pits[0][i];
        pit.onclick = () => sowSeeds(0, i);
        boardEl.appendChild(pit);
    }
}

// Update display
function updateDisplay() {
    renderBoard();
    updateStatus(`Player ${gameState.currentPlayer + 1}'s turn! Click a pit to sow seeds.`);
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame() {
    gameState.gameActive = false;
    const winner = gameState.stores[0] > gameState.stores[1] ? 1 : 2;
    updateStatus(`🎉 Player ${winner} wins! Final score - Player 1: ${gameState.stores[0]}, Player 2: ${gameState.stores[1]}`);
}

// New game
function newGame() {
    gameState.pits = Array(2).fill(null).map(() => Array(6).fill(4));
    gameState.stores = [0, 0];
    gameState.currentPlayer = 0;
    gameState.gameActive = true;
    updateDisplay();
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
