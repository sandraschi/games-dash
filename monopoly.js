// Monopoly Game Logic - Classic 40-Space Board

// All 40 spaces on the classic Monopoly board
const BOARD_SPACES = [
    { name: 'GO', type: 'corner', price: 0, rent: 0, color: 'special', position: 0 },
    { name: 'Mediterranean Ave', price: 60, rent: 2, color: 'brown', position: 1 },
    { name: 'Community Chest', type: 'special', price: 0, rent: 0, color: 'special', position: 2 },
    { name: 'Baltic Ave', price: 60, rent: 4, color: 'brown', position: 3 },
    { name: 'Income Tax', type: 'tax', price: 0, rent: 200, color: 'special', position: 4 },
    { name: 'Reading Railroad', type: 'railroad', price: 200, rent: 25, color: 'special', position: 5 },
    { name: 'Oriental Ave', price: 100, rent: 6, color: 'lightblue', position: 6 },
    { name: 'Chance', type: 'special', price: 0, rent: 0, color: 'special', position: 7 },
    { name: 'Vermont Ave', price: 100, rent: 6, color: 'lightblue', position: 8 },
    { name: 'Connecticut Ave', price: 120, rent: 8, color: 'lightblue', position: 9 },
    { name: 'Jail', type: 'corner', price: 0, rent: 0, color: 'special', position: 10 },
    { name: 'St. Charles Place', price: 140, rent: 10, color: 'pink', position: 11 },
    { name: 'Electric Company', type: 'utility', price: 150, rent: 0, color: 'special', position: 12 },
    { name: 'States Ave', price: 140, rent: 10, color: 'pink', position: 13 },
    { name: 'Virginia Ave', price: 160, rent: 12, color: 'pink', position: 14 },
    { name: 'Pennsylvania Railroad', type: 'railroad', price: 200, rent: 25, color: 'special', position: 15 },
    { name: 'St. James Place', price: 180, rent: 14, color: 'orange', position: 16 },
    { name: 'Community Chest', type: 'special', price: 0, rent: 0, color: 'special', position: 17 },
    { name: 'Tennessee Ave', price: 180, rent: 14, color: 'orange', position: 18 },
    { name: 'New York Ave', price: 200, rent: 16, color: 'orange', position: 19 },
    { name: 'Free Parking', type: 'corner', price: 0, rent: 0, color: 'special', position: 20 },
    { name: 'Kentucky Ave', price: 220, rent: 18, color: 'red', position: 21 },
    { name: 'Chance', type: 'special', price: 0, rent: 0, color: 'special', position: 22 },
    { name: 'Indiana Ave', price: 220, rent: 18, color: 'red', position: 23 },
    { name: 'Illinois Ave', price: 240, rent: 20, color: 'red', position: 24 },
    { name: 'B&O Railroad', type: 'railroad', price: 200, rent: 25, color: 'special', position: 25 },
    { name: 'Atlantic Ave', price: 260, rent: 22, color: 'yellow', position: 26 },
    { name: 'Ventnor Ave', price: 260, rent: 22, color: 'yellow', position: 27 },
    { name: 'Water Works', type: 'utility', price: 150, rent: 0, color: 'special', position: 28 },
    { name: 'Marvin Gardens', price: 280, rent: 24, color: 'yellow', position: 29 },
    { name: 'Go To Jail', type: 'corner', price: 0, rent: 0, color: 'special', position: 30 },
    { name: 'Pacific Ave', price: 300, rent: 26, color: 'green', position: 31 },
    { name: 'North Carolina Ave', price: 300, rent: 26, color: 'green', position: 32 },
    { name: 'Community Chest', type: 'special', price: 0, rent: 0, color: 'special', position: 33 },
    { name: 'Pennsylvania Ave', price: 320, rent: 28, color: 'green', position: 34 },
    { name: 'Short Line', type: 'railroad', price: 200, rent: 25, color: 'special', position: 35 },
    { name: 'Chance', type: 'special', price: 0, rent: 0, color: 'special', position: 36 },
    { name: 'Park Place', price: 350, rent: 35, color: 'darkblue', position: 37 },
    { name: 'Luxury Tax', type: 'tax', price: 0, rent: 100, color: 'special', position: 38 },
    { name: 'Boardwalk', price: 400, rent: 50, color: 'darkblue', position: 39 }
];

