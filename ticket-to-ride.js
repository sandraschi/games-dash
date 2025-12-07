// Ticket to Ride - North America Map (Expanded)

// City positions on the map (x, y coordinates as percentages)
const CITIES = {
    // West Coast
    'Vancouver': { x: 8, y: 12 },
    'Seattle': { x: 10, y: 18 },
    'Portland': { x: 10, y: 25 },
    'San Francisco': { x: 8, y: 40 },
    'Los Angeles': { x: 12, y: 55 },
    'Las Vegas': { x: 18, y: 50 },
    'Phoenix': { x: 20, y: 60 },
    'El Paso': { x: 30, y: 65 },
    
    // Mountain States
    'Helena': { x: 25, y: 20 },
    'Calgary': { x: 22, y: 10 },
    'Winnipeg': { x: 35, y: 15 },
    'Duluth': { x: 40, y: 25 },
    'Denver': { x: 32, y: 42 },
    'Salt Lake City': { x: 22, y: 38 },
    'Santa Fe': { x: 28, y: 55 },
    'Oklahoma City': { x: 40, y: 55 },
    'Kansas City': { x: 45, y: 48 },
    'Omaha': { x: 42, y: 38 },
    
    // Central/East
    'Chicago': { x: 48, y: 35 },
    'Sault Ste. Marie': { x: 52, y: 20 },
    'Toronto': { x: 58, y: 28 },
    'Montreal': { x: 65, y: 20 },
    'Boston': { x: 75, y: 25 },
    'New York': { x: 72, y: 32 },
    'Pittsburgh': { x: 60, y: 38 },
    'Washington': { x: 68, y: 42 },
    'Raleigh': { x: 65, y: 50 },
    'Charleston': { x: 68, y: 58 },
    'Atlanta': { x: 58, y: 58 },
    'Nashville': { x: 52, y: 52 },
    'Little Rock': { x: 45, y: 58 },
    'New Orleans': { x: 48, y: 68 },
    'Houston': { x: 42, y: 68 },
    'Dallas': { x: 38, y: 62 },
    'Miami': { x: 72, y: 75 }
};

