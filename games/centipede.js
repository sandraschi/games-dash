// Centipede Game
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const COLS = Math.floor(canvas.width / GRID_SIZE);
const ROWS = Math.floor(canvas.height / GRID_SIZE);
const PLAYER_AREA = 4; // Bottom 4 rows for player

let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false
};

// Player (bug blaster)
const player = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    width: 30,
    height: 20,
    speed: 5
};

// Centipede segments
let centipede = [];
let mushrooms = [];
let bullets = [];
let spiders = [];
let fleas = [];
let scorpions = [];

// Input
let mouseX = canvas.width / 2;
let mouseDown = false;

function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    bullets = [];
    spiders = [];
    fleas = [];
    scorpions = [];
    
    // Create mushrooms (random pattern)
    mushrooms = [];
    for (let i = 0; i < 30; i++) {
        mushrooms.push({
            x: Math.floor(Math.random() * COLS) * GRID_SIZE,
            y: Math.floor(Math.random() * (ROWS - PLAYER_AREA)) * GRID_SIZE,
            hits: 0,
            maxHits: 4
        });
    }
    
    // Create centipede
    createCentipede();
    
    player.x = canvas.width / 2;
    updateDisplay();
}

function createCentipede() {
    centipede = [];
    const length = 10 + gameState.level;
    const startX = Math.floor(Math.random() * COLS) * GRID_SIZE;
    
    for (let i = 0; i < length; i++) {
        centipede.push({
            x: startX,
            y: i * GRID_SIZE,
            direction: 1, // 1 = right, -1 = left
            isHead: i === 0,
            isBody: i > 0
        });
    }
}

function drawPlayer() {
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(player.x - player.width/2, player.y, player.width, player.height);
    // Draw antennae
    ctx.fillRect(player.x - 5, player.y - 5, 3, 5);
    ctx.fillRect(player.x + 2, player.y - 5, 3, 5);
}

function drawMushrooms() {
    mushrooms.forEach(mushroom => {
        if (mushroom.hits >= mushroom.maxHits) return;
        
        const alpha = 1 - (mushroom.hits / mushroom.maxHits) * 0.5;
        ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
        ctx.fillRect(mushroom.x, mushroom.y, GRID_SIZE, GRID_SIZE);
    });
}

function drawCentipede() {
    centipede.forEach((segment, index) => {
        ctx.fillStyle = segment.isHead ? '#FF0000' : '#FFFF00';
        ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(bullet.x, bullet.y, 4, 8);
    });
}

function drawSpiders() {
    spiders.forEach(spider => {
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(spider.x, spider.y, 30, 20);
    });
}

function updatePlayer() {
    // Move towards mouse
    const targetX = mouseX;
    const diff = targetX - player.x;
    player.x += Math.sign(diff) * Math.min(Math.abs(diff), player.speed);
    player.x = Math.max(player.width/2, Math.min(canvas.width - player.width/2, player.x));
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y -= 8;
        return bullet.y > 0;
    });
}

function updateCentipede() {
    centipede.forEach((segment, index) => {
        if (index === 0) {
            // Head moves
            segment.x += segment.direction * 2;
            
            // Check boundaries
            if (segment.x <= 0 || segment.x >= canvas.width - GRID_SIZE) {
                segment.direction *= -1;
                segment.y += GRID_SIZE;
            }
            
            // Check if hit mushroom
            mushrooms.forEach(mushroom => {
                if (mushroom.hits < mushroom.maxHits &&
                    segment.x < mushroom.x + GRID_SIZE &&
                    segment.x + GRID_SIZE > mushroom.x &&
                    segment.y < mushroom.y + GRID_SIZE &&
                    segment.y + GRID_SIZE > mushroom.y) {
                    segment.direction *= -1;
                    segment.y += GRID_SIZE;
                }
            });
            
            // Check if reached bottom
            if (segment.y >= canvas.height - PLAYER_AREA * GRID_SIZE) {
                segment.direction *= -1;
                segment.y = canvas.height - PLAYER_AREA * GRID_SIZE - GRID_SIZE;
            }
        } else {
            // Body follows previous segment
            const prev = centipede[index - 1];
            segment.x = prev.x;
            segment.y = prev.y;
        }
    });
}

