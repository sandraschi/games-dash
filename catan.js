// Settlers of Catan (Simplified)

const RESOURCE_TYPES = ['wood', 'brick', 'sheep', 'wheat', 'ore'];

// Game state
let gameState = {
    resources: {
        wood: 0,
        brick: 0,
        sheep: 0,
        wheat: 0,
        ore: 0
    },
    hexes: [],
    settlements: 0,
    victoryPoints: 0,
    gameActive: true
};

// Initialize game
function newGame() {
    gameState.resources = {
        wood: 0,
        brick: 0,
        sheep: 0,
        wheat: 0,
        ore: 0
    };
    gameState.settlements = 0;
    gameState.victoryPoints = 0;
    gameState.gameActive = true;
    
    // Create hex board
    const hexGrid = document.getElementById('hex-grid');
    hexGrid.innerHTML = '';
    
    const hexTypes = [
        'wood', 'brick', 'sheep', 'wheat', 'ore',
        'wood', 'brick', 'sheep', 'wheat', 'ore',
        'wood', 'brick', 'sheep', 'wheat', 'ore'
    ];
    
    hexTypes.forEach((type, index) => {
        const hex = document.createElement('div');
        hex.className = `hex ${type}`;
        hex.textContent = type.charAt(0).toUpperCase();
        hex.dataset.type = type;
        hex.dataset.number = (index % 6) + 2; // Dice numbers 2-7
        hexGrid.appendChild(hex);
    });
    
    updateDisplay();
    updateStatus('Roll dice to start collecting resources!');
}

// Roll dice
function rollDice() {
    if (!gameState.gameActive) return;
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    
    // Collect resources from hexes with matching number
    document.querySelectorAll('.hex').forEach(hex => {
        if (parseInt(hex.dataset.number) === total) {
            const type = hex.dataset.type;
            gameState.resources[type]++;
        }
    });
    
    updateDisplay();
    updateStatus(`Rolled ${total}! Collected resources from matching hexes.`);
}

// Build settlement
function buildSettlement() {
    if (gameState.resources.wood >= 1 && 
        gameState.resources.brick >= 1 && 
        gameState.resources.sheep >= 1 && 
        gameState.resources.wheat >= 1) {
        
        gameState.resources.wood--;
        gameState.resources.brick--;
        gameState.resources.sheep--;
        gameState.resources.wheat--;
        gameState.settlements++;
        gameState.victoryPoints++;
        
        updateDisplay();
        updateStatus('Settlement built! +1 Victory Point!');
        
        if (gameState.victoryPoints >= 10) {
            endGame();
        }
    } else {
        updateStatus('Not enough resources! Need: 1 Wood, 1 Brick, 1 Sheep, 1 Wheat');
    }
}

// Update display
function updateDisplay() {
    document.getElementById('wood').textContent = gameState.resources.wood;
    document.getElementById('brick').textContent = gameState.resources.brick;
    document.getElementById('sheep').textContent = gameState.resources.sheep;
    document.getElementById('wheat').textContent = gameState.resources.wheat;
    document.getElementById('ore').textContent = gameState.resources.ore;
    document.getElementById('victory-points').textContent = gameState.victoryPoints;
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame() {
    gameState.gameActive = false;
    updateStatus('🎉 You win! Reached 10 Victory Points!');
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
