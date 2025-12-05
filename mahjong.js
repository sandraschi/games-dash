// Mahjong Game Logic
// Simplified Japanese Mahjong for 4 players

// Tile definitions
const TILE_TYPES = {
    MANZU: 'm',  // Characters (萬子)
    SOUZU: 's',  // Bamboo (索子)
    PINZU: 'p',  // Circles (筒子)
    WIND: 'w',   // Winds (東南西北)
    DRAGON: 'd'  // Dragons (白發中)
};

// Tile symbols (Unicode)
const TILE_SYMBOLS = {
    // Characters (1-9)
    '1m': '🀇', '2m': '🀈', '3m': '🀉', '4m': '🀊', '5m': '🀋',
    '6m': '🀌', '7m': '🀍', '8m': '🀎', '9m': '🀏',
    // Bamboo (1-9)
    '1s': '🀐', '2s': '🀑', '3s': '🀒', '4s': '🀓', '5s': '🀔',
    '6s': '🀕', '7s': '🀖', '8s': '🀗', '9s': '🀘',
    // Circles (1-9)
    '1p': '🀙', '2p': '🀚', '3p': '🀛', '4p': '🀜', '5p': '🀝',
    '6p': '🀞', '7p': '🀟', '8p': '🀠', '9p': '🀡',
    // Winds
    '1w': '🀀', // East
    '2w': '🀁', // South
    '3w': '🀂', // West
    '4w': '🀃', // North
    // Dragons
    '1d': '🀄', // White
    '2d': '🀅', // Green
    '3d': '🀆'  // Red
};

// Game state
let gameState = {
    players: [
        { name: 'You', hand: [], isHuman: true, position: 'bottom' },
        { name: 'Player 2', hand: [], isHuman: false, position: 'top' },
        { name: 'Player 3', hand: [], isHuman: false, position: 'right' },
        { name: 'Player 4', hand: [], isHuman: false, position: 'left' }
    ],
    wall: [],
    discardPile: [],
    currentPlayer: 0,
    selectedTile: null,
    gameActive: false,
    wallStartCount: 136
};

// Initialize game
function newGame() {
    // Create full tile set (136 tiles: 4 of each)
    const fullSet = [];
    
    // Add number tiles (1-9 of each suit, 4 copies each)
    ['m', 's', 'p'].forEach(suit => {
        for (let num = 1; num <= 9; num++) {
            for (let i = 0; i < 4; i++) {
                fullSet.push(`${num}${suit}`);
            }
        }
    });
    
    // Add winds (4 of each)
    for (let num = 1; num <= 4; num++) {
        for (let i = 0; i < 4; i++) {
            fullSet.push(`${num}w`);
        }
    }
    
    // Add dragons (4 of each)
    for (let num = 1; num <= 3; num++) {
        for (let i = 0; i < 4; i++) {
            fullSet.push(`${num}d`);
        }
    }
    
    // Shuffle tiles
    shuffleArray(fullSet);
    
    // Deal initial hands (13 tiles each)
    gameState.players.forEach((player, index) => {
        player.hand = fullSet.splice(0, 13);
        player.hand.sort(sortTiles);
    });
    
    // Remaining tiles become the wall
    gameState.wall = fullSet;
    gameState.discardPile = [];
    gameState.currentPlayer = 0;
    gameState.selectedTile = null;
    gameState.gameActive = true;
    
    updateDisplay();
    updateStatus(`Game started! ${gameState.players[0].name}'s turn. Click "Draw Tile" to begin.`);
    
    // Enable draw button for human player
    document.getElementById('draw-btn').disabled = false;
    document.getElementById('discard-btn').disabled = true;
}

// Shuffle array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Sort tiles for display
function sortTiles(a, b) {
    const order = ['m', 's', 'p', 'w', 'd'];
    const aSuit = a.slice(-1);
    const bSuit = b.slice(-1);
    const aNum = parseInt(a.slice(0, -1));
    const bNum = parseInt(b.slice(0, -1));
    
    const aSuitIndex = order.indexOf(aSuit);
    const bSuitIndex = order.indexOf(bSuit);
    
    if (aSuitIndex !== bSuitIndex) {
        return aSuitIndex - bSuitIndex;
    }
    return aNum - bNum;
}