// Game state
let gameState = {
    players: [
        { name: 'You', position: 0, money: 1500, properties: [], isHuman: true },
        { name: 'AI', position: 0, money: 1500, properties: [], isHuman: false }
    ],
    currentPlayer: 0,
    dice: [1, 1],
    currentProperty: null,
    gameActive: true
};

// Initialize board
function initBoard() {
    const board = document.getElementById('board');
    if (!board) {
        console.error('Board element not found!');
        return;
    }
    
    board.innerHTML = '';
    board.style.display = 'grid';
    board.style.gridTemplateColumns = 'repeat(11, 1fr)';
    board.style.gridTemplateRows = 'repeat(11, 1fr)';
    board.style.width = '100%';
    board.style.aspectRatio = '1';
    board.style.background = '#f0f0f0';
    board.style.border = '3px solid #333';
    board.style.borderRadius = '10px';
    board.style.position = 'relative';
    board.style.gap = '0';
    
    // Create all 121 cells (11x11 grid)
    for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 11; col++) {
            const cell = document.createElement('div');
            cell.className = 'property';
            cell.id = `cell-${row}-${col}`;
            cell.style.gridRow = row + 1;
            cell.style.gridColumn = col + 1;
            cell.style.border = '1px solid #ccc';
            cell.style.display = 'flex';
            cell.style.flexDirection = 'column';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = '0.6em';
            cell.style.padding = '2px';
            cell.style.textAlign = 'center';
            cell.style.position = 'relative';
            cell.style.background = '#f0f0f0';
            board.appendChild(cell);
        }
    }
    
    // Place spaces around the perimeter
    // Bottom row (left to right): spaces 0-10
    for (let i = 0; i <= 10; i++) {
        const space = BOARD_SPACES[i];
        const cell = document.getElementById(`cell-10-${i}`);
        if (cell && space) {
            renderSpace(cell, space, 'bottom');
        }
    }
    
    // Right column (bottom to top): spaces 11-20
    for (let i = 11; i <= 20; i++) {
        const space = BOARD_SPACES[i];
        const cell = document.getElementById(`cell-${20 - i}-10`);
        if (cell && space) {
            renderSpace(cell, space, 'right');
        }
    }
    
    // Top row (right to left): spaces 21-30
    for (let i = 21; i <= 30; i++) {
        const space = BOARD_SPACES[i];
        const cell = document.getElementById(`cell-0-${30 - i}`);
        if (cell && space) {
            renderSpace(cell, space, 'top');
        }
    }
    
    // Left column (top to bottom): spaces 31-39
    for (let i = 31; i <= 39; i++) {
        const space = BOARD_SPACES[i];
        const cell = document.getElementById(`cell-${i - 30}-0`);
        if (cell && space) {
            renderSpace(cell, space, 'left');
        }
    }
    
    // Center area (free parking area)
    for (let row = 1; row < 10; row++) {
        for (let col = 1; col < 10; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (cell) {
                cell.style.background = '#2E7D32';
                cell.style.color = '#fff';
                cell.innerHTML = '<div style="font-size: 0.8em; font-weight: bold;">MONOPOLY</div>';
            }
        }
    }
    
    updatePlayerPositions();
}

