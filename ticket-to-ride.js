// Ticket to Ride (Simplified)

const ROUTES = [
    { from: 'New York', to: 'Boston', length: 2, color: 'red' },
    { from: 'Boston', to: 'Montreal', length: 3, color: 'blue' },
    { from: 'New York', to: 'Philadelphia', length: 1, color: 'green' },
    { from: 'Philadelphia', to: 'Washington', length: 2, color: 'yellow' },
    { from: 'Washington', to: 'Atlanta', length: 4, color: 'red' },
    { from: 'Atlanta', to: 'Miami', length: 3, color: 'blue' },
    { from: 'Chicago', to: 'Detroit', length: 2, color: 'green' },
    { from: 'Detroit', to: 'Toronto', length: 2, color: 'yellow' }
];

// Game state
let gameState = {
    routes: [],
    claimedRoutes: [],
    trainCards: [],
    trains: 45,
    points: 0,
    selectedRoute: null,
    gameActive: true
};

// Initialize game
function newGame() {
    gameState.routes = [...ROUTES];
    gameState.claimedRoutes = [];
    gameState.trainCards = [];
    gameState.trains = 45;
    gameState.points = 0;
    gameState.selectedRoute = null;
    gameState.gameActive = true;
    
    renderMap();
    updateDisplay();
    updateStatus('Draw train cards to claim routes!');
}

// Draw train card
function drawCard() {
    const colors = ['red', 'blue', 'green', 'yellow', 'wild'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    gameState.trainCards.push(color);
    updateDisplay();
    updateStatus(`Drew ${color} card! You have ${gameState.trainCards.length} cards.`);
}

// Claim route
function claimRoute() {
    if (gameState.selectedRoute === null) {
        updateStatus('Select a route first!');
        return;
    }
    
    const route = gameState.routes[gameState.selectedRoute];
    const needed = route.length;
    
    // Check if player has enough cards
    const colorCount = gameState.trainCards.filter(c => c === route.color || c === 'wild').length;
    
    if (colorCount >= needed && gameState.trains >= needed) {
        // Remove cards
        let removed = 0;
        gameState.trainCards = gameState.trainCards.filter(c => {
            if (removed < needed && (c === route.color || c === 'wild')) {
                removed++;
                return false;
            }
            return true;
        });
        
        // Claim route
        gameState.claimedRoutes.push(route);
        gameState.routes.splice(gameState.selectedRoute, 1);
        gameState.trains -= needed;
        gameState.points += needed * 2;
        gameState.selectedRoute = null;
        
        updateDisplay();
        renderMap();
        updateStatus(`Claimed route! +${needed * 2} points!`);
        
        if (gameState.routes.length === 0 || gameState.trains < 2) {
            endGame();
        }
    } else {
        updateStatus(`Need ${needed} ${route.color} cards and ${needed} trains!`);
    }
}

// Render map
function renderMap() {
    const mapEl = document.getElementById('route-map');
    mapEl.innerHTML = '';
    
    // Simplified map display
    gameState.routes.forEach((route, index) => {
        const routeEl = document.createElement('div');
        routeEl.className = 'route';
        if (gameState.selectedRoute === index) {
            routeEl.style.border = '2px solid #FFD700';
        }
        routeEl.textContent = `${route.from}-${route.to} (${route.length})`;
        routeEl.onclick = () => {
            gameState.selectedRoute = index;
            renderMap();
        };
        mapEl.appendChild(routeEl);
    });
    
    // Show claimed routes
    gameState.claimedRoutes.forEach(route => {
        const routeEl = document.createElement('div');
        routeEl.className = 'route claimed';
        routeEl.textContent = `${route.from}-${route.to} ✓`;
        mapEl.appendChild(routeEl);
    });
}

// Update display
function updateDisplay() {
    // Display would show cards, trains, points
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame() {
    gameState.gameActive = false;
    updateStatus(`🎉 Game Over! Final Score: ${gameState.points} points!`);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
