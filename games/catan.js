// Settlers of Catan - Hexagonal Board with Multiplayer

const RESOURCE_TYPES = ['wood', 'brick', 'sheep', 'wheat', 'ore', 'desert'];

// Classic Catan board layout: 3-4-5-4-3 hex pattern
// Each hex has: type, number token (2-12, except 7), and position
const HEX_LAYOUT = [
    // Row 1 (3 hexes)
    { type: 'wood', number: 4, row: 0, col: 2 },
    { type: 'brick', number: 11, row: 0, col: 3 },
    { type: 'sheep', number: 12, row: 0, col: 4 },
    
    // Row 2 (4 hexes)
    { type: 'wheat', number: 5, row: 1, col: 1 },
    { type: 'ore', number: 6, row: 1, col: 2 },
    { type: 'wood', number: 8, row: 1, col: 3 },
    { type: 'brick', number: 9, row: 1, col: 4 },
    
    // Row 3 (5 hexes) - middle row
    { type: 'sheep', number: 3, row: 2, col: 0 },
    { type: 'wheat', number: 10, row: 2, col: 1 },
    { type: 'desert', number: null, row: 2, col: 2 }, // Desert has no number
    { type: 'ore', number: 2, row: 2, col: 3 },
    { type: 'wood', number: 5, row: 2, col: 4 },
    
    // Row 4 (4 hexes)
    { type: 'brick', number: 9, row: 3, col: 1 },
    { type: 'sheep', number: 10, row: 3, col: 2 },
    { type: 'wheat', number: 11, row: 3, col: 3 },
    { type: 'ore', number: 4, row: 3, col: 4 },
    
    // Row 5 (3 hexes)
    { type: 'wood', number: 6, row: 4, col: 2 },
    { type: 'sheep', number: 8, row: 4, col: 3 },
    { type: 'brick', number: 3, row: 4, col: 4 }
];

// Game state
let gameState = {
    players: [
        { name: 'You', resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }, settlements: [], roads: [], cities: [], victoryPoints: 0, isHuman: true },
        { name: 'AI 1', resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }, settlements: [], roads: [], cities: [], victoryPoints: 0, isHuman: false },
        { name: 'AI 2', resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }, settlements: [], roads: [], cities: [], victoryPoints: 0, isHuman: false },
        { name: 'AI 3', resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }, settlements: [], roads: [], cities: [], victoryPoints: 0, isHuman: false }
    ],
    numPlayers: 4, // Can be 3 or 4
    currentPlayer: 0,
    gameActive: true,
    diceRoll: null
};

// Initialize game
function newGame() {
    // Reset all players
    gameState.players.forEach(player => {
        player.resources = { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
        player.settlements = [];
        player.roads = [];
        player.cities = [];
        player.victoryPoints = 0;
    });
    
    gameState.currentPlayer = 0;
    gameState.gameActive = true;
    gameState.diceRoll = null;
    
    renderBoard();
    updateDisplay();
    updateStatus('Your turn! Roll the dice.');
}

// Render hexagonal board
function renderBoard() {
    const hexGrid = document.getElementById('hex-grid');
    if (!hexGrid) {
        console.error('hex-grid element not found!');
        return;
    }
    
    hexGrid.innerHTML = '';
    hexGrid.style.display = 'flex';
    hexGrid.style.flexDirection = 'column';
    hexGrid.style.alignItems = 'center';
    hexGrid.style.gap = '0';
    hexGrid.style.width = '100%';
    hexGrid.style.maxWidth = '800px';
    hexGrid.style.margin = '20px auto';
    
    // Group hexes by row
    const rows = {};
    HEX_LAYOUT.forEach(hex => {
        if (!rows[hex.row]) rows[hex.row] = [];
        rows[hex.row].push(hex);
    });
    
    // Render each row
    Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b)).forEach(rowKey => {
        const row = document.createElement('div');
        row.className = 'hex-row';
        row.style.display = 'flex';
        row.style.gap = '2px';
        row.style.marginBottom = '-25px'; // Overlap hexes slightly
        
        rows[rowKey].forEach(hexData => {
            const hex = createHexElement(hexData);
            row.appendChild(hex);
        });
        
        hexGrid.appendChild(row);
    });
}