// Render a space on the board
function renderSpace(cell, space, side) {
    cell.textContent = '';
    cell.style.background = getColor(space.color);
    
    // Maximum contrast - use white text with strong shadow for all colors, or black with white outline for light colors
    const lightColors = ['yellow', 'lightblue'];
    if (lightColors.includes(space.color)) {
        cell.style.color = '#000';
        cell.style.textShadow = '2px 2px 4px rgba(255,255,255,0.9), -2px -2px 4px rgba(255,255,255,0.9), 2px -2px 4px rgba(255,255,255,0.9), -2px 2px 4px rgba(255,255,255,0.9)';
        cell.style.fontWeight = '900'; // Extra bold
    } else {
        cell.style.color = '#FFFFFF';
        cell.style.textShadow = '2px 2px 4px rgba(0,0,0,1), -2px -2px 4px rgba(0,0,0,1), 2px -2px 4px rgba(0,0,0,1), -2px 2px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)';
        cell.style.fontWeight = '900'; // Extra bold
    }
    
    // Larger, more readable font
    cell.style.fontSize = side === 'bottom' || side === 'top' ? '0.7em' : '0.6em';
    cell.style.padding = '5px';
    cell.style.lineHeight = '1.2';
    cell.style.wordWrap = 'break-word';
    cell.style.overflow = 'hidden';
    cell.dataset.spaceIndex = space.position;
    
    // Split long names into multiple lines for better readability
    const words = space.name.split(' ');
    if (words.length > 1) {
        // For vertical spaces, keep words together; for horizontal, split
        if (side === 'left' || side === 'right') {
            // Vertical spaces - try to fit on fewer lines
            const mid = Math.ceil(words.length / 2);
            cell.innerHTML = `<div style="line-height: 1.1; font-weight: 900; ${lightColors.includes(space.color) ? 'color: #000; text-shadow: 2px 2px 4px rgba(255,255,255,0.9), -2px -2px 4px rgba(255,255,255,0.9);' : 'color: #FFFFFF; text-shadow: 2px 2px 4px rgba(0,0,0,1), -2px -2px 4px rgba(0,0,0,1);'}">${words.slice(0, mid).join(' ')}</div><div style="line-height: 1.1; font-weight: 900; ${lightColors.includes(space.color) ? 'color: #000; text-shadow: 2px 2px 4px rgba(255,255,255,0.9), -2px -2px 4px rgba(255,255,255,0.9);' : 'color: #FFFFFF; text-shadow: 2px 2px 4px rgba(0,0,0,1), -2px -2px 4px rgba(0,0,0,1);'}">${words.slice(mid).join(' ')}</div>`;
        } else {
            // Horizontal spaces - split more evenly
            cell.innerHTML = words.map(w => `<div style="line-height: 1.1; font-size: 0.95em; font-weight: 900; ${lightColors.includes(space.color) ? 'color: #000; text-shadow: 2px 2px 4px rgba(255,255,255,0.9), -2px -2px 4px rgba(255,255,255,0.9);' : 'color: #FFFFFF; text-shadow: 2px 2px 4px rgba(0,0,0,1), -2px -2px 4px rgba(0,0,0,1);'}">${w}</div>`).join('');
        }
    } else {
        cell.textContent = space.name;
    }
    
    // Add price if it's a property
    if (space.price > 0 && space.type !== 'tax') {
        const priceDiv = document.createElement('div');
        priceDiv.style.fontSize = '0.8em';
        priceDiv.style.marginTop = '3px';
        priceDiv.style.fontWeight = '900';
        if (lightColors.includes(space.color)) {
            priceDiv.style.color = '#000';
            priceDiv.style.textShadow = '2px 2px 4px rgba(255,255,255,0.9), -2px -2px 4px rgba(255,255,255,0.9)';
        } else {
            priceDiv.style.color = '#FFFFFF';
            priceDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,1), -2px -2px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)';
        }
        priceDiv.textContent = `$${space.price}`;
        cell.appendChild(priceDiv);
    }
}

// Get color
function getColor(colorName) {
    const colors = {
        'brown': '#8B4513',
        'lightblue': '#87CEEB',
        'pink': '#FFB6C1',
        'orange': '#FFA500',
        'red': '#FF6B6B',
        'yellow': '#FFD700',
        'green': '#90EE90',
        'darkblue': '#00008B',
        'special': '#D3D3D3'
    };
    return colors[colorName] || '#f0f0f0';
}