// Routes - Major routes connecting cities (expanded significantly)
const ROUTES = [
    // West Coast routes
    { from: 'Vancouver', to: 'Seattle', length: 1, color: 'gray' },
    { from: 'Seattle', to: 'Portland', length: 1, color: 'gray' },
    { from: 'Portland', to: 'San Francisco', length: 5, color: 'green' },
    { from: 'Portland', to: 'San Francisco', length: 5, color: 'pink' },
    { from: 'San Francisco', to: 'Los Angeles', length: 3, color: 'yellow' },
    { from: 'San Francisco', to: 'Los Angeles', length: 3, color: 'pink' },
    { from: 'Los Angeles', to: 'Las Vegas', length: 2, color: 'gray' },
    { from: 'Los Angeles', to: 'Phoenix', length: 3, color: 'gray' },
    { from: 'Las Vegas', to: 'Salt Lake City', length: 3, color: 'orange' },
    { from: 'Phoenix', to: 'El Paso', length: 3, color: 'gray' },
    { from: 'Phoenix', to: 'Santa Fe', length: 3, color: 'gray' },
    
    // Mountain routes
    { from: 'Vancouver', to: 'Calgary', length: 3, color: 'gray' },
    { from: 'Calgary', to: 'Winnipeg', length: 6, color: 'white' },
    { from: 'Calgary', to: 'Helena', length: 4, color: 'gray' },
    { from: 'Seattle', to: 'Helena', length: 6, color: 'yellow' },
    { from: 'Seattle', to: 'Calgary', length: 4, color: 'gray' },
    { from: 'Portland', to: 'Salt Lake City', length: 6, color: 'blue' },
    { from: 'Helena', to: 'Winnipeg', length: 4, color: 'blue' },
    { from: 'Helena', to: 'Duluth', length: 6, color: 'orange' },
    { from: 'Helena', to: 'Omaha', length: 5, color: 'red' },
    { from: 'Helena', to: 'Denver', length: 4, color: 'green' },
    { from: 'Winnipeg', to: 'Duluth', length: 4, color: 'black' },
    { from: 'Winnipeg', to: 'Sault Ste. Marie', length: 6, color: 'gray' },
    { from: 'Duluth', to: 'Sault Ste. Marie', length: 3, color: 'gray' },
    { from: 'Duluth', to: 'Toronto', length: 6, color: 'pink' },
    { from: 'Duluth', to: 'Chicago', length: 3, color: 'red' },
    { from: 'Duluth', to: 'Omaha', length: 2, color: 'gray' },
    { from: 'Duluth', to: 'Omaha', length: 2, color: 'gray' },
    { from: 'Omaha', to: 'Chicago', length: 4, color: 'blue' },
    { from: 'Omaha', to: 'Kansas City', length: 1, color: 'gray' },
    { from: 'Omaha', to: 'Kansas City', length: 1, color: 'gray' },
    { from: 'Denver', to: 'Salt Lake City', length: 3, color: 'red' },
    { from: 'Denver', to: 'Salt Lake City', length: 3, color: 'yellow' },
    { from: 'Denver', to: 'Kansas City', length: 4, color: 'black' },
    { from: 'Denver', to: 'Kansas City', length: 4, color: 'orange' },
    { from: 'Denver', to: 'Oklahoma City', length: 4, color: 'red' },
    { from: 'Denver', to: 'Santa Fe', length: 2, color: 'gray' },
    { from: 'Salt Lake City', to: 'Denver', length: 3, color: 'red' },
    { from: 'Salt Lake City', to: 'Denver', length: 3, color: 'yellow' },
    { from: 'Santa Fe', to: 'Oklahoma City', length: 3, color: 'blue' },
    { from: 'Santa Fe', to: 'El Paso', length: 2, color: 'gray' },
    { from: 'El Paso', to: 'Dallas', length: 4, color: 'red' },
    { from: 'El Paso', to: 'Houston', length: 6, color: 'green' },
    { from: 'Oklahoma City', to: 'Kansas City', length: 2, color: 'gray' },
    { from: 'Oklahoma City', to: 'Kansas City', length: 2, color: 'gray' },
    { from: 'Oklahoma City', to: 'Little Rock', length: 2, color: 'gray' },
    { from: 'Oklahoma City', to: 'Dallas', length: 2, color: 'gray' },
    { from: 'Oklahoma City', to: 'Dallas', length: 2, color: 'gray' },
    { from: 'Kansas City', to: 'Saint Louis', length: 2, color: 'blue' },
    { from: 'Kansas City', to: 'Saint Louis', length: 2, color: 'pink' },
    { from: 'Kansas City', to: 'Little Rock', length: 2, color: 'gray' },
    
    // Central/East routes
    { from: 'Chicago', to: 'Toronto', length: 4, color: 'white' },
    { from: 'Chicago', to: 'Pittsburgh', length: 3, color: 'orange' },
    { from: 'Chicago', to: 'Pittsburgh', length: 3, color: 'black' },
    { from: 'Chicago', to: 'Saint Louis', length: 2, color: 'green' },
    { from: 'Chicago', to: 'Saint Louis', length: 2, color: 'white' },
    { from: 'Chicago', to: 'Nashville', length: 4, color: 'yellow' },
    { from: 'Sault Ste. Marie', to: 'Montreal', length: 5, color: 'black' },
    { from: 'Sault Ste. Marie', to: 'Toronto', length: 2, color: 'gray' },
    { from: 'Toronto', to: 'Montreal', length: 3, color: 'gray' },
    { from: 'Toronto', to: 'Pittsburgh', length: 2, color: 'gray' },
    { from: 'Montreal', to: 'Boston', length: 2, color: 'gray' },
    { from: 'Montreal', to: 'Boston', length: 2, color: 'gray' },
    { from: 'Boston', to: 'New York', length: 2, color: 'yellow' },
    { from: 'Boston', to: 'New York', length: 2, color: 'red' },
    { from: 'New York', to: 'Pittsburgh', length: 2, color: 'green' },
    { from: 'New York', to: 'Pittsburgh', length: 2, color: 'white' },
    { from: 'New York', to: 'Washington', length: 2, color: 'orange' },
    { from: 'New York', to: 'Washington', length: 2, color: 'black' },
    { from: 'Pittsburgh', to: 'Washington', length: 2, color: 'gray' },
    { from: 'Pittsburgh', to: 'Raleigh', length: 2, color: 'gray' },
    { from: 'Pittsburgh', to: 'Nashville', length: 4, color: 'yellow' },
    { from: 'Pittsburgh', to: 'Saint Louis', length: 5, color: 'green' },
    { from: 'Washington', to: 'Raleigh', length: 2, color: 'gray' },
    { from: 'Washington', to: 'Raleigh', length: 2, color: 'gray' },
    { from: 'Raleigh', to: 'Charleston', length: 2, color: 'gray' },
    { from: 'Raleigh', to: 'Atlanta', length: 2, color: 'gray' },
    { from: 'Raleigh', to: 'Atlanta', length: 2, color: 'gray' },
    { from: 'Charleston', to: 'Atlanta', length: 2, color: 'gray' },
    { from: 'Charleston', to: 'Miami', length: 4, color: 'pink' },
    { from: 'Atlanta', to: 'Nashville', length: 1, color: 'gray' },
    { from: 'Atlanta', to: 'New Orleans', length: 4, color: 'yellow' },
    { from: 'Atlanta', to: 'New Orleans', length: 4, color: 'orange' },
    { from: 'Atlanta', to: 'Miami', length: 5, color: 'blue' },
    { from: 'Nashville', to: 'Little Rock', length: 3, color: 'white' },
    { from: 'Nashville', to: 'Saint Louis', length: 2, color: 'gray' },
    { from: 'Little Rock', to: 'New Orleans', length: 3, color: 'green' },
    { from: 'Little Rock', to: 'Dallas', length: 2, color: 'gray' },
    { from: 'Little Rock', to: 'Oklahoma City', length: 2, color: 'gray' },
    { from: 'New Orleans', to: 'Houston', length: 2, color: 'gray' },
    { from: 'Dallas', to: 'Houston', length: 1, color: 'gray' },
    { from: 'Dallas', to: 'Houston', length: 1, color: 'gray' },
];

