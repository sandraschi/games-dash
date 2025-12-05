// Monopoly Game Logic (Simplified)

// Properties on the board (simplified 40-space board)
const PROPERTIES = [
    { name: 'GO', price: 0, rent: 0, color: 'special' },
    { name: 'Mediterranean', price: 60, rent: 2, color: 'brown' },
    { name: 'Baltic', price: 60, rent: 4, color: 'brown' },
    { name: 'Oriental', price: 100, rent: 6, color: 'lightblue' },
    { name: 'Vermont', price: 100, rent: 6, color: 'lightblue' },
    { name: 'Connecticut', price: 120, rent: 8, color: 'lightblue' },
    { name: 'St. Charles', price: 140, rent: 10, color: 'pink' },
    { name: 'States', price: 140, rent: 10, color: 'pink' },
    { name: 'Virginia', price: 160, rent: 12, color: 'pink' },
    { name: 'St. James', price: 180, rent: 14, color: 'orange' },
    { name: 'Tennessee', price: 180, rent: 14, color: 'orange' },
    { name: 'New York', price: 200, rent: 16, color: 'orange' },
    { name: 'Kentucky', price: 220, rent: 18, color: 'red' },
    { name: 'Indiana', price: 220, rent: 18, color: 'red' },
    { name: 'Illinois', price: 240, rent: 20, color: 'red' },
    { name: 'Atlantic', price: 260, rent: 22, color: 'yellow' },
    { name: 'Ventnor', price: 260, rent: 22, color: 'yellow' },
    { name: 'Marvin Gardens', price: 280, rent: 24, color: 'yellow' },
    { name: 'Pacific', price: 300, rent: 26, color: 'green' },
    { name: 'North Carolina', price: 300, rent: 26, color: 'green' },
    { name: 'Pennsylvania', price: 320, rent: 28, color: 'green' },
    { name: 'Park Place', price: 350, rent: 35, color: 'darkblue' },
    { name: 'Boardwalk', price: 400, rent: 50, color: 'darkblue' }
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
    board.innerHTML = '';
    
    // Create simplified board layout (11x11 grid, properties around edges)
    for (let i = 0; i < 121; i++) {
        const cell = document.createElement('div');
        cell.className = 'property';
        cell.id = `cell-${i}`;
        
        // Map positions to properties (simplified)
        const propIndex = getPropertyIndex(i);
        if (propIndex !== -1) {
            const prop = PROPERTIES[propIndex];
            cell.textContent = prop.name;
            cell.style.background = getColor(prop.color);
        }
        
        board.appendChild(cell);
    }
    
    updatePlayerPositions();
}

// Get property index from board position
function getPropertyIndex(boardPos) {
    // Simplified mapping - properties around the edges
    const edgePositions = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, // Top
        11, 21, 31, 41, 51, 61, 71, 81, 91, 101, // Right
        110, 109, 108, 107, 106, 105, 104, 103, 102, // Bottom
        100, 90, 80, 70, 60, 50, 40, 30, 20 // Left
    ];
    
    const index = edgePositions.indexOf(boardPos);
    return index < PROPERTIES.length ? index : -1;
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
    player.position = (player.position + total) % 40;
    
    // Check property
    const propIndex = getPropertyIndex(player.position);
    if (propIndex !== -1) {
        const property = PROPERTIES[propIndex];
        gameState.currentProperty = property;
        
        if (property.price === 0) {
            // Special space (GO)
            if (player.position === 0) {
                player.money += 200;
                updateStatus('Passed GO! Collect $200!');
            }
        } else if (property.owner === undefined) {
            // Unowned property
            if (player.isHuman) {
                updateStatus(`Landed on ${property.name}! Buy for $${property.price}?`);
                document.getElementById('buy-btn').style.display = 'inline-block';
            } else {
                // AI decision
                if (player.money >= property.price && Math.random() > 0.3) {
                    buyPropertyForPlayer(1, property);
                }
            }
        } else if (property.owner !== gameState.currentPlayer) {
            // Pay rent
            const rent = property.rent;
            player.money -= rent;
            gameState.players[property.owner].money += rent;
            updateStatus(`Paid $${rent} rent to ${gameState.players[property.owner].name}!`);
        }
    }
    
    updateDisplay();
    
    // Next player
    if (!player.isHuman || gameState.currentProperty === null || gameState.currentProperty.owner !== undefined) {
        nextTurn();
    }
}

// Buy property
function buyProperty() {
    const player = gameState.players[gameState.currentPlayer];
    const property = gameState.currentProperty;
    
    if (!property || property.price === 0) return;
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
    diceDisplay.innerHTML = `${getDieFace(gameState.dice[0])} ${getDieFace(gameState.dice[1])}`;
    
    // Update player info
    gameState.players.forEach((player, index) => {
        document.getElementById(`money-${index === 0 ? 'player' : 'ai'}`).textContent = player.money;
        document.getElementById(`props-${index === 0 ? 'player' : 'ai'}`).textContent = player.properties.length;
        
        const infoEl = document.getElementById(index === 0 ? 'player-info' : 'ai-info');
        if (index === gameState.currentPlayer) {
            infoEl.classList.add('active');
        } else {
            infoEl.classList.remove('active');
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
        const cell = document.getElementById(`cell-${player.position}`);
        if (cell) {
            const token = document.createElement('div');
            token.className = `player-token ${index === 0 ? 'player' : 'ai'}`;
            token.style.left = index === 0 ? '5px' : '25px';
            token.style.top = '5px';
            cell.appendChild(token);
        }
    });
}

// Update property ownership
function updatePropertyOwnership() {
    PROPERTIES.forEach((property, index) => {
        if (property.owner !== undefined) {
            const boardPos = getBoardPosition(index);
            const cell = document.getElementById(`cell-${boardPos}`);
            if (cell) {
                cell.classList.remove('owned-player', 'owned-ai');
                cell.classList.add(property.owner === 0 ? 'owned-player' : 'owned-ai');
            }
        }
    });
}

// Get board position from property index
function getBoardPosition(propIndex) {
    const edgePositions = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 21, 31, 41, 51, 61, 71, 81, 91, 101,
        110, 109, 108, 107, 106, 105, 104, 103, 102,
        100, 90, 80, 70, 60, 50, 40, 30, 20
    ];
    return edgePositions[propIndex] || 0;
}

// Get die face
function getDieFace(value) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1];
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame() {
    gameState.gameActive = false;
    const winner = gameState.players[0].money > gameState.players[1].money 
        ? gameState.players[0].name 
        : gameState.players[1].name;
    updateStatus(`🎉 Game Over! ${winner} wins!`);
    document.getElementById('roll-btn').disabled = true;
}

// New game
function newGame() {
    gameState.players[0] = { name: 'You', position: 0, money: 1500, properties: [], isHuman: true };
    gameState.players[1] = { name: 'AI', position: 0, money: 1500, properties: [], isHuman: false };
    gameState.currentPlayer = 0;
    gameState.dice = [1, 1];
    gameState.currentProperty = null;
    gameState.gameActive = true;
    
    PROPERTIES.forEach(prop => {
        prop.owner = undefined;
    });
    
    initBoard();
    updateDisplay();
    updateStatus('Your turn! Roll the dice.');
    document.getElementById('roll-btn').disabled = false;
    document.getElementById('buy-btn').style.display = 'none';
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initBoard();
    newGame();
});
