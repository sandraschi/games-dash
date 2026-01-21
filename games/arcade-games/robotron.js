// Robotron 2084 Game
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    wave: 1,
    humans: 10,
    gameOver: false
};

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    speed: 4
};

// Humans
let humans = [];

// Enemies
let enemies = [];

// Bullets
let bullets = [];

const keys = {};

function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.wave = 1;
    gameState.humans = 10;
    gameState.gameOver = false;
    bullets = [];
    enemies = [];
    humans = [];
    
    // Create humans
    for (let i = 0; i < 10; i++) {
        humans.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20,
            width: 15,
            height: 20,
            alive: true
        });
    }
    
    // Create enemies
    spawnWave();
    
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    updateDisplay();
}

function spawnWave() {
    for (let i = 0; i < 20 + gameState.wave * 5; i++) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        if (side === 0) { x = -20; y = Math.random() * canvas.height; }
        else if (side === 1) { x = canvas.width + 20; y = Math.random() * canvas.height; }
        else if (side === 2) { x = Math.random() * canvas.width; y = -20; }
        else { x = Math.random() * canvas.width; y = canvas.height + 20; }
        
        enemies.push({
            x: x,
            y: y,
            width: 20,
            height: 20,
            vx: 0,
            vy: 0,
            type: Math.random() < 0.5 ? 'grunt' : 'hulk',
            alive: true
        });
    }
}

function drawPlayer() {
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(player.x - player.width/2, player.y - player.height/2, player.width, player.height);
    // Draw crosshair
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x - 15, player.y);
    ctx.lineTo(player.x + 15, player.y);
    ctx.moveTo(player.x, player.y - 15);
    ctx.lineTo(player.x, player.y + 15);
    ctx.stroke();
}

function drawHumans() {
    humans.forEach(human => {
        if (!human.alive) return;
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(human.x - human.width/2, human.y - human.height/2, human.width, human.height);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        ctx.fillStyle = enemy.type === 'grunt' ? '#FF0000' : '#FF00FF';
        ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2, enemy.width, enemy.height);
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
    });
}

function updatePlayer() {
    // Movement (WASD)
    let dx = 0, dy = 0;
    if (keys['w'] || keys['W']) dy = -player.speed;
    if (keys['s'] || keys['S']) dy = player.speed;
    if (keys['a'] || keys['A']) dx = -player.speed;
    if (keys['d'] || keys['D']) dx = player.speed;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }
    
    player.x += dx;
    player.y += dy;
    
    // Boundaries
    player.x = Math.max(player.width/2, Math.min(canvas.width - player.width/2, player.x));
    player.y = Math.max(player.height/2, Math.min(canvas.height - player.height/2, player.y));
    
    // Shooting (Arrow keys)
    if (keys['ArrowUp']) {
        bullets.push({x: player.x, y: player.y, vx: 0, vy: -10});
    }
    if (keys['ArrowDown']) {
        bullets.push({x: player.x, y: player.y, vx: 0, vy: 10});
    }
    if (keys['ArrowLeft']) {
        bullets.push({x: player.x, y: player.y, vx: -10, vy: 0});
    }
    if (keys['ArrowRight']) {
        bullets.push({x: player.x, y: player.y, vx: 10, vy: 0});
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        return bullet.x > 0 && bullet.x < canvas.width &&
               bullet.y > 0 && bullet.y < canvas.height;
    });
}

function updateEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        // Move towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const speed = enemy.type === 'hulk' ? 1.5 : 2.5;
            enemy.vx = (dx / dist) * speed;
            enemy.vy = (dy / dist) * speed;
        }
        
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
    });
}

function checkCollisions() {
    // Bullets vs enemies
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (!enemy.alive) return;
            
            const dist = Math.sqrt(
                Math.pow(bullet.x - enemy.x, 2) +
                Math.pow(bullet.y - enemy.y, 2)
            );
            
            if (dist < 15) {
                enemy.alive = false;
                bullets.splice(bulletIndex, 1);
                gameState.score += enemy.type === 'hulk' ? 500 : 250;
            }
        });
    });
    
    // Enemies vs player
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        const dist = Math.sqrt(
            Math.pow(player.x - enemy.x, 2) +
            Math.pow(player.y - enemy.y, 2)
        );
        
        if (dist < 20) {
            gameState.lives--;
            enemy.alive = false;
            
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                gameState.running = false;
            } else {
                player.x = canvas.width / 2;
                player.y = canvas.height / 2;
            }
        }
    });
    
    // Enemies vs humans
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        humans.forEach(human => {
            if (!human.alive) return;
            
            const dist = Math.sqrt(
                Math.pow(enemy.x - human.x, 2) +
                Math.pow(enemy.y - human.y, 2)
            );
            
            if (dist < 20) {
                human.alive = false;
                gameState.humans--;
            }
        });
    });
    
    // Check wave complete
    if (enemies.every(e => !e.alive)) {
        nextWave();
    }
}

function nextWave() {
    gameState.wave++;
    gameState.score += 1000;
    spawnWave();
}

function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateBullets();
    updateEnemies();
    checkCollisions();
    
    drawHumans();
    drawEnemies();
    drawBullets();
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
    document.getElementById('wave').textContent = gameState.wave;
    document.getElementById('humans').textContent = humans.filter(h => h.alive).length;
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