function checkCollisions() {
    // Bullets vs mushrooms
    bullets.forEach((bullet, bulletIndex) => {
        mushrooms.forEach(mushroom => {
            if (mushroom.hits >= mushroom.maxHits) return;
            
            if (bullet.x < mushroom.x + GRID_SIZE &&
                bullet.x + 4 > mushroom.x &&
                bullet.y < mushroom.y + GRID_SIZE &&
                bullet.y + 8 > mushroom.y) {
                
                mushroom.hits++;
                bullets.splice(bulletIndex, 1);
                gameState.score += 1;
            }
        });
    });
    
    // Bullets vs centipede
    bullets.forEach((bullet, bulletIndex) => {
        centipede.forEach((segment, segmentIndex) => {
            if (bullet.x < segment.x + GRID_SIZE &&
                bullet.x + 4 > segment.x &&
                bullet.y < segment.y + GRID_SIZE &&
                bullet.y + 8 > segment.y) {
                
                // Hit!
                bullets.splice(bulletIndex, 1);
                
                if (segment.isHead) {
                    gameState.score += 100;
                } else {
                    gameState.score += 10;
                    // Split centipede
                    const newMushroom = {
                        x: segment.x,
                        y: segment.y,
                        hits: 0,
                        maxHits: 4
                    };
                    mushrooms.push(newMushroom);
                }
                
                // Remove segment and split if needed
                if (segmentIndex > 0) {
                    const newCentipede = centipede.slice(segmentIndex + 1);
                    if (newCentipede.length > 0) {
                        newCentipede[0].isHead = true;
                        centipede = centipede.slice(0, segmentIndex);
                        centipede = centipede.concat(newCentipede);
                    } else {
                        centipede = centipede.slice(0, segmentIndex);
                    }
                } else {
                    centipede.shift();
                    if (centipede.length > 0) {
                        centipede[0].isHead = true;
                    }
                }
                
                if (centipede.length === 0) {
                    nextLevel();
                }
            }
        });
    });
    
    // Centipede vs player
    centipede.forEach(segment => {
        if (segment.x < player.x + player.width/2 &&
            segment.x + GRID_SIZE > player.x - player.width/2 &&
            segment.y < player.y + player.height &&
            segment.y + GRID_SIZE > player.y) {
            
            gameState.lives--;
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                gameState.running = false;
            } else {
                createCentipede();
            }
        }
    });
}

function spawnEnemies() {
    // Spawn spider occasionally
    if (Math.random() < 0.001 && spiders.length === 0) {
        spiders.push({
            x: Math.random() < 0.5 ? -30 : canvas.width,
            y: canvas.height - 100,
            vx: Math.random() < 0.5 ? 2 : -2,
            vy: (Math.random() - 0.5) * 2
        });
    }
    
    // Update spiders
    spiders.forEach((spider, index) => {
        spider.x += spider.vx;
        spider.y += spider.vy;
        
        if (spider.x < -50 || spider.x > canvas.width + 50) {
            spiders.splice(index, 1);
        }
    });
}

function nextLevel() {
    gameState.level++;
    createCentipede();
    // Add more mushrooms
    for (let i = 0; i < 5; i++) {
        mushrooms.push({
            x: Math.floor(Math.random() * COLS) * GRID_SIZE,
            y: Math.floor(Math.random() * (ROWS - PLAYER_AREA)) * GRID_SIZE,
            hits: 0,
            maxHits: 4
        });
    }
}

function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateBullets();
    updateCentipede();
    spawnEnemies();
    checkCollisions();
    
    drawMushrooms();
    drawCentipede();
    drawSpiders();
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

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});

canvas.addEventListener('mousedown', () => {
    if (gameState.running && !gameState.paused) {
        bullets.push({
            x: player.x - 2,
            y: player.y,
            width: 4,
            height: 8
        });
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