// Add Saint Louis to cities (missing from original list)
CITIES['Saint Louis'] = { x: 50, y: 45 };

// Game state
let gameState = {
    routes: [],
    claimedRoutes: [],
    trainCards: [],
    destinationTickets: [],
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
    gameState.destinationTickets = [];
    gameState.trains = 45;
    gameState.points = 0;
    gameState.selectedRoute = null;
    gameState.gameActive = true;
    
    // Deal 3 destination tickets (player keeps at least 2)
    dealDestinationTickets();
    
    renderMap();
    updateDisplay();
    updateStatus('Draw train cards to claim routes! Complete destination tickets for bonus points.');
}

// Deal destination tickets
function dealDestinationTickets() {
    const tickets = [
        { from: 'Los Angeles', to: 'New York', points: 21 },
        { from: 'Duluth', to: 'Houston', points: 8 },
        { from: 'Sault Ste. Marie', to: 'Nashville', points: 8 },
        { from: 'New York', to: 'Atlanta', points: 6 },
        { from: 'Portland', to: 'Nashville', points: 17 },
        { from: 'Vancouver', to: 'Montreal', points: 20 },
        { from: 'Denver', to: 'El Paso', points: 4 },
        { from: 'Toronto', to: 'Miami', points: 10 },
        { from: 'Portland', to: 'Phoenix', points: 11 },
        { from: 'Dallas', to: 'New York', points: 11 },
        { from: 'Calgary', to: 'Phoenix', points: 13 },
        { from: 'Calgary', to: 'Salt Lake City', points: 7 },
        { from: 'Chicago', to: 'Santa Fe', points: 9 },
        { from: 'Vancouver', to: 'Santa Fe', points: 13 },
        { from: 'Boston', to: 'Miami', points: 12 },
        { from: 'Chicago', to: 'New Orleans', points: 7 },
        { from: 'Montreal', to: 'Atlanta', points: 9 },
        { from: 'Seattle', to: 'New York', points: 22 },
        { from: 'Denver', to: 'Pittsburgh', points: 11 },
        { from: 'Winnipeg', to: 'Little Rock', points: 11 },
        { from: 'Winnipeg', to: 'Houston', points: 12 },
        { from: 'Boston', to: 'Miami', points: 12 },
        { from: 'Vancouver', to: 'Montreal', points: 20 },
        { from: 'Calgary', to: 'Phoenix', points: 13 },
        { from: 'Montreal', to: 'New Orleans', points: 13 },
        { from: 'Los Angeles', to: 'Chicago', points: 16 },
        { from: 'San Francisco', to: 'Atlanta', points: 17 },
        { from: 'Portland', to: 'Nashville', points: 17 },
        { from: 'Vancouver', to: 'Santa Fe', points: 13 },
        { from: 'Los Angeles', to: 'Miami', points: 20 }
    ];
    
    // Deal 3 random tickets
    const shuffled = [...tickets].sort(() => Math.random() - 0.5);
    gameState.destinationTickets = shuffled.slice(0, 3);
}

