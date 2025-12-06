// Missile Command Game
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    running: false,
    paused: false,
    score: 0,
    cities: 6,
    missiles: 10,
    level: 1,
    gameOver: false
};

// Cities (bottom of screen)
let cities = [];
const CITY_Y = canvas.height - 30;
const CITY_SPACING = canvas.width / 7;

// Player missiles
let playerMissiles = [];

// Enemy missiles
let enemyMissiles = [];

// Explosions
let explosions = [];

// Bases (launch pads)
let bases = [];

function initGame() {
    gameState.score = 0;
    gameState.cities = 6;
    gameState.missiles = 10;
    gameState.level = 1;
    gameState.gameOver = false;
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
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(missile.startX, missile.startY);
        ctx.lineTo(missile.x, missile.y);
        ctx.stroke();
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(missile.x - 2, missile.y - 2, 4, 4);
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
    playerMissiles.forEach((missile, index) => {
        const dx = missile.targetX - missile.startX;
        const dy = missile.targetY - missile.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const progress = missile.traveled / dist;
        
        if (progress >= 1) {
            // Reached target - explode
            explosions.push({
                x: missile.targetX,
                y: missile.targetY,
                radius: 0,
                maxRadius: 50,
                age: 0,
                maxAge: 30
            });
            playerMissiles.splice(index, 1);
        } else {
            missile.x = missile.startX + dx * progress;
            missile.y = missile.startY + dy * progress;
            missile.traveled += missile.speed;
        }
    });
}

function updateEnemyMissiles() {
    enemyMissiles.forEach((missile, index) => {
        missile.x += missile.vx;
        missile.y += missile.vy;
        
        if (missile.y > canvas.height) {
            // Hit ground - explode
            explosions.push({
                x: missile.x,
                y: canvas.height,
                radius: 0,
                maxRadius: 40,
                age: 0,
                maxAge: 30
            });
            enemyMissiles.splice(index, 1);
        }
    });
}

function updateExplosions() {
    explosions.forEach((explosion, index) => {
        explosion.age++;
        explosion.radius = (explosion.age / explosion.maxAge) * explosion.maxRadius;
        
        if (explosion.age >= explosion.maxAge) {
            explosions.splice(index, 1);
        }
    });
}

function checkCollisions() {
    // Player explosions vs enemy missiles
    explosions.forEach(explosion => {
        enemyMissiles.forEach((missile, missileIndex) => {
            const dist = Math.sqrt(
                Math.pow(missile.x - explosion.x, 2) +
                Math.pow(missile.y - explosion.y, 2)
            );
            
            if (dist < explosion.radius) {
                gameState.score += 25;
                enemyMissiles.splice(missileIndex, 1);
            }
        });
    });
    
    // Enemy explosions vs cities
    explosions.forEach(explosion => {
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
        
        // Enemy explosions vs bases
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
    
    // Check win/lose conditions
    if (enemyMissiles.length === 0 && gameState.cities > 0) {
        nextLevel();
    }
    
    if (gameState.cities === 0) {
        gameState.gameOver = true;
        gameState.running = false;
    }
}

function spawnEnemyMissiles() {
    if (enemyMissiles.length < 5 + gameState.level && Math.random() < 0.02) {
        const targetCity = cities[Math.floor(Math.random() * cities.length)];
        if (targetCity && targetCity.alive) {
            enemyMissiles.push({
                startX: Math.random() * canvas.width,
                startY: 0,
                x: Math.random() * canvas.width,
                y: 0,
                targetX: targetCity.x + targetCity.width / 2,
                targetY: targetCity.y,
                vx: (targetCity.x - (Math.random() * canvas.width)) * 0.01,
                vy: 2 + gameState.level * 0.3
            });
        }
    }
}

function nextLevel() {
    gameState.level++;
    gameState.missiles = 10 + gameState.level;
    enemyMissiles = [];
    explosions = [];
}

function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updatePlayerMissiles();
    updateEnemyMissiles();
    updateExplosions();
    spawnEnemyMissiles();
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

canvas.addEventListener('click', (e) => {
    if (!gameState.running || gameState.paused || gameState.missiles <= 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    
    // Find nearest base
    let nearestBase = null;
    let minDist = Infinity;
    bases.forEach(base => {
        if (!base.alive) return;
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
            speed: 8
        });
        gameState.missiles--;
    }
});

function startGame() {
    if (gameState.running && !gameState.paused) return;
    
    if (gameState.gameOver || !gameState.running) {
        initGame();
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

initGame();