// Draw a tile from the wall
function drawTile() {
    if (!gameState.gameActive) return;
    
    const player = gameState.players[gameState.currentPlayer];
    
    // Only human player can manually draw
    if (!player.isHuman) {
        return;
    }
    
    if (gameState.wall.length === 0) {
        updateStatus('Wall is empty! Game ends in a draw.');
        gameState.gameActive = false;
        return;
    }
    
    const drawnTile = gameState.wall.pop();
    player.hand.push(drawnTile);
    player.hand.sort(sortTiles);
    
    updateDisplay();
    
    updateStatus(`You drew a tile. Select a tile to discard.`);
    document.getElementById('draw-btn').disabled = true;
    document.getElementById('discard-btn').disabled = false;
}

// Discard selected tile
function discardSelected() {
    if (!gameState.selectedTile) {
        updateStatus('Please select a tile to discard.');
        return;
    }
    
    const player = gameState.players[gameState.currentPlayer];
    const tileIndex = player.hand.indexOf(gameState.selectedTile);
    
    if (tileIndex === -1) return;
    
    // Remove from hand
    player.hand.splice(tileIndex, 1);
    
    // Add to discard pile
    gameState.discardPile.push(gameState.selectedTile);
    
    // Check for win
    if (checkWin(player.hand)) {
        endGame(player.name);
        return;
    }
    
    gameState.selectedTile = null;
    
    // Next player
    gameState.currentPlayer = (gameState.currentPlayer + 1) % 4;
    
    updateDisplay();
    updateStatus(`${gameState.players[gameState.currentPlayer].name}'s turn.`);
    
    document.getElementById('draw-btn').disabled = false;
    document.getElementById('discard-btn').disabled = true;
    
    // Auto-draw for next player
    if (gameState.currentPlayer !== 0) {
        setTimeout(() => drawTile(), 500);
    }
}

// AI turn
function aiTurn() {
    const player = gameState.players[gameState.currentPlayer];
    
    // Draw tile
    if (gameState.wall.length === 0) {
        updateStatus('Wall is empty! Game ends in a draw.');
        gameState.gameActive = false;
        return;
    }
    
    const drawnTile = gameState.wall.pop();
    player.hand.push(drawnTile);
    player.hand.sort(sortTiles);
    
    updateDisplay();
    
    // AI discards after a short delay
    setTimeout(() => aiDiscard(), 1000);
}

// AI discard logic (simple: discard random tile)
function aiDiscard() {
    const player = gameState.players[gameState.currentPlayer];
    
    if (player.hand.length === 0) return;
    
    // Simple AI: discard a random tile (can be improved with strategy)
    const discardIndex = Math.floor(Math.random() * player.hand.length);
    const discardedTile = player.hand.splice(discardIndex, 1)[0];
    
    gameState.discardPile.push(discardedTile);
    
    // Check for win
    if (checkWin(player.hand)) {
        endGame(player.name);
        return;
    }
    
    // Next player
    gameState.currentPlayer = (gameState.currentPlayer + 1) % 4;
    
    updateDisplay();
    updateStatus(`${gameState.players[gameState.currentPlayer].name}'s turn.`);
    
    // Auto-draw for next player (AI)
    if (gameState.currentPlayer !== 0) {
        setTimeout(() => aiTurn(), 500);
    } else {
        // Human player's turn
        document.getElementById('draw-btn').disabled = false;
        updateStatus(`Your turn. Click "Draw Tile" to draw.`);
    }
}

// Check if hand is a winning hand (simplified: 4 sets + 1 pair)
function checkWin(hand) {
    if (hand.length !== 14) return false; // Need 14 tiles to win
    
    // Simplified win check: look for 4 sets (triplets or sequences) + 1 pair
    // This is a basic implementation - real Mahjong has more complex rules
    
    const handCopy = [...hand].sort(sortTiles);
    
    // Try to find a pair
    for (let i = 0; i < handCopy.length - 1; i++) {
        if (handCopy[i] === handCopy[i + 1]) {
            // Found a pair, check if rest can form 4 sets
            const remaining = [...handCopy];
            remaining.splice(i, 2);
            
            if (canFormSets(remaining, 4)) {
                return true;
            }
        }
    }
    
    return false;
}

