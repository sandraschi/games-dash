// Dig Dug Game
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 20;
const COLS = Math.floor(canvas.width / TILE_SIZE);
const ROWS = Math.floor(canvas.height / TILE_SIZE);

let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false
};

// Grid (0 = dirt, 1 = empty, 2 = rock)
let grid = [];
let player = {
    x: 1,
    y: 1,
    targetX: 1,
    targetY: 1,
    moving: false,
    direction: null
};

let enemies = [];
let rocks = [];
let pump = null;

const keys = {};

function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    enemies = [];
    rocks = [];
    pump = null;
    
    // Create grid (all dirt except top row)
    grid = [];
    for (let row = 0; row < ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < COLS; col++) {
            if (row === 0) {
                grid[row][col] = 1; // Empty top row
            } else {
                grid[row][col] = 0; // Dirt
            }
        }
    }
    
    // Add some rocks
    for (let i = 0; i < 5; i++) {
        const rockX = Math.floor(Math.random() * (COLS - 2)) + 1;
        const rockY = Math.floor(Math.random() * (ROWS - 5)) + 2;
        grid[rockY][rockX] = 2;
        rocks.push({
            x: rockX,
            y: rockY,
            falling: false
        });
    }
    
    // Create enemies
    for (let i = 0; i < 3 + gameState.level; i++) {
        enemies.push({
            x: Math.floor(Math.random() * (COLS - 2)) + 1,
            y: Math.floor(Math.random() * (ROWS - 2)) + 1,
            type: Math.random() < 0.5 ? 'pooka' : 'fygar',
            direction: Math.random() < 0.5 ? 'left' : 'right',
            inflated: 0,
            maxInflated: 60
        });
    }
    
    player.x = 1;
    player.y = 1;
    player.targetX = 1;
    player.targetY = 1;
    player.moving = false;
    
    updateDisplay();
}

function drawGrid() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col] === 0) {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (grid[row][col] === 2) {
                ctx.fillStyle = '#696969';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawPlayer() {
    const px = player.x * TILE_SIZE + TILE_SIZE / 2;
    const py = player.y * TILE_SIZE + TILE_SIZE / 2;
    
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pump if active
    if (pump) {
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px, py);
        
        let pumpX = px;
        let pumpY = py;
        const pumpLength = 40;
        
        if (pump.direction === 'up') pumpY -= pumpLength;
        else if (pump.direction === 'down') pumpY += pumpLength;
        else if (pump.direction === 'left') pumpX -= pumpLength;
        else if (pump.direction === 'right') pumpX += pumpLength;
        
        ctx.lineTo(pumpX, pumpY);
        ctx.stroke();
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const ex = enemy.x * TILE_SIZE + TILE_SIZE / 2;
        const ey = enemy.y * TILE_SIZE + TILE_SIZE / 2;
        
        if (enemy.inflated > 0) {
            const size = 8 + (enemy.inflated / enemy.maxInflated) * 12;
            ctx.fillStyle = '#FF00FF';
            ctx.beginPath();
            ctx.arc(ex, ey, size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = enemy.type === 'pooka' ? '#FF00FF' : '#FFA500';
            ctx.beginPath();
            ctx.arc(ex, ey, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function updatePlayer() {
    if (player.moving) {
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            player.x = player.targetX;
            player.y = player.targetY;
            player.moving = false;
        } else {
            player.x += dx * 0.2;
            player.y += dy * 0.2;
        }
    } else {
        let newX = player.x;
        let newY = player.y;
        let moved = false;
        
        if (keys['ArrowUp']) {
            newY = Math.max(0, player.y - 1);
            moved = true;
            player.direction = 'up';
        } else if (keys['ArrowDown']) {
            newY = Math.min(ROWS - 1, player.y + 1);
            moved = true;
            player.direction = 'down';
        } else if (keys['ArrowLeft']) {
            newX = Math.max(0, player.x - 1);
            moved = true;
            player.direction = 'left';
        } else if (keys['ArrowRight']) {
            newX = Math.min(COLS - 1, player.x + 1);
            moved = true;
            player.direction = 'right';
        }
        
        if (moved && grid[Math.floor(newY)][Math.floor(newX)] === 0) {
            // Dig through dirt
            grid[Math.floor(newY)][Math.floor(newX)] = 1;
            player.targetX = newX;
            player.targetY = newY;
            player.moving = true;
        } else if (moved && grid[Math.floor(newY)][Math.floor(newX)] === 1) {
            // Move through empty space
            player.targetX = newX;
            player.targetY = newY;
            player.moving = true;
        }
    }
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (enemy.inflated > 0) {
            enemy.inflated++;
            if (enemy.inflated >= enemy.maxInflated) {
                // Pop!
                gameState.score += enemy.type === 'pooka' ? 200 : 400;
                enemies.splice(index, 1);
            }
            return;
        }
        
        // Move enemy
        let newX = enemy.x;
        let newY = enemy.y;
        
        if (enemy.direction === 'left') newX--;
        else if (enemy.direction === 'right') newX++;
        else if (enemy.direction === 'up') newY--;
        else if (enemy.direction === 'down') newY++;
        
        // Check if can move
        if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS) {
            if (grid[Math.floor(newY)][Math.floor(newX)] === 1) {
                enemy.x = newX;
                enemy.y = newY;
            } else {
                // Change direction
                const directions = ['left', 'right', 'up', 'down'];
                enemy.direction = directions[Math.floor(Math.random() * directions.length)];
            }
        } else {
            const directions = ['left', 'right', 'up', 'down'];
            enemy.direction = directions[Math.floor(Math.random() * directions.length)];
        }
    });
}

function updatePump() {
    if (!pump) return;
    
    // Check if hitting enemy
    enemies.forEach((enemy, index) => {
        if (enemy.inflated > 0) return;
        
        const dist = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) +
            Math.pow(enemy.y - player.y, 2)
        );
        
        if (dist < 2) {
            enemy.inflated = 1;
        }
    });
}

function checkCollisions() {
    enemies.forEach(enemy => {
        if (enemy.inflated > 0) return;
        
        if (Math.floor(enemy.x) === Math.floor(player.x) &&
            Math.floor(enemy.y) === Math.floor(player.y)) {
            
            gameState.lives--;
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                gameState.running = false;
            } else {
                player.x = 1;
                player.y = 1;
            }
        }
    });
    
    // Check if all enemies defeated
    if (enemies.length === 0) {
        nextLevel();
    }
}

function nextLevel() {
    gameState.level++;
    initGame();
}

function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateEnemies();
    updatePump();
    checkCollisions();
    
    drawGrid();
    drawEnemies();
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
    
    if (e.key === ' ' && gameState.running && !gameState.paused) {
        e.preventDefault();
        if (!pump && player.direction) {
            pump = { direction: player.direction };
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    
    if (e.key === ' ') {
        pump = null;
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

