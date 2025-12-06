// Defender Game (Simplified)
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    humans: 10,
    level: 1,
    gameOver: false,
    scrollX: 0
};

const player = {
    x: 100,
    y: canvas.height / 2,
    width: 30,
    height: 20,
    speed: 5,
    vx: 0,
    vy: 0,
    direction: 1
};

let bullets = [];
let enemies = [];
let humans = [];
let landers = [];
let explosions = [];

const keys = {};

function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.humans = 10;
    gameState.level = 1;
    gameState.gameOver = false;
    gameState.scrollX = 0;
    bullets = [];
    enemies = [];
    landers = [];
    explosions = [];
    
    // Create humans on ground
    humans = [];
    for (let i = 0; i < 10; i++) {
        humans.push({
            x: Math.random() * canvas.width * 2,
            y: canvas.height - 30,
            width: 15,
            height: 20,
            alive: true,
            captured: false
        });
    }
    
    // Create initial enemies
    spawnEnemies();
    
    player.x = 100;
    player.y = canvas.height / 2;
    player.vx = 0;
    player.vy = 0;
    
    updateDisplay();
}

function spawnEnemies() {
    for (let i = 0; i < 5 + gameState.level; i++) {
        enemies.push({
            x: Math.random() * canvas.width * 2,
            y: Math.random() * (canvas.height - 100) + 50,
            width: 25,
            height: 20,
            vx: -1 - gameState.level * 0.2,
            vy: (Math.random() - 0.5) * 2,
            type: 'lander',
            alive: true
        });
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.direction, 1);
    
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
    
    // Draw wings
    ctx.fillRect(-player.width/2 - 5, -5, 5, 10);
    ctx.fillRect(player.width/2, -5, 5, 10);
    
    ctx.restore();
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(bullet.x, bullet.y, 4, 4);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x - gameState.scrollX, enemy.y, enemy.width, enemy.height);
    });
}

function drawHumans() {
    humans.forEach(human => {
        if (!human.alive || human.captured) return;
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(human.x - gameState.scrollX, human.y, human.width, human.height);
    });
}

function drawExplosions() {
    explosions.forEach(explosion => {
        const alpha = 1 - (explosion.age / explosion.maxAge);
        ctx.fillStyle = `rgba(255, ${255 * alpha}, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x - gameState.scrollX, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updatePlayer() {
    if (keys['ArrowLeft']) {
        player.vx = -player.speed;
        player.direction = -1;
    } else if (keys['ArrowRight']) {
        player.vx = player.speed;
        player.direction = 1;
    } else {
        player.vx *= 0.9;
    }
    
    if (keys['ArrowUp']) {
        player.vy = -player.speed;
    } else if (keys['ArrowDown']) {
        player.vy = player.speed;
    } else {
        player.vy *= 0.9;
    }
    
    player.x += player.vx;
    player.y += player.vy;
    
    player.x = Math.max(50, Math.min(canvas.width - 50, player.x));
    player.y = Math.max(30, Math.min(canvas.height - 30, player.y));
    
    // Scroll world
    if (player.x > canvas.width * 0.7) {
        gameState.scrollX += player.vx;
    } else if (player.x < canvas.width * 0.3 && gameState.scrollX > 0) {
        gameState.scrollX += player.vx;
        gameState.scrollX = Math.max(0, gameState.scrollX);
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        return bullet.x > -100 && bullet.x < canvas.width + gameState.scrollX + 100 &&
               bullet.y > 0 && bullet.y < canvas.height;
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (!enemy.alive) return;
        
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        
        // Bounce off edges
        if (enemy.y < 30 || enemy.y > canvas.height - 30) {
            enemy.vy *= -1;
        }
        
        // Try to capture humans
        humans.forEach(human => {
            if (!human.alive || human.captured) return;
            const dist = Math.sqrt(
                Math.pow(enemy.x - human.x, 2) +
                Math.pow(enemy.y - human.y, 2)
            );
            if (dist < 50) {
                human.captured = true;
                // Convert to mutator
                enemies.push({
                    x: human.x,
                    y: human.y,
                    width: 20,
                    height: 20,
                    vx: -2,
                    vy: 0,
                    type: 'mutator',
                    alive: true
                });
            }
        });
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
    // Bullets vs enemies
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (!enemy.alive) return;
            
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + 4 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 4 > enemy.y) {
                
                enemy.alive = false;
                bullets.splice(bulletIndex, 1);
                
                explosions.push({
                    x: enemy.x,
                    y: enemy.y,
                    radius: 0,
                    maxRadius: 30,
                    age: 0,
                    maxAge: 20
                });
                
                gameState.score += enemy.type === 'mutator' ? 500 : 250;
            }
        });
    });
    
    // Enemies vs player
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        if (enemy.x - gameState.scrollX < player.x + player.width/2 &&
            enemy.x - gameState.scrollX + enemy.width > player.x - player.width/2 &&
            enemy.y < player.y + player.height/2 &&
            enemy.y + enemy.height > player.y - player.height/2) {
            
            gameState.lives--;
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                gameState.running = false;
            } else {
                player.x = 100;
                player.y = canvas.height / 2;
            }
        }
    });
    
    // Check win condition
    if (enemies.length === 0 && humans.filter(h => h.alive && !h.captured).length > 0) {
        nextLevel();
    }
}

function nextLevel() {
    gameState.level++;
    spawnEnemies();
}

function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    
    updatePlayer();
    updateBullets();
    updateEnemies();
    updateExplosions();
    checkCollisions();
    
    drawHumans();
    drawEnemies();
    drawPlayer();
    drawBullets();
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
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('humans').textContent = humans.filter(h => h.alive && !h.captured).length;
    document.getElementById('level').textContent = gameState.level;
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' && gameState.running && !gameState.paused) {
        e.preventDefault();
        bullets.push({
            x: player.x + (player.direction > 0 ? player.width/2 : -player.width/2),
            y: player.y,
            vx: player.direction * 10,
            vy: 0,
            width: 4,
            height: 4
        });
    }
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