// Draw train card
function drawCard() {
    if (gameState.trainCards.length >= 7) {
        updateStatus('You can only hold 7 train cards! Claim a route first.');
        return;
    }
    
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'pink', 'white', 'black', 'wild'];
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
    let colorCount = 0;
    let wildCount = 0;
    
    gameState.trainCards.forEach(card => {
        if (card === route.color) colorCount++;
        if (card === 'wild') wildCount++;
    });
    
    const totalCards = colorCount + wildCount;
    
    if (totalCards >= needed && gameState.trains >= needed) {
        // Remove cards (prefer matching color, then wilds)
        let removed = 0;
        gameState.trainCards = gameState.trainCards.filter(c => {
            if (removed < needed) {
                if (c === route.color || (c === 'wild' && removed >= colorCount)) {
                    removed++;
                    return false;
                }
            }
            return true;
        });
        
        // Claim route
        gameState.claimedRoutes.push(route);
        gameState.routes.splice(gameState.selectedRoute, 1);
        gameState.trains -= needed;
        
        // Calculate points based on route length
        const routePoints = {
            1: 1,
            2: 2,
            3: 4,
            4: 7,
            5: 10,
            6: 15
        };
        gameState.points += routePoints[needed] || needed * 2;
        
        gameState.selectedRoute = null;
        
        updateDisplay();
        renderMap();
        checkDestinationTickets();
        updateStatus(`Claimed route! +${routePoints[needed] || needed * 2} points!`);
        
        if (gameState.routes.length === 0 || gameState.trains < 2) {
            endGame();
        }
    } else {
        updateStatus(`Need ${needed} ${route.color} cards (or wilds) and ${needed} trains!`);
    }
}

// Check destination tickets
function checkDestinationTickets() {
    // Simple pathfinding check - in real game would need full pathfinding
    // For now, just check if cities are connected via claimed routes
    gameState.destinationTickets.forEach(ticket => {
        if (isRouteComplete(ticket.from, ticket.to)) {
            // Ticket completed - add points
            gameState.points += ticket.points;
            updateStatus(`Destination ticket completed: ${ticket.from} → ${ticket.to} (+${ticket.points} points)!`);
        }
    });
}

