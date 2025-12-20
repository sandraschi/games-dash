// Risk Game Logic - Full 42 Territories
// Based on standard Risk board game

const TERRITORIES = [
    // North America (9 territories)
    'Alaska', 'Northwest Territory', 'Greenland', 'Alberta', 'Ontario', 
    'Quebec', 'Western United States', 'Eastern United States', 'Central America',
    
    // South America (4 territories)
    'Venezuela', 'Peru', 'Brazil', 'Argentina',
    
    // Europe (7 territories)
    'Iceland', 'Great Britain', 'Scandinavia', 'Ukraine', 
    'Western Europe', 'Southern Europe', 'Northern Europe',
    
    // Africa (6 territories)
    'North Africa', 'Egypt', 'East Africa', 'Congo', 'South Africa', 'Madagascar',
    
    // Asia (12 territories)
    'Middle East', 'Afghanistan', 'Ural', 'Siberia', 'Yakutsk', 'Irkutsk',
    'Mongolia', 'Japan', 'Kamchatka', 'China', 'India', 'Siam',
    
    // Australia (4 territories)
    'Indonesia', 'New Guinea', 'Western Australia', 'Eastern Australia'
];

// Continent bonuses (armies per turn for controlling entire continent)
const CONTINENT_BONUSES = {
    'North America': 5,
    'South America': 2,
    'Europe': 5,
    'Africa': 3,
    'Asia': 7,
    'Australia': 2
};

// Territory to continent mapping
const TERRITORY_CONTINENTS = {
    // North America
    'Alaska': 'North America', 'Northwest Territory': 'North America',
    'Greenland': 'North America', 'Alberta': 'North America',
    'Ontario': 'North America', 'Quebec': 'North America',
    'Western United States': 'North America', 'Eastern United States': 'North America',
    'Central America': 'North America',
    // South America
    'Venezuela': 'South America', 'Peru': 'South America',
    'Brazil': 'South America', 'Argentina': 'South America',
    // Europe
    'Iceland': 'Europe', 'Great Britain': 'Europe', 'Scandinavia': 'Europe',
    'Ukraine': 'Europe', 'Western Europe': 'Europe', 'Southern Europe': 'Europe',
    'Northern Europe': 'Europe',
    // Africa
    'North Africa': 'Africa', 'Egypt': 'Africa', 'East Africa': 'Africa',
    'Congo': 'Africa', 'South Africa': 'Africa', 'Madagascar': 'Africa',
    // Asia
    'Middle East': 'Asia', 'Afghanistan': 'Asia', 'Ural': 'Asia',
    'Siberia': 'Asia', 'Yakutsk': 'Asia', 'Irkutsk': 'Asia',
    'Mongolia': 'Asia', 'Japan': 'Asia', 'Kamchatka': 'Asia',
    'China': 'Asia', 'India': 'Asia', 'Siam': 'Asia',
    // Australia
    'Indonesia': 'Australia', 'New Guinea': 'Australia',
    'Western Australia': 'Australia', 'Eastern Australia': 'Australia'
};

// Territory positions on world map (percentage coordinates)
const TERRITORY_POSITIONS = {
    // North America
    'Alaska': { x: 8, y: 15 },
    'Northwest Territory': { x: 18, y: 18 },
    'Greenland': { x: 35, y: 8 },
    'Alberta': { x: 18, y: 25 },
    'Ontario': { x: 25, y: 22 },
    'Quebec': { x: 30, y: 18 },
    'Western United States': { x: 15, y: 35 },
    'Eastern United States': { x: 25, y: 35 },
    'Central America': { x: 20, y: 45 },

    // South America
    'Venezuela': { x: 28, y: 55 },
    'Peru': { x: 25, y: 70 },
    'Brazil': { x: 32, y: 65 },
    'Argentina': { x: 28, y: 85 },

    // Europe
    'Iceland': { x: 42, y: 15 },
    'Great Britain': { x: 45, y: 22 },
    'Scandinavia': { x: 52, y: 15 },
    'Ukraine': { x: 58, y: 25 },
    'Western Europe': { x: 48, y: 32 },
    'Southern Europe': { x: 52, y: 35 },
    'Northern Europe': { x: 52, y: 22 },

    // Africa
    'North Africa': { x: 50, y: 45 },
    'Egypt': { x: 58, y: 42 },
    'East Africa': { x: 60, y: 55 },
    'Congo': { x: 55, y: 65 },
    'South Africa': { x: 55, y: 80 },
    'Madagascar': { x: 65, y: 75 },

    // Asia
    'Middle East': { x: 62, y: 42 },
    'Afghanistan': { x: 68, y: 35 },
    'Ural': { x: 65, y: 25 },
    'Siberia': { x: 75, y: 18 },
    'Yakutsk': { x: 82, y: 15 },
    'Irkutsk': { x: 78, y: 22 },
    'Mongolia': { x: 78, y: 28 },
    'Japan': { x: 88, y: 32 },
    'Kamchatka': { x: 90, y: 18 },
    'China': { x: 78, y: 35 },
    'India': { x: 72, y: 45 },
    'Siam': { x: 78, y: 48 },

    // Australia
    'Indonesia': { x: 80, y: 65 },
    'New Guinea': { x: 88, y: 60 },
    'Western Australia': { x: 82, y: 78 },
    'Eastern Australia': { x: 88, y: 75 }
};