// Get cell coordinates from position (0-39)
function getCellCoords(position) {
    if (position <= 10) {
        // Bottom row (left to right)
        return { row: 10, col: position };
    } else if (position <= 20) {
        // Right column (bottom to top)
        return { row: 20 - position, col: 10 };
    } else if (position <= 30) {
        // Top row (right to left)
        return { row: 0, col: 30 - position };
    } else {
        // Left column (top to bottom)
        return { row: position - 30, col: 0 };
    }
}

// Roll dice
function rollDice() {
    if (!gameState.gameActive) return;
    
    const player = gameState.players[gameState.currentPlayer];
    
    if (!player.isHuman && gameState.currentPlayer !== 0) {
        aiTurn();
        return;
    }
    
    // Roll dice
    gameState.dice[0] = Math.floor(Math.random() * 6) + 1;
    gameState.dice[1] = Math.floor(Math.random() * 6) + 1;
    const total = gameState.dice[0] + gameState.dice[1];
    
    // Move player
    const oldPosition = player.position;
    player.position = (player.position + total) % 40;
    
    // Check if passed GO
    if (player.position < oldPosition) {
        player.money += 200;
        updateStatus('Passed GO! Collect $200!');
    }
    
    // Get current space
    const space = BOARD_SPACES[player.position];
    gameState.currentProperty = space;
    
    // Handle different space types
    if (space.type === 'corner') {
        if (space.name === 'GO') {
            player.money += 200;
            updateStatus('Landed on GO! Collect $200!');
        } else if (space.name === 'Go To Jail') {
            player.position = 10; // Jail
            updateStatus('Go to Jail!');
        }
    } else if (space.type === 'tax') {
        const tax = space.rent;
        player.money -= tax;
        updateStatus(`Paid ${space.name}: $${tax}!`);
    } else if (space.type === 'special') {
        updateStatus(`Landed on ${space.name}!`);
    } else if (space.price > 0) {
        // Property, railroad, or utility
        if (space.owner === undefined) {
            // Unowned property
            if (player.isHuman) {
                updateStatus(`Landed on ${space.name}! Buy for $${space.price}?`);
                document.getElementById('buy-btn').style.display = 'inline-block';
            } else {
                // AI decision
                if (player.money >= space.price && Math.random() > 0.3) {
                    buyPropertyForPlayer(1, space);
                }
            }
        } else if (space.owner !== gameState.currentPlayer) {
            // Pay rent
            let rent = space.rent;
            if (space.type === 'railroad') {
                // Rent increases with number of railroads owned
                const railroadsOwned = gameState.players[space.owner].properties.filter(p => p.type === 'railroad').length;
                rent = 25 * Math.pow(2, railroadsOwned - 1);
            } else if (space.type === 'utility') {
                // Utility rent based on dice roll
                rent = (gameState.dice[0] + gameState.dice[1]) * (gameState.players[space.owner].properties.filter(p => p.type === 'utility').length === 2 ? 10 : 4);
            }
            player.money -= rent;
            gameState.players[space.owner].money += rent;
            updateStatus(`Paid $${rent} rent to ${gameState.players[space.owner].name}!`);
        }
    }
    
    updateDisplay();
    
    // Next player
    if (!player.isHuman || (gameState.currentProperty && gameState.currentProperty.owner !== undefined)) {
        nextTurn();
    }
}

// Buy property
function buyProperty() {
    const player = gameState.players[gameState.currentPlayer];
    const property = gameState.currentProperty;
    
    if (!property || property.price === 0 || property.type === 'special' || property.type === 'tax') return;
    if (player.money < property.price) {
        updateStatus('Not enough money!');
        return;
    }
    
    buyPropertyForPlayer(gameState.currentPlayer, property);
    document.getElementById('buy-btn').style.display = 'none';
    nextTurn();
}

// Buy property for player
function buyPropertyForPlayer(playerIndex, property) {
    const player = gameState.players[playerIndex];
    player.money -= property.price;
    player.properties.push(property);
    property.owner = playerIndex;
    updateStatus(`${player.name} bought ${property.name} for $${property.price}!`);
    updateDisplay();
}

// AI turn
function aiTurn() {
    setTimeout(() => {
        rollDice();
    }, 1000);
}

