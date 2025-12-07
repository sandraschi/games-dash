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
    
    TERRITORIES.forEach((territory, index) => {
        const terr = gameState.territories[territory];
        if (!terr) {
            console.error(`Territory ${territory} not found in gameState!`);
            return;
        }
        
        const cell = document.createElement('div');
        cell.className = 'territory';
        cell.style.minHeight = '180px';
        cell.style.width = '100%';
        cell.style.flexShrink = '0';
        cell.style.boxSizing = 'border-box';
        
        if (terr.owner === 'player') {
            cell.classList.add('owned-player');
        } else if (terr.owner === 'ai') {
            cell.classList.add('owned-ai');
        } else if (terr.owner === 'neutral') {
            cell.style.background = 'rgba(128, 128, 128, 0.2)';
            cell.style.borderColor = 'rgba(128, 128, 128, 0.5)';
        }
        
        if (gameState.selectedTerritory === territory) {
            cell.classList.add('selected');
        }
        
        cell.innerHTML = `
            <div class="territory-name">${territory}</div>
            <div class="territory-troops">${terr.troops || 0}</div>
        `;
        
        cell.onclick = () => selectTerritory(territory);
        mapEl.appendChild(cell);
        console.log(`Added territory ${index + 1}: ${territory}`);
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