// Game state
let gameState = {
    territories: {},
    selectedTerritory: null,
    currentPlayer: 'player',
    playerTroops: 0,
    aiTroops: 0,
    phase: 'deploy', // deploy, attack, fortify
    gameActive: true
};

// Initialize game
function newGame() {
    // Initialize all 42 territories
    TERRITORIES.forEach(territory => {
        gameState.territories[territory] = {
            owner: null,
            troops: 0,
            continent: TERRITORY_CONTINENTS[territory]
        };
    });
    
    // Random initial distribution (player gets 14, AI gets 14, rest neutral)
    const shuffled = [...TERRITORIES].sort(() => Math.random() - 0.5);
    shuffled.forEach((territory, index) => {
        if (index < 14) {
            gameState.territories[territory].owner = 'player';
            gameState.territories[territory].troops = 1;
        } else if (index < 28) {
            gameState.territories[territory].owner = 'ai';
            gameState.territories[territory].troops = 1;
        } else {
            // Neutral territories (14 remaining)
            gameState.territories[territory].owner = 'neutral';
            gameState.territories[territory].troops = 1;
        }
    });
    
    gameState.selectedTerritory = null;
    gameState.currentPlayer = 'player';
    gameState.phase = 'deploy';
    gameState.gameActive = true;
    gameState.playerTroops = 5;
    gameState.aiTroops = 5;
    
    updateDisplay();
    updateStatus('Deploy your troops! Click on your territories.');
}

// Select territory
function selectTerritory(territory) {
    if (!gameState.gameActive) return;
    
    const terr = gameState.territories[territory];
    
    if (gameState.phase === 'deploy') {
        if (terr.owner === gameState.currentPlayer) {
            if (gameState.currentPlayer === 'player' && gameState.playerTroops > 0) {
                terr.troops++;
                gameState.playerTroops--;
                updateDisplay();
                if (gameState.playerTroops === 0) {
                    gameState.phase = 'attack';
                    updateStatus('Deployment complete! Select territory to attack from.');
                }
            }
        }
    } else if (gameState.phase === 'attack') {
        if (terr.owner === gameState.currentPlayer && terr.troops > 1) {
            gameState.selectedTerritory = territory;
            updateDisplay();
            updateStatus('Select enemy or neutral territory to attack!');
        } else if (gameState.selectedTerritory && terr.owner !== gameState.currentPlayer && terr.owner !== null) {
            attackTerritory(gameState.selectedTerritory, territory);
        }
    } else if (gameState.phase === 'fortify') {
        if (terr.owner === gameState.currentPlayer) {
            if (gameState.selectedTerritory) {
                if (gameState.selectedTerritory === territory) {
                    gameState.selectedTerritory = null;
                } else {
                    fortifyTerritory(gameState.selectedTerritory, territory);
                }
            } else {
                gameState.selectedTerritory = territory;
            }
            updateDisplay();
        }
    }
}

// Attack territory
function attackTerritory(from, to) {
    const fromTerr = gameState.territories[from];
    const toTerr = gameState.territories[to];
    
    if (fromTerr.troops <= 1) {
        updateStatus('Need at least 2 troops to attack!');
        return;
    }
    
    // Simplified combat: attacker wins if they have more troops
    const attackerDice = Math.min(3, fromTerr.troops - 1);
    const defenderDice = Math.min(2, toTerr.troops);
    
    const attackerRoll = Math.floor(Math.random() * 6) + 1;
    const defenderRoll = Math.floor(Math.random() * 6) + 1;
    
    if (attackerRoll > defenderRoll) {
        // Attacker wins
        toTerr.owner = gameState.currentPlayer;
        toTerr.troops = fromTerr.troops - 1;
        fromTerr.troops = 1;
        updateStatus(`🎉 Captured ${to}!`);
    } else {
        // Defender wins
        fromTerr.troops = 1;
        toTerr.troops -= 1;
        if (toTerr.troops <= 0) {
            toTerr.owner = gameState.currentPlayer;
            toTerr.troops = 1;
            updateStatus(`🎉 Captured ${to}!`);
        } else {
            updateStatus(`❌ Attack failed!`);
        }
    }
    
    gameState.selectedTerritory = null;
    updateDisplay();
    
    // Check win
    if (Object.values(gameState.territories).every(t => t.owner === 'player')) {
        endGame('player');
    } else if (Object.values(gameState.territories).every(t => t.owner === 'ai')) {
        endGame('ai');
    }
}

