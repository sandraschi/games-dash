// Space Invaders Game
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
    gameOver: false
};

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 30,
    speed: 5,
    color: '#00FF00'
};

// Bullets
let bullets = [];

// Aliens
let aliens = [];
const ALIEN_ROWS = 5;
const ALIEN_COLS = 11;
const ALIEN_SPACING = 60;
const ALIEN_START_Y = 50;
let alienDirection = 1;
let alienSpeed = 1;
let alienDropDistance = 20;

// Shields
let shields = [];
const SHIELD_COUNT = 4;
const SHIELD_Y = canvas.height - 200;

// Input
const keys = {};

// Initialize game
function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    bullets = [];
    alienSpeed = 1;
    
    // Create aliens
    aliens = [];
    for (let row = 0; row < ALIEN_ROWS; row++) {
        for (let col = 0; col < ALIEN_COLS; col++) {
            aliens.push({
                x: col * ALIEN_SPACING + 100,
                y: row * 40 + ALIEN_START_Y,
                width: 40,
                height: 30,
                type: row < 2 ? 'top' : row < 4 ? 'middle' : 'bottom',
                alive: true
            });
        }
    }
    
    // Create shields
    shields = [];
    for (let i = 0; i < SHIELD_COUNT; i++) {
        const shieldX = (canvas.width / (SHIELD_COUNT + 1)) * (i + 1) - 50;
        shields.push(createShield(shieldX, SHIELD_Y));
    }
    
    player.x = canvas.width / 2 - 25;
    updateDisplay();
}

function createShield(x, y) {
    const shield = [];
    const pattern = [
        '  ████████  ',
        ' ██████████ ',
        '████████████',
        '████████████',
        '████  ████',
        '██      ██'
    ];
    
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === '█') {
                shield.push({
                    x: x + col * 4,
                    y: y + row * 4,
                    width: 4,
                    height: 4,
                    destroyed: false
                });
            }
        }
    }
    return shield;
}

// Draw functions
function drawPlayer() {
    ctx.fillStyle = player.color;
    // Draw ship (triangle)
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
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
        
        ctx.fillStyle = alien.type === 'top' ? '#FF0000' : 
                       alien.type === 'middle' ? '#FFFF00' : '#00FFFF';
        
        // Draw alien shape
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        ctx.fillRect(alien.x - 5, alien.y + 10, 10, 10);
        ctx.fillRect(alien.x + alien.width - 5, alien.y + 10, 10, 10);
    });
}

function drawShields() {
    shields.forEach(shield => {
        shield.forEach(block => {
            if (!block.destroyed) {
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(block.x, block.y, block.width, block.height);
            }
        });
    });
}

function drawGameOver() {
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

// Update functions
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y > 0 && bullet.y < canvas.height;
    });
}

function updateAliens() {
    let moveDown = false;
    let edgeReached = false;
    
    aliens.forEach(alien => {
        if (!alien.alive) return;
        if (alien.x <= 0 || alien.x + alien.width >= canvas.width) {
            edgeReached = true;
        }
    });
    
    if (edgeReached) {
        alienDirection *= -1;
        moveDown = true;
    }
    
    aliens.forEach(alien => {
        if (!alien.alive) return;
        alien.x += alienSpeed * alienDirection;
        if (moveDown) {
            alien.y += alienDropDistance;
        }
    });
}

function checkCollisions() {
    // Bullet vs Alien
    bullets.forEach((bullet, bulletIndex) => {
        if (bullet.type !== 'player') return;
        
        aliens.forEach((alien, alienIndex) => {
            if (!alien.alive) return;
            
            if (bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y) {
                
                // Hit!
                alien.alive = false;
                bullets.splice(bulletIndex, 1);
                
                // Score based on alien type
                const points = alien.type === 'top' ? 30 : 
                              alien.type === 'middle' ? 20 : 10;
                gameState.score += points;
                
                // Check if all aliens dead
                if (aliens.every(a => !a.alive)) {
                    nextLevel();
                }
            }
        });
    });
    
    // Alien bullets vs player
    bullets.forEach((bullet, bulletIndex) => {
        if (bullet.type !== 'alien') return;
        
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            
            // Player hit!
            bullets.splice(bulletIndex, 1);
            gameState.lives--;
            
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                gameState.running = false;
            } else {
                // Reset player position
                player.x = canvas.width / 2 - 25;
            }
        }
    });
    
    // Bullets vs shields
    bullets.forEach(bullet => {
        shields.forEach(shield => {
            shield.forEach(block => {
                if (block.destroyed) return;
                
                if (bullet.x < block.x + block.width &&
                    bullet.x + bullet.width > block.x &&
                    bullet.y < block.y + block.height &&
                    bullet.y + bullet.height > block.y) {
                    
                    block.destroyed = true;
                    const index = bullets.indexOf(bullet);
                    if (index > -1) bullets.splice(index, 1);
                }
            });
        });
    });
    
    // Aliens vs shields
    aliens.forEach(alien => {
        if (!alien.alive) return;
        shields.forEach(shield => {
            shield.forEach(block => {
                if (block.destroyed) return;
                
                if (alien.x < block.x + block.width &&
                    alien.x + alien.width > block.x &&
                    alien.y < block.y + block.height &&
                    alien.y + alien.height > block.y) {
                    
                    block.destroyed = true;
                }
            });
        });
    });
    
    // Check if aliens reached bottom
    aliens.forEach(alien => {
        if (alien.alive && alien.y + alien.height >= player.y) {
            gameState.gameOver = true;
            gameState.running = false;
        }
    });
}

function alienShoot() {
    // Random alien shoots
    const aliveAliens = aliens.filter(a => a.alive);
    if (aliveAliens.length === 0) return;
    
    if (Math.random() < 0.01) { // 1% chance per frame
        const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
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
    alienSpeed += 0.5;
    initGame();
}

// Game loop
function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update
    updatePlayer();
    updateBullets();
    updateAliens();
    alienShoot();
    checkCollisions();
    
    // Draw
    drawShields();
    drawPlayer();
    drawBullets();
    drawAliens();
    
    if (gameState.gameOver) {
        drawGameOver();
    }
    
    updateDisplay();
    requestAnimationFrame(gameLoop);
}

function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('level').textContent = gameState.level;
}

// Input handling
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' && gameState.running && !gameState.paused) {
        e.preventDefault();
        // Shoot
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: -7,
            color: '#FFFFFF',
            type: 'player'
        });
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game controls
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

// Initialize on load
initGame();