// Check if tiles can form N sets (triplets or sequences)
function canFormSets(tiles, numSets) {
    if (numSets === 0) return tiles.length === 0;
    if (tiles.length < 3) return false;
    
    // Try to find a triplet
    for (let i = 0; i < tiles.length - 2; i++) {
        if (tiles[i] === tiles[i + 1] && tiles[i] === tiles[i + 2]) {
            const remaining = [...tiles];
            remaining.splice(i, 3);
            if (canFormSets(remaining, numSets - 1)) {
                return true;
            }
        }
    }
    
    // Try to find a sequence (only for number tiles)
    for (let i = 0; i < tiles.length - 2; i++) {
        const tile1 = tiles[i];
        const suit1 = tile1.slice(-1);
        const num1 = parseInt(tile1.slice(0, -1));
        
        // Sequences only work for number tiles (m, s, p)
        if (['m', 's', 'p'].includes(suit1)) {
            const tile2 = `${num1 + 1}${suit1}`;
            const tile3 = `${num1 + 2}${suit1}`;
            
            const index2 = tiles.indexOf(tile2, i + 1);
            const index3 = tiles.indexOf(tile3, index2 + 1);
            
            if (index2 !== -1 && index3 !== -1) {
                const remaining = [...tiles];
                remaining.splice(index3, 1);
                remaining.splice(index2, 1);
                remaining.splice(i, 1);
                if (canFormSets(remaining, numSets - 1)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Select tile (human player only)
function selectTile(tile) {
    if (!gameState.gameActive) return;
    if (gameState.currentPlayer !== 0) return; // Only human player
    
    const player = gameState.players[0];
    if (!player.hand.includes(tile)) return;
    
    gameState.selectedTile = tile;
    updateDisplay();
}

// Update display
function updateDisplay() {
    // Update each player's hand
    gameState.players.forEach((player, index) => {
        const position = player.position;
        const containerId = `tiles-${position}`;
        const container = document.getElementById(containerId);
        const countId = `count-${position}`;
        
        if (!container) return;
        
        container.innerHTML = '';
        
        player.hand.forEach(tile => {
            const tileEl = document.createElement('div');
            tileEl.className = 'tile';
            
            if (player.isHuman) {
                tileEl.textContent = TILE_SYMBOLS[tile] || '?';
                tileEl.onclick = () => selectTile(tile);
                
                if (gameState.selectedTile === tile) {
                    tileEl.classList.add('selected');
                }
            } else {
                // Show tile backs for AI players
                tileEl.className = 'tile tile-back';
            }
            
            container.appendChild(tileEl);
        });
        
        // Update count
        const countEl = document.getElementById(countId);
        if (countEl) {
            countEl.textContent = player.hand.length;
        }
    });
    
    // Update discard pile
    const discardContainer = document.getElementById('discard-pile');
    if (discardContainer) {
        discardContainer.innerHTML = '';
        
        // Show last 20 discarded tiles
        const recentDiscards = gameState.discardPile.slice(-20);
        recentDiscards.forEach(tile => {
            const tileEl = document.createElement('div');
            tileEl.className = 'tile discarded';
            tileEl.textContent = TILE_SYMBOLS[tile] || '?';
            discardContainer.appendChild(tileEl);
        });
    }
    
    // Update wall count
    const wallCountEl = document.getElementById('wall-count');
    if (wallCountEl) {
        wallCountEl.textContent = gameState.wall.length;
    }
    
    // Update active player highlight
    gameState.players.forEach((player, index) => {
        const areaEl = document.getElementById(`player-${player.position}`);
        if (areaEl) {
            if (index === gameState.currentPlayer) {
                areaEl.classList.add('active');
            } else {
                areaEl.classList.remove('active');
            }
        }
    });
}

// Update status message
function updateStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// End game
function endGame(winner) {
    gameState.gameActive = false;
    updateStatus(`🎉 ${winner} wins! 🎉`);
    
    // Show win message
    const winMsg = document.createElement('div');
    winMsg.className = 'win-message';
    winMsg.innerHTML = `
        <h2>🎉 ${winner} Wins! 🎉</h2>
        <p>Congratulations!</p>
        <button class="btn" onclick="location.reload()">Play Again</button>
    `;
    document.body.appendChild(winMsg);
    
    document.getElementById('draw-btn').disabled = true;
    document.getElementById('discard-btn').disabled = true;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