// Next turn
function nextTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % 2;
    gameState.currentProperty = null;
    document.getElementById('buy-btn').style.display = 'none';
    
    const player = gameState.players[gameState.currentPlayer];
    updateStatus(`${player.name}'s turn!`);
    
    // Check game over
    if (player.money < 0) {
        endGame();
        return;
    }
    
    if (!player.isHuman) {
        setTimeout(() => aiTurn(), 1000);
    }
}

// Update display
function updateDisplay() {
    // Update dice
    const diceDisplay = document.getElementById('dice-display');
    if (diceDisplay) {
        diceDisplay.innerHTML = `${getDieFace(gameState.dice[0])} ${getDieFace(gameState.dice[1])}`;
    }
    
    // Update player info
    gameState.players.forEach((player, index) => {
        const moneyEl = document.getElementById(`money-${index === 0 ? 'player' : 'ai'}`);
        const propsEl = document.getElementById(`props-${index === 0 ? 'player' : 'ai'}`);
        const infoEl = document.getElementById(index === 0 ? 'player-info' : 'ai-info');
        
        if (moneyEl) moneyEl.textContent = player.money;
        if (propsEl) propsEl.textContent = player.properties.length;
        
        if (infoEl) {
            if (index === gameState.currentPlayer) {
                infoEl.classList.add('active');
            } else {
                infoEl.classList.remove('active');
            }
        }
    });
    
    // Update board
    updatePlayerPositions();
    updatePropertyOwnership();
}

// Update player positions
function updatePlayerPositions() {
    // Remove old tokens
    document.querySelectorAll('.player-token').forEach(el => el.remove());
    
    gameState.players.forEach((player, index) => {
        const coords = getCellCoords(player.position);
        const cell = document.getElementById(`cell-${coords.row}-${coords.col}`);
        if (cell) {
            const token = document.createElement('div');
            token.className = `player-token ${index === 0 ? 'player' : 'ai'}`;
            token.style.position = 'absolute';
            token.style.width = '20px';
            token.style.height = '20px';
            token.style.borderRadius = '50%';
            token.style.border = '2px solid #000';
            token.style.zIndex = '10';
            token.style.left = index === 0 ? '5px' : '25px';
            token.style.top = '5px';
            cell.style.position = 'relative';
            cell.appendChild(token);
        }
    });
}

// Update property ownership
function updatePropertyOwnership() {
    BOARD_SPACES.forEach((space) => {
        if (space.owner !== undefined && space.price > 0) {
            const coords = getCellCoords(space.position);
            const cell = document.getElementById(`cell-${coords.row}-${coords.col}`);
            if (cell) {
                cell.classList.remove('owned-player', 'owned-ai');
                cell.classList.add(space.owner === 0 ? 'owned-player' : 'owned-ai');
            }
        }
    });
}

// Get die face
function getDieFace(value) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1] || '⚀';
}

// Update status
function updateStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// End game
function endGame() {
    gameState.gameActive = false;
    const winner = gameState.players[0].money > gameState.players[1].money 
        ? gameState.players[0].name 
        : gameState.players[1].name;
    updateStatus(`Game Over! ${winner} wins!`);
    const rollBtn = document.getElementById('roll-btn');
    if (rollBtn) rollBtn.disabled = true;
}

// New game
function newGame() {
    gameState.players[0] = { name: 'You', position: 0, money: 1500, properties: [], isHuman: true };
    gameState.players[1] = { name: 'AI', position: 0, money: 1500, properties: [], isHuman: false };
    gameState.currentPlayer = 0;
    gameState.dice = [1, 1];
    gameState.currentProperty = null;
    gameState.gameActive = true;
    
    BOARD_SPACES.forEach(space => {
        space.owner = undefined;
    });
    
    initBoard();
    updateDisplay();
    updateStatus('Your turn! Roll the dice.');
    const rollBtn = document.getElementById('roll-btn');
    if (rollBtn) rollBtn.disabled = false;
    const buyBtn = document.getElementById('buy-btn');
    if (buyBtn) buyBtn.style.display = 'none';
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initBoard();
    newGame();
});
