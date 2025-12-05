// Ticket to Ride (Simplified)

// City positions on the map (x, y coordinates as percentages)
const CITIES = {
    'New York': { x: 75, y: 30 },
    'Boston': { x: 85, y: 20 },
    'Montreal': { x: 80, y: 10 },
    'Philadelphia': { x: 70, y: 35 },
    'Washington': { x: 70, y: 45 },
    'Atlanta': { x: 65, y: 60 },
    'Miami': { x: 75, y: 80 },
    'Chicago': { x: 40, y: 35 },
    'Detroit': { x: 50, y: 30 },
    'Toronto': { x: 55, y: 20 }
};

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
    if (!mapEl) {
        console.error('route-map element not found!');
        return;
    }
    
    mapEl.innerHTML = '';
    mapEl.style.position = 'relative';
    mapEl.style.width = '100%';
    mapEl.style.height = '600px';
    mapEl.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
    mapEl.style.borderRadius = '10px';
    mapEl.style.overflow = 'hidden';
    
    // Draw claimed routes first (so they appear behind)
    gameState.claimedRoutes.forEach(route => {
        const fromCity = CITIES[route.from];
        const toCity = CITIES[route.to];
        
        if (!fromCity || !toCity) {
            console.warn(`City not found: ${route.from} or ${route.to}`);
            return;
        }
        
        const isClaimed = true;
        const isSelected = false;
        
        // Calculate line position
        const x1 = fromCity.x;
        const y1 = fromCity.y;
        const x2 = toCity.x;
        const y2 = toCity.y;
        
        // Calculate angle and length
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Create route line
        const routeLine = document.createElement('div');
        routeLine.style.position = 'absolute';
        routeLine.style.left = `${x1}%`;
        routeLine.style.top = `${y1}%`;
        routeLine.style.width = `${length}%`;
        routeLine.style.height = isClaimed ? '8px' : '6px';
        routeLine.style.background = isClaimed ? '#2196F3' : getRouteColor(route.color);
        routeLine.style.transformOrigin = '0 50%';
        routeLine.style.transform = `rotate(${angle}deg)`;
        routeLine.style.borderRadius = '3px';
        routeLine.style.cursor = isClaimed ? 'default' : 'pointer';
        routeLine.style.zIndex = isClaimed ? '1' : '2';
        routeLine.style.boxShadow = isSelected ? '0 0 10px #FFD700' : 'none';
        routeLine.style.border = isSelected ? '2px solid #FFD700' : 'none';
        routeLine.title = `${route.from} → ${route.to} (${route.length} trains, ${route.color})`;
        
        mapEl.appendChild(routeLine);
        
        // Add route label
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.left = `${(x1 + x2) / 2}%`;
        label.style.top = `${(y1 + y2) / 2 - 2}%`;
        label.style.transform = 'translate(-50%, -50%)';
        label.style.background = isClaimed ? '#2196F3' : 'rgba(0, 0, 0, 0.7)';
        label.style.color = '#fff';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.zIndex = '10';
        label.style.pointerEvents = 'none';
        label.textContent = route.length;
        mapEl.appendChild(label);
    });
    
    // Draw available routes (on top, clickable)
    gameState.routes.forEach((route, index) => {
        const fromCity = CITIES[route.from];
        const toCity = CITIES[route.to];
        
        if (!fromCity || !toCity) {
            console.warn(`City not found: ${route.from} or ${route.to}`);
            return;
        }
        
        const isClaimed = false;
        const isSelected = gameState.selectedRoute === index;
    
    // Draw cities
    Object.keys(CITIES).forEach(cityName => {
        const city = CITIES[cityName];
        const cityEl = document.createElement('div');
        cityEl.className = 'city-marker';
        cityEl.style.position = 'absolute';
        cityEl.style.left = `${city.x}%`;
        cityEl.style.top = `${city.y}%`;
        cityEl.style.transform = 'translate(-50%, -50%)';
        cityEl.style.width = '20px';
        cityEl.style.height = '20px';
        cityEl.style.background = '#FFD700';
        cityEl.style.border = '3px solid #fff';
        cityEl.style.borderRadius = '50%';
        cityEl.style.zIndex = '5';
        cityEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)';
        cityEl.title = cityName;
        mapEl.appendChild(cityEl);
        
        // City label
        const cityLabel = document.createElement('div');
        cityLabel.style.position = 'absolute';
        cityLabel.style.left = `${city.x}%`;
        cityLabel.style.top = `${city.y + 2}%`;
        cityLabel.style.transform = 'translate(-50%, 0)';
        cityLabel.style.color = '#fff';
        cityLabel.style.fontSize = '11px';
        cityLabel.style.fontWeight = 'bold';
        cityLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
        cityLabel.style.zIndex = '10';
        cityLabel.style.pointerEvents = 'none';
        cityLabel.textContent = cityName;
        mapEl.appendChild(cityLabel);
    });
}

function getRouteColor(colorName) {
    const colors = {
        'red': '#e74c3c',
        'blue': '#3498db',
        'green': '#2ecc71',
        'yellow': '#f1c40f',
        'wild': '#9b59b6',
        'gray': '#95a5a6'
    };
    return colors[colorName] || '#95a5a6';
}

// Update display
function updateDisplay() {
    const cardsEl = document.getElementById('train-cards');
    const trainsEl = document.getElementById('trains');
    const pointsEl = document.getElementById('points');
    
    if (cardsEl) {
        const cardCounts = {};
        gameState.trainCards.forEach(card => {
            cardCounts[card] = (cardCounts[card] || 0) + 1;
        });
        if (Object.keys(cardCounts).length === 0) {
            cardsEl.innerHTML = '<p style="color: #999; font-size: 0.9em;">Draw cards to get started</p>';
        } else {
            cardsEl.innerHTML = Object.keys(cardCounts).map(color => 
                `<span style="background: ${getRouteColor(color)}; padding: 5px 10px; margin: 2px; border-radius: 5px; display: inline-block; color: #fff; font-weight: bold;">
                    ${color}: ${cardCounts[color]}
                </span>`
            ).join('');
        }
    }
    
    if (trainsEl) {
        trainsEl.textContent = `Trains: ${gameState.trains}`;
    }
    
    if (pointsEl) {
        pointsEl.textContent = `Points: ${gameState.points}`;
    }
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
