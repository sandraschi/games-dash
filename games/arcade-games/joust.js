// Joust Game
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false
};

// Platforms
let platforms = [];

// Player
const player = {
    x: 200,
    y: 300,
    width: 30,
    height: 25,
    vx: 0,
    vy: 0,
    onPlatform: false,
    flapping: false,
    direction: 1
};

// Enemies
let enemies = [];
let eggs = [];

const keys = {};
const GRAVITY = 0.3;
const FLAP_FORCE = -5;

function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    enemies = [];
    eggs = [];
    
    // Create platforms
    platforms = [
        {x: 0, y: canvas.height - 50, width: canvas.width, height: 20},
        {x: 100, y: 400, width: 200, height: 20},
        {x: 500, y: 300, width: 200, height: 20},
        {x: 200, y: 200, width: 150, height: 20}
    ];
    
    // Create enemies
    for (let i = 0; i < 3 + gameState.level; i++) {
        enemies.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - 200) + 100,
            width: 30,
            height: 25,
            vx: (Math.random() - 0.5) * 2,
            vy: 0,
            onPlatform: false,
            flapping: false,
            direction: Math.random() < 0.5 ? -1 : 1
        });
    }
    
    player.x = 200;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    
    updateDisplay();
}

function drawPlatforms() {
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.direction, 1);
    
    // Draw ostrich
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
    
    // Draw wings
    if (player.flapping) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-player.width/2 - 10, -5, 10, 15);
        ctx.fillRect(player.width/2, -5, 10, 15);
    }
    
    // Draw lance
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.direction * player.width/2, 0);
    ctx.lineTo(player.direction * (player.width/2 + 20), 0);
    ctx.stroke();
    
    ctx.restore();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.scale(enemy.direction, 1);
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
        
        if (enemy.flapping) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(-enemy.width/2 - 10, -5, 10, 15);
            ctx.fillRect(enemy.width/2, -5, 10, 15);
        }
        
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(enemy.direction * enemy.width/2, 0);
        ctx.lineTo(enemy.direction * (enemy.width/2 + 20), 0);
        ctx.stroke();
        
        ctx.restore();
    });
}

function drawEggs() {
    eggs.forEach(egg => {
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(egg.x, egg.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updatePlayer() {
    // Horizontal movement
    if (keys['ArrowLeft']) {
        player.vx = -3;
        player.direction = -1;
    } else if (keys['ArrowRight']) {
        player.vx = 3;
        player.direction = 1;
    } else {
        player.vx *= 0.9;
    }
    
    // Flap
    if (keys[' ']) {
        player.vy += FLAP_FORCE * 0.3;
        player.flapping = true;
    } else {
        player.flapping = false;
    }
    
    // Gravity
    player.vy += GRAVITY;
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    
    // Check platform collision
    player.onPlatform = false;
    platforms.forEach(platform => {
        if (player.x + player.width/2 > platform.x &&
            player.x - player.width/2 < platform.x + platform.width &&
            player.y + player.height/2 > platform.y &&
            player.y + player.height/2 < platform.y + platform.height &&
            player.vy > 0) {
            player.y = platform.y - player.height/2;
            player.vy = 0;
            player.onPlatform = true;
        }
    });
    
    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width) player.x = canvas.width;
    if (player.y > canvas.height) {
        gameState.lives--;
        if (gameState.lives <= 0) {
            gameState.gameOver = true;
            gameState.running = false;
        } else {
            player.x = 200;
            player.y = 300;
            player.vx = 0;
            player.vy = 0;
        }
    }
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        // AI movement
        enemy.vx += (Math.random() - 0.5) * 0.2;
        enemy.vx = Math.max(-3, Math.min(3, enemy.vx));
        
        if (Math.random() < 0.02) {
            enemy.vy += FLAP_FORCE * 0.3;
            enemy.flapping = true;
        } else {
            enemy.flapping = false;
        }
        
        if (enemy.vx > 0) enemy.direction = 1;
        if (enemy.vx < 0) enemy.direction = -1;
        
        enemy.vy += GRAVITY;
        
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        
        // Platform collision
        enemy.onPlatform = false;
        platforms.forEach(platform => {
            if (enemy.x + enemy.width/2 > platform.x &&
                enemy.x - enemy.width/2 < platform.x + platform.width &&
                enemy.y + enemy.height/2 > platform.y &&
                enemy.y + enemy.height/2 < platform.y + platform.height &&
                enemy.vy > 0) {
                enemy.y = platform.y - enemy.height/2;
                enemy.vy = 0;
                enemy.onPlatform = true;
            }
        });
        
        // Boundaries
        if (enemy.x < 0 || enemy.x > canvas.width) enemy.vx *= -1;
    });
}

function updateEggs() {
    eggs.forEach((egg, index) => {
        egg.vy += GRAVITY;
        egg.y += egg.vy;
        
        if (egg.y > canvas.height) {
            eggs.splice(index, 1);
        }
    });
}

function checkCollisions() {
    // Player vs enemies (jousting)
    enemies.forEach((enemy, index) => {
        const dist = Math.sqrt(
            Math.pow(player.x - enemy.x, 2) +
            Math.pow(player.y - enemy.y, 2)
        );
        
        if (dist < 40) {
            // Check who's higher
            if (player.y < enemy.y) {
                // Player wins
                gameState.score += 500;
                eggs.push({
                    x: enemy.x,
                    y: enemy.y,
                    vy: 0
                });
                enemies.splice(index, 1);
            } else {
                // Enemy wins
                gameState.lives--;
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                    gameState.running = false;
                } else {
                    player.x = 200;
                    player.y = 300;
                    player.vx = 0;
                    player.vy = 0;
                }
            }
        }
    });
    
    // Check win condition
    if (enemies.length === 0 && eggs.length === 0) {
        nextLevel();
    }
}

function nextLevel() {
    gameState.level++;
    initGame();
}

function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateEnemies();
    updateEggs();
    checkCollisions();
    
    drawPlatforms();
    drawEnemies();
    drawEggs();
    drawPlayer();
    
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
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('level').textContent = gameState.level;
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
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

