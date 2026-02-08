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
    
    // Check multiplayer mode
    const urlParams = new URLSearchParams(window.location.search);
    const isMultiplayer = urlParams.get('multiplayer') === 'true';
    const myPlayer = urlParams.get('color'); // '0' or '1'
    
    // In multiplayer, only allow moves on your turn
    if (isMultiplayer && gameState.currentPlayer !== parseInt(myPlayer)) {
        return;
    }
    
    let seeds = gameState.pits[player][pitIndex];
    gameState.pits[player][pitIndex] = 0;

    let currentPlayer = player;
    let currentPit = pitIndex + 1;
    let lastLandedInStore = false;

    while (seeds > 0) {
        if (currentPit < 6) {
            gameState.pits[currentPlayer][currentPit]++;
            seeds--;
            currentPit++;
        } else if (currentPit === 6 && currentPlayer === player) {
            gameState.stores[currentPlayer]++;
            seeds--;
            lastLandedInStore = seeds === 0;
            currentPit = 0;
            currentPlayer = currentPlayer === 0 ? 1 : 0;
        } else {
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
    
    // Send move in multiplayer mode
    const urlParams = new URLSearchParams(window.location.search);
    const isMultiplayer = urlParams.get('multiplayer') === 'true';
    if (isMultiplayer && window.sendMove && window.currentGame) {
        const game = window.currentGame();
        if (game && game.game_id) {
            window.sendMove(game.game_id, JSON.stringify({player, pitIndex}));
        }
    }
    
    // Switch player (except when last seed landed in own store - extra turn)
    if (!lastLandedInStore) {
        gameState.currentPlayer = gameState.currentPlayer === 0 ? 1 : 0;
    }

    // Check if current player has no seeds (game over - opponent captures remainder)
    const nextPits = gameState.pits[gameState.currentPlayer];
    if (nextPits.every((n) => n === 0)) {
        const opponent = gameState.currentPlayer === 0 ? 1 : 0;
        gameState.stores[opponent] += gameState.pits[opponent].reduce((a, b) => a + b, 0);
        gameState.pits[opponent] = [0, 0, 0, 0, 0, 0];
        endGame();
        return;
    }

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
    if (!boardEl) {
        console.error('Mancala board element not found!');
        return;
    }
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
    const el = document.getElementById('status');
    if (el) el.textContent = message;
}

// End game
function endGame() {
    gameState.gameActive = false;
    const s0 = gameState.stores[0];
    const s1 = gameState.stores[1];
    const msg =
        s0 > s1
            ? `Player 1 wins! Final score - Player 1: ${s0}, Player 2: ${s1}`
            : s1 > s0
                ? `Player 2 wins! Final score - Player 1: ${s0}, Player 2: ${s1}`
                : `Tie! Final score - Player 1: ${s0}, Player 2: ${s1}`;
    updateStatus(msg);
    renderBoard();
}

// New game
window.newGame = function newGame() {
    gameState.pits = Array(2).fill(null).map(() => Array(6).fill(4));
    gameState.stores = [0, 0];
    gameState.currentPlayer = 0;
    gameState.gameActive = true;
    updateDisplay();
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    try {
        newGame();
    } catch (e) {
        console.error('Mancala init error:', e);
        const el = document.getElementById('status');
        if (el) el.textContent = 'Failed to load. Refresh the page.';
    }
});
