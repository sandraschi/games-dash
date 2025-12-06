// Donkey Kong Game (Simplified)
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 20;

let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false
};

// Platforms
let platforms = [
    {x: 0, y: 500, width: 800, height: 20},
    {x: 0, y: 400, width: 300, height: 20},
    {x: 500, y: 400, width: 300, height: 20},
    {x: 0, y: 300, width: 250, height: 20},
    {x: 550, y: 300, width: 250, height: 20},
    {x: 0, y: 200, width: 200, height: 20},
    {x: 600, y: 200, width: 200, height: 20},
    {x: 0, y: 100, width: 800, height: 20}
];

// Ladders
let ladders = [
    {x: 350, y: 400, height: 100},
    {x: 450, y: 300, height: 100},
    {x: 250, y: 200, height: 100},
    {x: 500, y: 100, height: 100}
];

// Player (Mario)
const player = {
    x: 50,
    y: 480,
    width: 20,
    height: 25,
    vx: 0,
    vy: 0,
    onPlatform: false,
    onLadder: false,
    climbing: false
};

// Donkey Kong
const dk = {
    x: 100,
    y: 80,
    width: 40,
    height: 50
};

// Princess
const princess = {
    x: 750,
    y: 80,
    width: 20,
    height: 25
};

// Barrels
let barrels = [];

const keys = {};
const GRAVITY = 0.5;
const SPEED = 3;

function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    barrels = [];
    
    player.x = 50;
    player.y = 480;
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

function drawLadders() {
    ctx.fillStyle = '#C0C0C0';
    ladders.forEach(ladder => {
        ctx.fillRect(ladder.x, ladder.y, 15, ladder.height);
        // Draw rungs
        for (let i = 0; i < ladder.height; i += 10) {
            ctx.fillRect(ladder.x - 5, ladder.y + i, 25, 3);
        }
    });
}

function drawPlayer() {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Draw hat
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(player.x, player.y, player.width, 8);
}

function drawDK() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(dk.x, dk.y, dk.width, dk.height);
    // Draw face
    ctx.fillStyle = '#000';
    ctx.fillRect(dk.x + 10, dk.y + 10, 5, 5);
    ctx.fillRect(dk.x + 25, dk.y + 10, 5, 5);
}

function drawPrincess() {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(princess.x, princess.y, princess.width, princess.height);
}

function drawBarrels() {
    barrels.forEach(barrel => {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(barrel.x, barrel.y, 12, 0, Math.PI * 2);
        ctx.fill();
        // Draw bands
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(barrel.x, barrel.y, 12, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function updatePlayer() {
    // Horizontal movement
    if (keys['ArrowLeft']) {
        player.vx = -SPEED;
    } else if (keys['ArrowRight']) {
        player.vx = SPEED;
    } else {
        player.vx = 0;
    }
    
    // Climbing
    player.onLadder = false;
    ladders.forEach(ladder => {
        if (player.x + player.width/2 > ladder.x &&
            player.x + player.width/2 < ladder.x + 15 &&
            player.y < ladder.y + ladder.height &&
            player.y + player.height > ladder.y) {
            player.onLadder = true;
            
            if (keys['ArrowUp']) {
                player.y -= SPEED;
                player.climbing = true;
            } else if (keys['ArrowDown']) {
                player.y += SPEED;
                player.climbing = true;
            } else {
                player.climbing = false;
            }
        }
    });
    
    if (!player.climbing) {
        // Gravity
        player.vy += GRAVITY;
    } else {
        player.vy = 0;
    }
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    
    // Platform collision
    player.onPlatform = false;
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.vy > 0) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.onPlatform = true;
        }
    });
    
    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Check if reached princess
    if (player.x + player.width > princess.x &&
        player.x < princess.x + princess.width &&
        player.y + player.height > princess.y &&
        player.y < princess.y + princess.height) {
        gameState.score += 1000;
        nextLevel();
    }
}

function updateBarrels() {
    // DK throws barrels
    if (Math.random() < 0.01 && barrels.length < 5) {
        barrels.push({
            x: dk.x + dk.width/2,
            y: dk.y + dk.height,
            vx: 2,
            vy: 0,
            onPlatform: false
        });
    }
    
    barrels.forEach((barrel, index) => {
        // Gravity
        barrel.vy += GRAVITY;
        
        // Platform collision
        barrel.onPlatform = false;
        platforms.forEach(platform => {
            if (barrel.x + 12 > platform.x &&
                barrel.x - 12 < platform.x + platform.width &&
                barrel.y + 12 > platform.y &&
                barrel.y + 12 < platform.y + platform.height &&
                barrel.vy > 0) {
                barrel.y = platform.y - 12;
                barrel.vy = 0;
                barrel.onPlatform = true;
                
                // Roll left or right
                if (Math.random() < 0.5) {
                    barrel.vx = -2;
                } else {
                    barrel.vx = 2;
                }
            }
        });
        
        // Fall off edges
        let onAnyPlatform = false;
        platforms.forEach(platform => {
            if (barrel.x + 12 > platform.x &&
                barrel.x - 12 < platform.x + platform.width &&
                barrel.y + 12 >= platform.y &&
                barrel.y + 12 <= platform.y + platform.height) {
                onAnyPlatform = true;
            }
        });
        
        if (!onAnyPlatform && barrel.vy === 0) {
            barrel.vy = 0.5;
        }
        
        barrel.x += barrel.vx;
        barrel.y += barrel.vy;
        
        // Remove if off screen
        if (barrel.y > canvas.height) {
            barrels.splice(index, 1);
        }
    });
}

function checkCollisions() {
    barrels.forEach((barrel, index) => {
        const dist = Math.sqrt(
            Math.pow(player.x + player.width/2 - barrel.x, 2) +
            Math.pow(player.y + player.height/2 - barrel.y, 2)
        );
        
        if (dist < 20) {
            gameState.lives--;
            barrels.splice(index, 1);
            
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                gameState.running = false;
            } else {
                player.x = 50;
                player.y = 480;
                player.vx = 0;
                player.vy = 0;
            }
        }
    });
}

function nextLevel() {
    gameState.level++;
    gameState.score += 1000;
    initGame();
}

function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateBarrels();
    checkCollisions();
    
    drawPlatforms();
    drawLadders();
    drawDK();
    drawPrincess();
    drawBarrels();
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