// Fortify territory
function fortifyTerritory(from, to) {
    const fromTerr = gameState.territories[from];
    const toTerr = gameState.territories[to];
    
    if (fromTerr.troops <= 1) {
        updateStatus('Need at least 2 troops to fortify!');
        return;
    }
    
    const moveTroops = Math.floor((fromTerr.troops - 1) / 2);
    fromTerr.troops -= moveTroops;
    toTerr.troops += moveTroops;
    
    gameState.selectedTerritory = null;
    updateDisplay();
    updateStatus(`Moved ${moveTroops} troops from ${from} to ${to}.`);
}

// End turn
function endTurn() {
    if (gameState.currentPlayer === 'player') {
        gameState.currentPlayer = 'ai';
        gameState.phase = 'deploy';
        gameState.aiTroops = 5;
        updateStatus('AI turn...');
        setTimeout(() => aiTurn(), 1000);
    } else {
        gameState.currentPlayer = 'player';
        gameState.phase = 'deploy';
        gameState.playerTroops = 5;
        updateStatus('Your turn! Deploy troops.');
    }
    gameState.selectedTerritory = null;
    updateDisplay();
}

// AI turn
function aiTurn() {
    // Deploy troops
    const aiTerritories = TERRITORIES.filter(t => gameState.territories[t].owner === 'ai');
    while (gameState.aiTroops > 0) {
        const randomTerr = aiTerritories[Math.floor(Math.random() * aiTerritories.length)];
        gameState.territories[randomTerr].troops++;
        gameState.aiTroops--;
    }
    
    // Attack
    gameState.phase = 'attack';
    const attackFrom = aiTerritories.find(t => gameState.territories[t].troops > 1);
    if (attackFrom) {
        const enemyTerritories = TERRITORIES.filter(t => gameState.territories[t].owner === 'player');
        if (enemyTerritories.length > 0) {
            const attackTo = enemyTerritories[Math.floor(Math.random() * enemyTerritories.length)];
            attackTerritory(attackFrom, attackTo);
        }
    }
    
    setTimeout(() => {
        endTurn();
    }, 2000);
}

// Update display
function updateDisplay() {
    const mapEl = document.getElementById('world-map');
    if (!mapEl) {
        console.error('world-map element not found!');
        return;
    }
    
    mapEl.innerHTML = '';
    
    // Ensure territories are initialized
    if (!gameState.territories || Object.keys(gameState.territories).length === 0) {
        console.error('Territories not initialized!');
        return;
    }
    
    console.log('Rendering territories:', TERRITORIES.length, 'territories');
    
    TERRITORIES.forEach((territory) => {
        const terr = gameState.territories[territory];
        if (!terr) {
            console.error(`Territory ${territory} not found in gameState!`);
            return;
        }

        const position = TERRITORY_POSITIONS[territory];
        if (!position) {
            console.warn(`No position defined for territory: ${territory}`);
            return;
        }

        const cell = document.createElement('div');
        cell.className = 'territory';
        cell.style.left = `${position.x}%`;
        cell.style.top = `${position.y}%`;
        cell.style.position = 'absolute';
        cell.style.transform = 'translate(-50%, -50%)';

        // Add ownership classes
        if (terr.owner === 'player') {
            cell.classList.add('player-owned');
        } else if (terr.owner === 'ai') {
            cell.classList.add('ai-owned');
        } else if (terr.owner === 'neutral') {
            cell.classList.add('neutral-owned');
        }

        if (gameState.selectedTerritory === territory) {
            cell.classList.add('selected');
        }

        // Format territory name (split long names)
        const nameParts = territory.split(' ');
        const displayName = nameParts.length > 1 ?
            nameParts.slice(0, -1).join(' ') + '\n' + nameParts[nameParts.length - 1] :
            territory;

        cell.innerHTML = `
            <div class="territory-name">${displayName}</div>
            <div class="troop-count">${terr.troops || 0}</div>
        `;

        cell.onclick = () => selectTerritory(territory);
        cell.title = `${territory} (${TERRITORY_CONTINENTS[territory]}) - ${terr.troops || 0} troops`;

        mapEl.appendChild(cell);
    });
    
    console.log('Total territories rendered:', mapEl.children.length);
    
    // Update info
    const playerTerrs = TERRITORIES.filter(t => gameState.territories[t].owner === 'player').length;
    const aiTerrs = TERRITORIES.filter(t => gameState.territories[t].owner === 'ai').length;
    const playerTroops = TERRITORIES.filter(t => gameState.territories[t].owner === 'player')
        .reduce((sum, t) => sum + gameState.territories[t].troops, 0);
    const aiTroops = TERRITORIES.filter(t => gameState.territories[t].owner === 'ai')
        .reduce((sum, t) => sum + gameState.territories[t].troops, 0);
    
    document.getElementById('player-territories').textContent = playerTerrs;
    document.getElementById('player-troops').textContent = playerTroops;
    document.getElementById('ai-territories').textContent = aiTerrs;
    document.getElementById('ai-troops').textContent = aiTroops;
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame(winner) {
    gameState.gameActive = false;
    if (winner === 'player') {
        updateStatus('🎉 You conquered the world!');
    } else {
        updateStatus('💀 AI conquered the world!');
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            newGame();
        }, 100);
    });
} else {
    setTimeout(() => {
        newGame();
    }, 100);
}
