// Galaga Game
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    formationPhase: true
};

// Player
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 30,
    speed: 5,
    canShoot: true,
    shootCooldown: 0
};

// Bullets
let bullets = [];

// Aliens (formation-based)
let aliens = [];
const ALIEN_ROWS = 5;
const ALIEN_COLS = 8;
let formationX = 0;
let formationDirection = 1;
let formationSpeed = 1;
let diveAliens = [];

// Stars background
let stars = [];
for (let i = 0; i < 50; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 0.5
    });
}

// Input
const keys = {};

function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    gameState.formationPhase = true;
    bullets = [];
    diveAliens = [];
    formationX = 0;
    formationDirection = 1;
    formationSpeed = 1;
    
    // Create alien formation
    aliens = [];
    for (let row = 0; row < ALIEN_ROWS; row++) {
        for (let col = 0; col < ALIEN_COLS; col++) {
            aliens.push({
                x: col * 80 + 100,
                y: row * 50 + 50,
                width: 35,
                height: 30,
                type: row < 2 ? 'butterfly' : row < 4 ? 'bee' : 'boss',
                alive: true,
                diveTimer: 0
            });
        }
    }
    
    player.x = canvas.width / 2 - 20;
    updateDisplay();
}

function drawStars() {
    ctx.fillStyle = '#FFFFFF';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, 2, 2);
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

function drawPlayer() {
    ctx.fillStyle = '#00FF00';
    // Draw fighter
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width / 4, player.y + player.height * 0.7);
    ctx.lineTo(player.x + player.width * 3/4, player.y + player.height * 0.7);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawAliens() {
    aliens.forEach(alien => {
        if (!alien.alive) return;
        
        ctx.fillStyle = alien.type === 'butterfly' ? '#FF00FF' : 
                       alien.type === 'bee' ? '#FFFF00' : '#FF0000';
        
        // Draw alien
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        // Wings
        ctx.fillRect(alien.x - 5, alien.y + 5, 10, 15);
        ctx.fillRect(alien.x + alien.width - 5, alien.y + 5, 10, 15);
    });
    
    // Draw diving aliens
    diveAliens.forEach(alien => {
        ctx.fillStyle = alien.type === 'butterfly' ? '#FF00FF' : 
                       alien.type === 'bee' ? '#FFFF00' : '#FF0000';
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
    });
}

function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    
    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    } else {
        player.canShoot = true;
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y > 0 && bullet.y < canvas.height;
    });
}

function updateFormation() {
    if (!gameState.formationPhase) return;
    
    formationX += formationSpeed * formationDirection;
    
    let edgeReached = false;
    aliens.forEach(alien => {
        if (!alien.alive) return;
        const worldX = alien.x + formationX;
        if (worldX <= 0 || worldX + alien.width >= canvas.width) {
            edgeReached = true;
        }
    });
    
    if (edgeReached) {
        formationDirection *= -1;
    }
    
    // Random dive
    aliens.forEach(alien => {
        if (!alien.alive) return;
        alien.diveTimer++;
        if (Math.random() < 0.001 && alien.y < canvas.height / 2) {
            diveAliens.push({
                x: alien.x + formationX,
                y: alien.y,
                width: alien.width,
                height: alien.height,
                type: alien.type,
                vx: (player.x - (alien.x + formationX)) * 0.02,
                vy: 2
            });
            alien.alive = false;
        }
    });
}

function updateDiveAliens() {
    diveAliens.forEach((alien, index) => {
        alien.x += alien.vx;
        alien.y += alien.vy;
        
        if (alien.y > canvas.height) {
            diveAliens.splice(index, 1);
        }
    });
}

function checkCollisions() {
    // Player bullets vs formation aliens
    bullets.forEach((bullet, bulletIndex) => {
        if (bullet.type !== 'player') return;
        
        aliens.forEach((alien, alienIndex) => {
            if (!alien.alive) return;
            
            const worldX = alien.x + formationX;
            if (bullet.x < worldX + alien.width &&
                bullet.x + bullet.width > worldX &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y) {
                
                alien.alive = false;
                bullets.splice(bulletIndex, 1);
                
                const points = alien.type === 'butterfly' ? 40 : 
                              alien.type === 'bee' ? 30 : 60;
                gameState.score += points;
                
                if (aliens.every(a => !a.alive) && diveAliens.length === 0) {
                    nextLevel();
                }
            }
        });
        
        // Player bullets vs diving aliens
        diveAliens.forEach((alien, alienIndex) => {
            if (bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y) {
                
                diveAliens.splice(alienIndex, 1);
                bullets.splice(bulletIndex, 1);
                
                const points = alien.type === 'butterfly' ? 40 : 
                              alien.type === 'bee' ? 30 : 60;
                gameState.score += points;
            }
        });
    });
    
    // Diving aliens vs player
    diveAliens.forEach((alien, index) => {
        if (alien.x < player.x + player.width &&
            alien.x + alien.width > player.x &&
            alien.y < player.y + player.height &&
            alien.y + alien.height > player.y) {
            
            diveAliens.splice(index, 1);
            gameState.lives--;
            
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                gameState.running = false;
            } else {
                player.x = canvas.width / 2 - 20;
            }
        }
    });
}

function alienShoot() {
    if (diveAliens.length === 0) return;
    
    if (Math.random() < 0.01) {
        const shooter = diveAliens[Math.floor(Math.random() * diveAliens.length)];
        bullets.push({
            x: shooter.x + shooter.width / 2 - 2,
            y: shooter.y + shooter.height,
            width: 4,
            height: 10,
            speed: 3,
            color: '#FF00FF',
            type: 'alien'
        });
    }
}

function nextLevel() {
    gameState.level++;
    formationSpeed += 0.3;
    initGame();
}

function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    updatePlayer();
    updateBullets();
    updateFormation();
    updateDiveAliens();
    alienShoot();
    checkCollisions();
    
    drawAliens();
    drawPlayer();
    drawBullets();
    
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
    
    if (e.key === ' ' && gameState.running && !gameState.paused && player.canShoot) {
        e.preventDefault();
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: -7,
            color: '#FFFFFF',
            type: 'player'
        });
        player.canShoot = false;
        player.shootCooldown = 10;
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

