// Missile Command Game
// **Timestamp**: 2025-12-04

let canvas, ctx;

let gameState = {
    running: false,
    paused: false,
    score: 0,
    cities: 6,
    missiles: 10,
    level: 1,
    gameOver: false,
    waveComplete: false,
    totalEnemiesSpawned: 0,
    enemiesDestroyed: 0,
    aiEnabled: false,
    gameStartTime: null,
    missilesFired: 0
};

// Cities (bottom of screen)
let cities = [];
let CITY_Y = 570; // Will be set when canvas is initialized
let CITY_SPACING = 114; // Will be set when canvas is initialized

// Player missiles
let playerMissiles = [];

// Enemy missiles
let enemyMissiles = [];

// Explosions
let explosions = [];
let explosionIdCounter = 0;

// Bases (launch pads)
let bases = [];

function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return false;
    }
    ctx = canvas.getContext('2d');
    CITY_Y = canvas.height - 30;
    CITY_SPACING = canvas.width / 7;
    return true;
}

function initGame() {
    if (!canvas || !ctx) {
        if (!initCanvas()) {
            console.error('Failed to initialize canvas');
            return;
        }
    }

    gameState.score = 0;
    gameState.cities = 6;
    gameState.missiles = 10;
    gameState.level = 1;
    gameState.gameOver = false;
    gameState.waveComplete = false;
    gameState.totalEnemiesSpawned = 0;
    gameState.enemiesDestroyed = 0;
    gameState.gameStartTime = null;
    gameState.missilesFired = 0;
    playerMissiles = [];
    enemyMissiles = [];
    explosions = [];

    // Create cities
    cities = [];
    for (let i = 0; i < 6; i++) {
        cities.push({
            x: CITY_SPACING * (i + 1) - 20,
            y: CITY_Y,
            width: 40,
            height: 30,
            alive: true
        });
    }

    // Create bases
    bases = [];
    for (let i = 0; i < 3; i++) {
        bases.push({
            x: CITY_SPACING * (i * 2 + 1) - 15,
            y: CITY_Y - 10,
            width: 30,
            height: 20,
            alive: true
        });
    }

    updateDisplay();
}

function drawCities() {
    cities.forEach(city => {
        if (!city.alive) return;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(city.x, city.y, city.width, city.height);
        // Draw building shape
        ctx.fillRect(city.x + 5, city.y - 10, 10, 10);
        ctx.fillRect(city.x + 25, city.y - 10, 10, 10);
    });
}

function drawBases() {
    bases.forEach(base => {
        if (!base.alive) return;
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(base.x, base.y, base.width, base.height);
    });
}

function drawPlayerMissiles() {
    playerMissiles.forEach(missile => {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(missile.startX, missile.startY);
        ctx.lineTo(missile.x, missile.y);
        ctx.stroke();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(missile.x - 2, missile.y - 2, 4, 4);
    });
}