// Create a single hex element
function createHexElement(hexData) {
    const hex = document.createElement('div');
    hex.className = `hex ${hexData.type}`;
    hex.dataset.type = hexData.type;
    hex.dataset.number = hexData.number || '';
    hex.dataset.row = hexData.row;
    hex.dataset.col = hexData.col;
    
    // Hexagonal shape using clip-path
    hex.style.width = '100px';
    hex.style.height = '115px';
    hex.style.position = 'relative';
    hex.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
    hex.style.display = 'flex';
    hex.style.flexDirection = 'column';
    hex.style.alignItems = 'center';
    hex.style.justifyContent = 'center';
    hex.style.cursor = 'pointer';
    hex.style.transition = 'all 0.3s';
    hex.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    hex.style.boxSizing = 'border-box';
    
    // Resource colors
    const colors = {
        'wood': '#2E7D32',
        'brick': '#D32F2F',
        'sheep': '#66BB6A',
        'wheat': '#FBC02D',
        'ore': '#424242',
        'desert': '#D7CCC8'
    };
    hex.style.background = colors[hexData.type] || '#666';
    
    // Add number token (if not desert)
    if (hexData.number !== null) {
        const numberToken = document.createElement('div');
        numberToken.className = 'number-token';
        numberToken.textContent = hexData.number;
        numberToken.style.position = 'absolute';
        numberToken.style.top = '50%';
        numberToken.style.left = '50%';
        numberToken.style.transform = 'translate(-50%, -50%)';
        numberToken.style.width = '30px';
        numberToken.style.height = '30px';
        numberToken.style.borderRadius = '50%';
        numberToken.style.background = '#fff';
        numberToken.style.color = '#000';
        numberToken.style.fontWeight = 'bold';
        numberToken.style.fontSize = '14px';
        numberToken.style.display = 'flex';
        numberToken.style.alignItems = 'center';
        numberToken.style.justifyContent = 'center';
        numberToken.style.border = '2px solid #000';
        numberToken.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        hex.appendChild(numberToken);
        
        // Color code number tokens (red for 6 and 8)
        if (hexData.number === 6 || hexData.number === 8) {
            numberToken.style.background = '#e74c3c';
            numberToken.style.color = '#fff';
        }
    } else {
        // Desert tile - add icon
        const desertIcon = document.createElement('div');
        desertIcon.textContent = '🏜️';
        desertIcon.style.fontSize = '30px';
        hex.appendChild(desertIcon);
    }
    
    // Hover effect
    hex.addEventListener('mouseenter', () => {
        hex.style.transform = 'scale(1.1)';
        hex.style.zIndex = '10';
        hex.style.boxShadow = '0 4px 8px rgba(255, 215, 0, 0.5)';
    });
    
    hex.addEventListener('mouseleave', () => {
        hex.style.transform = 'scale(1)';
        hex.style.zIndex = '1';
        hex.style.boxShadow = 'none';
    });
    
    return hex;
}

// Roll dice
function rollDice() {
    if (!gameState.gameActive) return;
    
    const player = gameState.players[gameState.currentPlayer];
    
    if (!player.isHuman) {
        aiTurn();
        return;
    }
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    gameState.diceRoll = total;
    
    if (total === 7) {
        // Robber - move to desert (simplified)
        updateStatus(`Rolled 7! Robber activated. (In full game, players discard if holding >7 cards)`);
        nextTurn();
        return;
    }
    
    // Collect resources from hexes with matching number for all players
    HEX_LAYOUT.forEach(hexData => {
        if (hexData.number === total && hexData.type !== 'desert') {
            // Check which players have settlements/cities on this hex
            // Simplified: assume all players get resources (in real game, need to track settlement positions)
            gameState.players.forEach(p => {
                // Give resources based on settlements/cities (simplified)
                if (p.settlements.length > 0 || p.cities.length > 0) {
                    p.resources[hexData.type] = (p.resources[hexData.type] || 0) + 1;
                }
            });
        }
    });
    
    updateDisplay();
    updateStatus(`Rolled ${total}! Resources distributed.`);
    
    // Auto-advance if not human player
    if (!player.isHuman) {
        setTimeout(() => nextTurn(), 1000);
    }
}

// Build settlement
function buildSettlement() {
    const player = gameState.players[gameState.currentPlayer];
    
    if (!player.isHuman) {
        updateStatus('Not your turn!');
        return;
    }
    
    if (player.resources.wood >= 1 && 
        player.resources.brick >= 1 && 
        player.resources.sheep >= 1 && 
        player.resources.wheat >= 1) {
        
        player.resources.wood--;
        player.resources.brick--;
        player.resources.sheep--;
        player.resources.wheat--;
        player.settlements.push({ id: player.settlements.length });
        player.victoryPoints++;
        
        updateDisplay();
        updateStatus('Settlement built! +1 Victory Point!');
        
        checkWinCondition();
    } else {
        updateStatus('Not enough resources! Need: 1 Wood, 1 Brick, 1 Sheep, 1 Wheat');
    }
}

// Build road
function buildRoad() {
    const player = gameState.players[gameState.currentPlayer];
    
    if (!player.isHuman) {
        updateStatus('Not your turn!');
        return;
    }
    
    if (player.resources.wood >= 1 && player.resources.brick >= 1) {
        player.resources.wood--;
        player.resources.brick--;
        player.roads.push({ id: player.roads.length });
        updateDisplay();
        updateStatus('Road built!');
    } else {
        updateStatus('Not enough resources! Need: 1 Wood, 1 Brick');
    }
}