// Simple pathfinding check (basic implementation)
function isRouteComplete(from, to) {
    // Build graph of claimed routes
    const graph = {};
    gameState.claimedRoutes.forEach(route => {
        if (!graph[route.from]) graph[route.from] = [];
        if (!graph[route.to]) graph[route.to] = [];
        graph[route.from].push(route.to);
        graph[route.to].push(route.from);
    });
    
    // BFS to check connectivity
    const visited = new Set();
    const queue = [from];
    visited.add(from);
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (current === to) return true;
        
        if (graph[current]) {
            graph[current].forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            });
        }
    }
    
    return false;
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
        drawRoute(route, mapEl, true, false);
    });
    
    // Draw available routes (on top, clickable)
    gameState.routes.forEach((route, index) => {
        drawRoute(route, mapEl, false, gameState.selectedRoute === index, index);
    });
    
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

// Draw a single route
function drawRoute(route, mapEl, isClaimed, isSelected, routeIndex) {
    const fromCity = CITIES[route.from];
    const toCity = CITIES[route.to];
    
    if (!fromCity || !toCity) {
        console.warn(`City not found: ${route.from} or ${route.to}`);
        return;
    }
    
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
    
    if (!isClaimed && routeIndex !== undefined) {
        routeLine.onclick = () => {
            gameState.selectedRoute = routeIndex;
            renderMap();
        };
    }
    
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
}

function getRouteColor(colorName) {
    const colors = {
        'red': '#e74c3c',
        'blue': '#3498db',
        'green': '#2ecc71',
        'yellow': '#f1c40f',
        'orange': '#e67e22',
        'pink': '#e91e63',
        'white': '#ecf0f1',
        'black': '#2c3e50',
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
    const ticketsEl = document.getElementById('destination-tickets');
    
    if (cardsEl) {
        const cardCounts = {};
        gameState.trainCards.forEach(card => {
            cardCounts[card] = (cardCounts[card] || 0) + 1;
        });
        if (Object.keys(cardCounts).length === 0) {
            cardsEl.innerHTML = '<p style="color: #999; font-size: 0.9em;">Draw cards to get started</p>';
        } else {
            cardsEl.innerHTML = Object.keys(cardCounts).map(color => 
                `<span style="background: ${getRouteColor(color)}; padding: 5px 10px; margin: 2px; border-radius: 5px; display: inline-block; color: ${color === 'white' || color === 'yellow' ? '#000' : '#fff'}; font-weight: bold;">
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
    
    if (ticketsEl) {
        if (gameState.destinationTickets.length === 0) {
            ticketsEl.innerHTML = '<p style="color: #999; font-size: 0.9em;">No destination tickets</p>';
        } else {
            ticketsEl.innerHTML = gameState.destinationTickets.map(ticket => {
                const completed = isRouteComplete(ticket.from, ticket.to);
                return `<div style="background: ${completed ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 255, 255, 0.1)'}; padding: 8px; margin: 5px 0; border-radius: 5px; border: 2px solid ${completed ? '#2ecc71' : 'rgba(255, 215, 0, 0.5)'};">
                    <strong>${ticket.from} → ${ticket.to}</strong><br>
                    <span style="color: ${completed ? '#2ecc71' : '#FFD700'}; font-size: 0.9em;">
                        ${completed ? '✓ Completed' : 'Incomplete'}: ${ticket.points > 0 ? '+' : ''}${ticket.points} points
                    </span>
                </div>`;
            }).join('');
        }
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
function endGame() {
    gameState.gameActive = false;
    
    // Check final destination tickets
    gameState.destinationTickets.forEach(ticket => {
        if (!isRouteComplete(ticket.from, ticket.to)) {
            gameState.points -= ticket.points; // Subtract points for incomplete tickets
        }
    });
    
    updateDisplay();
    updateStatus(`Game Over! Final Score: ${gameState.points} points!`);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