function drawEnemyMissiles() {
    enemyMissiles.forEach(missile => {
        // Draw trail
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(missile.startX, missile.startY);
        ctx.lineTo(missile.x, missile.y);
        ctx.stroke();
        
        // Draw missile head (larger and brighter)
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bright center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawExplosions() {
    explosions.forEach(explosion => {
        const alpha = 1 - (explosion.age / explosion.maxAge);
        ctx.fillStyle = `rgba(255, ${255 * alpha}, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updatePlayerMissiles() {
    // Iterate backwards to safely remove items
    for (let i = playerMissiles.length - 1; i >= 0; i--) {
        const missile = playerMissiles[i];
        const dx = missile.targetX - missile.startX;
        const dy = missile.targetY - missile.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const progress = missile.traveled / dist;
        
        if (progress >= 1) {
            // Reached target - explode (player explosion)
            explosions.push({
                id: explosionIdCounter++,
                x: missile.targetX,
                y: missile.targetY,
                radius: 0,
                maxRadius: 50,
                age: 0,
                maxAge: 45, // Longer explosion duration
                isPlayer: true
            });
            playerMissiles.splice(i, 1);
        } else {
            missile.x = missile.startX + dx * progress;
            missile.y = missile.startY + dy * progress;
            missile.traveled += missile.speed;
        }
    }
}

function updateEnemyMissiles() {
    // Iterate backwards to safely remove items
    for (let i = enemyMissiles.length - 1; i >= 0; i--) {
        const missile = enemyMissiles[i];
        missile.x += missile.vx;
        missile.y += missile.vy;
        
        // Check if reached target or hit ground
        if (missile.y >= missile.targetY || missile.y > canvas.height) {
            // Hit ground or target - explode (enemy explosion)
            explosions.push({
                id: explosionIdCounter++,
                x: missile.x,
                y: missile.y >= canvas.height ? canvas.height : missile.targetY,
                radius: 0,
                maxRadius: 40,
                age: 0,
                maxAge: 45, // Longer explosion duration
                isPlayer: false
            });
            enemyMissiles.splice(i, 1);
        }
    }
}

function updateExplosions() {
    // Iterate backwards to safely remove items
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.age++;
        explosion.radius = (explosion.age / explosion.maxAge) * explosion.maxRadius;
        
        // Slower explosion fade (longer duration)
        if (explosion.age >= explosion.maxAge) {
            explosions.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Player explosions vs enemy missiles (only check player explosions)
    explosions.forEach(explosion => {
        if (!explosion.isPlayer) return;
        
        // Iterate backwards to safely remove items
        for (let i = enemyMissiles.length - 1; i >= 0; i--) {
            const missile = enemyMissiles[i];
            const dist = Math.sqrt(
                Math.pow(missile.x - explosion.x, 2) +
                Math.pow(missile.y - explosion.y, 2)
            );
            
            if (dist < explosion.radius) {
                gameState.score += 25;
                gameState.enemiesDestroyed++;
                enemyMissiles.splice(i, 1);
            }
        }
    });
    
    // Enemy explosions vs cities and bases (only check enemy explosions)
    explosions.forEach(explosion => {
        if (explosion.isPlayer) return;
        
        // Check cities
        cities.forEach(city => {
            if (!city.alive) return;
            const dist = Math.sqrt(
                Math.pow(city.x + city.width/2 - explosion.x, 2) +
                Math.pow(city.y + city.height/2 - explosion.y, 2)
            );
            
            if (dist < explosion.radius) {
                city.alive = false;
                gameState.cities--;
            }
        });
        
        // Check bases
        bases.forEach(base => {
            if (!base.alive) return;
            const dist = Math.sqrt(
                Math.pow(base.x + base.width/2 - explosion.x, 2) +
                Math.pow(base.y + base.height/2 - explosion.y, 2)
            );
            
            if (dist < explosion.radius) {
                base.alive = false;
            }
        });
    });
    
    // Check win condition: all enemy missiles destroyed and wave cleared
    // Only advance level if we've actually spawned and cleared ALL enemies for this wave
    if (enemyMissiles.length === 0 && explosions.length === 0 && gameState.cities > 0 &&
        gameState.totalEnemiesSpawned > 0 && gameState.enemiesDestroyed >= gameState.totalEnemiesSpawned &&
        !gameState.waveComplete) {
        // Check if we have any alive bases to continue
        const aliveBases = bases.filter(b => b.alive);
        if (aliveBases.length > 0) {
            gameState.waveComplete = true;
            setTimeout(nextLevel, 2000); // Delay level advance for dramatic effect
        }
    }
    
    // Check lose condition
    if (gameState.cities === 0) {
        gameState.gameOver = true;
        gameState.running = false;
        saveGameHistory();
    }
}

function spawnEnemyMissiles() {
    // Only spawn if wave is not complete
    if (gameState.waveComplete) return;

    // Calculate target number of enemies for this level (start small, increase gradually)
    const targetEnemies = Math.min(3 + gameState.level * 2, 8 + gameState.level); // Cap at reasonable numbers

    // Spawn enemies slowly
    if (enemyMissiles.length < targetEnemies && Math.random() < 0.01) { // Slower spawn rate
        // Find alive cities to target
        const aliveCities = cities.filter(c => c.alive);
        if (aliveCities.length === 0) return;
        
        const targetCity = aliveCities[Math.floor(Math.random() * aliveCities.length)];
        const startX = Math.random() * canvas.width;
        const targetX = targetCity.x + targetCity.width / 2;
        const targetY = targetCity.y;
        
        // Calculate velocity to reach target
        const distance = Math.sqrt(
            Math.pow(targetX - startX, 2) + Math.pow(targetY - 0, 2)
        );
        const speed = 0.5 + gameState.level * 0.08; // Much slower base speed
        const timeToTarget = distance / speed;
        
        enemyMissiles.push({
            startX: startX,
            startY: 0,
            x: startX,
            y: 0,
            targetX: targetX,
            targetY: targetY,
            vx: (targetX - startX) / timeToTarget,
            vy: (targetY - 0) / timeToTarget
        });

        gameState.totalEnemiesSpawned++;
    }
}

function nextLevel() {
    gameState.level++;
    gameState.missiles = Math.min(10 + gameState.level * 2, 30); // Bonus missiles per level, capped at 30
    gameState.waveComplete = false;
    gameState.totalEnemiesSpawned = 0;
    gameState.enemiesDestroyed = 0;
    enemyMissiles = [];
    explosions = [];
    playerMissiles = [];

    // Reset cities and bases for next level (they stay destroyed)
    // This is correct - destroyed cities/bases don't come back

    updateDisplay();

    // Show level message briefly
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFD700';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${gameState.level}`, canvas.width / 2, canvas.height / 2);

    // Spawn initial wave after a delay
    setTimeout(() => {
        const initialSpawn = Math.min(3 + Math.floor(gameState.level / 2), 6); // Gradual increase
        for (let i = 0; i < initialSpawn; i++) {
            spawnEnemyMissiles();
        }
    }, 1000);
}

let lastFrameTime = 0;
const targetFPS = 20; // Limit to 20 FPS for much slower gameplay
const frameInterval = 1000 / targetFPS;

function gameLoop(currentTime) {
    if (!gameState.running || gameState.paused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Frame rate limiting
    const elapsed = currentTime - lastFrameTime;
    if (elapsed < frameInterval) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastFrameTime = currentTime - (elapsed % frameInterval);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updatePlayerMissiles();
    updateEnemyMissiles();
    updateExplosions();
    spawnEnemyMissiles();
    aiThink(); // AI decision making
    checkCollisions();
    
    drawCities();
    drawBases();
    drawEnemyMissiles();
    drawPlayerMissiles();
    drawExplosions();
    
    if (gameState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FF0000';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = '#FFD700';
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 50);
    }
    
    updateDisplay();
    requestAnimationFrame(gameLoop);
}

function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('cities').textContent = gameState.cities;
    document.getElementById('missiles').textContent = gameState.missiles;
    document.getElementById('level').textContent = gameState.level;
}

function setupCanvasClick() {
    if (!canvas) return;
    // Remove existing listener if any
    canvas.removeEventListener('click', handleCanvasClick);
    canvas.addEventListener('click', handleCanvasClick);
}

function handleCanvasClick(e) {
    if (!gameState.running || gameState.paused || gameState.missiles <= 0) return;
    
    // Check if we have any alive bases
    const aliveBases = bases.filter(b => b.alive);
    if (aliveBases.length === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    
    // Find nearest alive base
    let nearestBase = null;
    let minDist = Infinity;
    aliveBases.forEach(base => {
        const dist = Math.abs(base.x + base.width/2 - targetX);
        if (dist < minDist) {
            minDist = dist;
            nearestBase = base;
        }
    });
    
    if (nearestBase) {
            playerMissiles.push({
                startX: nearestBase.x + nearestBase.width / 2,
                startY: nearestBase.y,
                x: nearestBase.x + nearestBase.width / 2,
                y: nearestBase.y,
                targetX: targetX,
                targetY: targetY,
                traveled: 0,
                speed: 2
            });
            gameState.missiles--;
            gameState.missilesFired++;
            updateDisplay();
    }
}

function startGame() {
    if (!canvas || !ctx) {
        if (!initCanvas()) {
            alert('Failed to initialize game canvas!');
            return;
        }
        setupCanvasClick();
    }
    
    if (gameState.running && !gameState.paused) return;
    
    if (gameState.gameOver || !gameState.running) {
        initGame();
        gameState.gameStartTime = Date.now(); // Record game start time
        // Spawn initial wave of enemies after a brief delay
        setTimeout(() => {
            for (let i = 0; i < 3 + gameState.level; i++) {
                spawnEnemyMissiles();
            }
        }, 500);
    }

    gameState.running = true;
    gameState.paused = false;
    gameState.gameOver = false;
    gameLoop();
}

function pauseGame() {
    if (!gameState.running) return;
    gameState.paused = !gameState.paused;
    if (!gameState.paused) {
        gameLoop();
    }
}

function toggleAI() {
    gameState.aiEnabled = !gameState.aiEnabled;
    const aiToggle = document.getElementById('aiToggle');
    const aiStatus = document.getElementById('aiStatus');

    if (gameState.aiEnabled) {
        aiStatus.textContent = 'ON';
        aiStatus.style.color = '#FFD700';
        aiToggle.checked = true;
    } else {
        aiStatus.textContent = 'OFF';
        aiStatus.style.color = '#666';
        aiToggle.checked = false;
    }
}

function aiThink() {
    if (!gameState.aiEnabled || !gameState.running || gameState.paused || gameState.missiles <= 0) return;

    // AI strategy: Target missiles that are closest to cities, but be more conservative
    const aliveBases = bases.filter(b => b.alive);
    if (aliveBases.length === 0) return;

    // Only fire if we have multiple missiles left (be conservative)
    if (gameState.missiles <= 2) return;

    // Find the most threatening missile (closest to any city)
    let mostThreatening = null;
    let minDistToCity = Infinity;

    enemyMissiles.forEach(missile => {
        cities.forEach(city => {
            if (!city.alive) return;
            const dist = Math.sqrt(
                Math.pow(missile.x - (city.x + city.width/2), 2) +
                Math.pow(missile.y - (city.y + city.height/2), 2)
            );
            if (dist < minDistToCity) {
                minDistToCity = dist;
                mostThreatening = missile;
            }
        });
    });

    // Only fire if missile is very close to cities (more conservative)
    if (mostThreatening && minDistToCity < 120 && Math.random() < 0.7) { // 70% chance to fire when appropriate
        // Find nearest alive base
        let nearestBase = null;
        let minDist = Infinity;
        aliveBases.forEach(base => {
            const dist = Math.abs(base.x + base.width/2 - mostThreatening.x);
            if (dist < minDist) {
                minDist = dist;
                nearestBase = base;
            }
        });

        if (nearestBase) {
            // AI fires at the missile with moderate inaccuracy
            const inaccuracy = 15; // Pixels of AI inaccuracy (reduced from 20)
            const targetX = mostThreatening.x + (Math.random() - 0.5) * inaccuracy * 2;
            const targetY = mostThreatening.y + (Math.random() - 0.5) * inaccuracy * 2;

            playerMissiles.push({
                startX: nearestBase.x + nearestBase.width / 2,
                startY: nearestBase.y,
                x: nearestBase.x + nearestBase.width / 2,
                y: nearestBase.y,
                targetX: Math.max(0, Math.min(canvas.width, targetX)),
                targetY: Math.max(0, Math.min(canvas.height, targetY)),
                traveled: 0,
                speed: 2
            });

            gameState.missiles--;
            gameState.missilesFired++;
            updateDisplay();
        }
    }
}

// Save game result to history
function saveGameHistory() {
    if (!gameState.gameStartTime) return;

    const timeSurvived = Math.round((Date.now() - gameState.gameStartTime) / 1000);

    // Check if global saveGameResult function exists (from history page)
    if (window.saveGameResult) {
        window.saveGameResult(
            gameState.score,
            gameState.level,
            gameState.cities,
            gameState.missilesFired,
            timeSurvived,
            gameState.aiEnabled
        );
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (initCanvas()) {
            setupCanvasClick();
            initGame();
        }
    });
} else {
    if (initCanvas()) {
        setupCanvasClick();
        initGame();
    }
}