// Build city
function buildCity() {
    const player = gameState.players[gameState.currentPlayer];
    
    if (!player.isHuman) {
        updateStatus('Not your turn!');
        return;
    }
    
    if (player.resources.wheat >= 2 && player.resources.ore >= 3) {
        player.resources.wheat -= 2;
        player.resources.ore -= 3;
        player.cities.push({ id: player.cities.length });
        player.victoryPoints += 2; // Cities are worth 2 VP
        updateDisplay();
        updateStatus('City built! +2 Victory Points!');
        
        checkWinCondition();
    } else {
        updateStatus('Not enough resources! Need: 2 Wheat, 3 Ore');
    }
}

// AI turn
function aiTurn() {
    const player = gameState.players[gameState.currentPlayer];
    
    // Roll dice
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    gameState.diceRoll = total;
    
    if (total === 7) {
        updateStatus(`${player.name} rolled 7! Robber activated.`);
        setTimeout(() => nextTurn(), 1000);
        return;
    }
    
    // Collect resources (simplified)
    HEX_LAYOUT.forEach(hexData => {
        if (hexData.number === total && hexData.type !== 'desert') {
            gameState.players.forEach(p => {
                if (p.settlements.length > 0 || p.cities.length > 0) {
                    p.resources[hexData.type] = (p.resources[hexData.type] || 0) + 1;
                }
            });
        }
    });
    
    // AI decision making
    setTimeout(() => {
        // Try to build city (highest priority)
        if (player.resources.wheat >= 2 && player.resources.ore >= 3) {
            player.resources.wheat -= 2;
            player.resources.ore -= 3;
            player.cities.push({ id: player.cities.length });
            player.victoryPoints += 2;
            updateStatus(`${player.name} built a city! +2 VP`);
        }
        // Try to build settlement
        else if (player.resources.wood >= 1 && player.resources.brick >= 1 && 
                 player.resources.sheep >= 1 && player.resources.wheat >= 1) {
            player.resources.wood--;
            player.resources.brick--;
            player.resources.sheep--;
            player.resources.wheat--;
            player.settlements.push({ id: player.settlements.length });
            player.victoryPoints++;
            updateStatus(`${player.name} built a settlement! +1 VP`);
        }
        // Try to build road
        else if (player.resources.wood >= 1 && player.resources.brick >= 1) {
            player.resources.wood--;
            player.resources.brick--;
            player.roads.push({ id: player.roads.length });
            updateStatus(`${player.name} built a road.`);
        }
        
        updateDisplay();
        checkWinCondition();
        
        setTimeout(() => nextTurn(), 1000);
    }, 1000);
}

// Next turn
function nextTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.numPlayers;
    const player = gameState.players[gameState.currentPlayer];
    
    updateDisplay();
    
    if (player.isHuman) {
        updateStatus(`Your turn! Roll the dice.`);
    } else {
        updateStatus(`${player.name}'s turn...`);
        setTimeout(() => aiTurn(), 1000);
    }
}

// Check win condition
function checkWinCondition() {
    gameState.players.forEach(player => {
        if (player.victoryPoints >= 10) {
            endGame(player);
        }
    });
}

// Update display
function updateDisplay() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    // Update current player's resources (you)
    if (currentPlayer.isHuman) {
        const woodEl = document.getElementById('wood');
        const brickEl = document.getElementById('brick');
        const sheepEl = document.getElementById('sheep');
        const wheatEl = document.getElementById('wheat');
        const oreEl = document.getElementById('ore');
        const vpEl = document.getElementById('victory-points');
        
        if (woodEl) woodEl.textContent = currentPlayer.resources.wood;
        if (brickEl) brickEl.textContent = currentPlayer.resources.brick;
        if (sheepEl) sheepEl.textContent = currentPlayer.resources.sheep;
        if (wheatEl) wheatEl.textContent = currentPlayer.resources.wheat;
        if (oreEl) oreEl.textContent = currentPlayer.resources.ore;
        if (vpEl) vpEl.textContent = currentPlayer.victoryPoints;
    }
    
    // Update all players display
    gameState.players.forEach((player, index) => {
        const playerEl = document.getElementById(`player-${index}`);
        if (playerEl) {
            playerEl.innerHTML = `
                <h4 style="color: ${index === gameState.currentPlayer ? '#FFD700' : '#fff'}; margin: 0 0 5px 0;">
                    ${player.name} ${index === gameState.currentPlayer ? '(Current)' : ''}
                </h4>
                <p style="margin: 2px 0; font-size: 0.9em;">VP: ${player.victoryPoints}</p>
                <p style="margin: 2px 0; font-size: 0.8em; opacity: 0.8;">
                    Settlements: ${player.settlements.length} | Cities: ${player.cities.length} | Roads: ${player.roads.length}
                </p>
            `;
        }
    });
    
    // Update dice display
    const diceEl = document.getElementById('dice-display');
    if (diceEl && gameState.diceRoll) {
        diceEl.textContent = `Last Roll: ${gameState.diceRoll}`;
    }
}

// Update status
function updateStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// End game
function endGame(winner) {
    gameState.gameActive = false;
    updateStatus(`Game Over! ${winner.name} wins with ${winner.victoryPoints} Victory Points!`);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
