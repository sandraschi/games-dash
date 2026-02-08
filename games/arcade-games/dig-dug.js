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

// Dirt texture: darker brown base + speckled grain
function drawDirtTile(x, y) {
    const baseDark = '#3D2914';
    const baseMid = '#4A3018';
    const speckDark = '#2A1A0C';
    const speckLight = '#5C3D20';

    ctx.fillStyle = baseDark;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Subtle gradient wash for depth
    const grad = ctx.createRadialGradient(x + 4, y + 4, 0, x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE);
    grad.addColorStop(0, baseMid);
    grad.addColorStop(0.7, baseDark);
    grad.addColorStop(1, speckDark);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Speckle texture (deterministic per tile)
    const seed = (Math.floor(y / TILE_SIZE) * 37 + Math.floor(x / TILE_SIZE) * 17) % 100;
    for (let i = 0; i < 12; i++) {
        const sx = x + ((seed + i * 7) % 17);
        const sy = y + ((seed + i * 11) % 17);
        ctx.fillStyle = (i % 3 === 0) ? speckLight : speckDark;
        ctx.fillRect(sx, sy, 2, 2);
    }
}

// Rock texture: darker gray with fissures
function drawRockTile(x, y) {
    const baseDark = '#2C2C2C';
    const baseMid = '#3A3A3A';
    const highlight = '#4A4A4A';
    const fissure = '#1A1A1A';

    ctx.fillStyle = baseDark;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    const grad = ctx.createLinearGradient(x, y, x + TILE_SIZE, y + TILE_SIZE);
    grad.addColorStop(0, baseMid);
    grad.addColorStop(0.5, baseDark);
    grad.addColorStop(1, highlight);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    ctx.strokeStyle = fissure;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 6);
    ctx.lineTo(x + 14, y + 10);
    ctx.moveTo(x + 8, y + 14);
    ctx.lineTo(x + 16, y + 18);
    ctx.stroke();
}

// Tunnel: dark earth with subtle edge shadow
function drawTunnelTile(x, y) {
    ctx.fillStyle = '#1A1208';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Dark edge highlight for depth
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x, y, 2, TILE_SIZE);
    ctx.fillRect(x, y, TILE_SIZE, 2);
}

function drawGrid() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;
            if (grid[row][col] === 0) {
                drawDirtTile(x, y);
            } else if (grid[row][col] === 2) {
                drawRockTile(x, y);
            } else if (grid[row][col] === 1) {
                drawTunnelTile(x, y);
            }
        }
    }
}

function drawPlayer() {
    const px = player.x * TILE_SIZE + TILE_SIZE / 2;
    const py = player.y * TILE_SIZE + TILE_SIZE / 2;

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#CC4444';
    ctx.beginPath();
    ctx.arc(px - 2, py - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    if (pump) {
        ctx.strokeStyle = '#E6C200';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(255,215,0,0.4)';
        ctx.shadowBlur = 4;
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
        ctx.shadowBlur = 0;
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const ex = enemy.x * TILE_SIZE + TILE_SIZE / 2;
        const ey = enemy.y * TILE_SIZE + TILE_SIZE / 2;

        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;

        if (enemy.inflated > 0) {
            const size = 8 + (enemy.inflated / enemy.maxInflated) * 12;
            const grad = ctx.createRadialGradient(ex - 2, ey - 2, 0, ex, ey, size);
            grad.addColorStop(0, '#FFB3FF');
            grad.addColorStop(0.5, '#CC00CC');
            grad.addColorStop(1, '#990099');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ex, ey, size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const pookaGrad = ctx.createRadialGradient(ex - 3, ey - 3, 0, ex, ey, 8);
            pookaGrad.addColorStop(0, '#FFB3FF');
            pookaGrad.addColorStop(0.6, '#CC00CC');
            pookaGrad.addColorStop(1, '#660066');
            const fygarGrad = ctx.createRadialGradient(ex - 3, ey - 3, 0, ex, ey, 8);
            fygarGrad.addColorStop(0, '#FFCC66');
            fygarGrad.addColorStop(0.6, '#CC6600');
            fygarGrad.addColorStop(1, '#994400');
            ctx.fillStyle = enemy.type === 'pooka' ? pookaGrad : fygarGrad;
            ctx.beginPath();
            ctx.arc(ex, ey, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
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
        const gp = (typeof GamepadUtils !== 'undefined' && GamepadUtils.getGamepadInput)
            ? GamepadUtils.getGamepadInput() : { up: false, down: false, left: false, right: false };
        const up = keys['ArrowUp'] || gp.up;
        const down = keys['ArrowDown'] || gp.down;
        const left = keys['ArrowLeft'] || gp.left;
        const right = keys['ArrowRight'] || gp.right;

        if (up) {
            newY = Math.max(0, player.y - 1);
            moved = true;
            player.direction = 'up';
        } else if (down) {
            newY = Math.min(ROWS - 1, player.y + 1);
            moved = true;
            player.direction = 'down';
        } else if (left) {
            newX = Math.max(0, player.x - 1);
            moved = true;
            player.direction = 'left';
        } else if (right) {
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
    
    ctx.fillStyle = '#1A1208';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updatePumpFromInput();
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
    if (e.key === ' ') e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function updatePumpFromInput() {
    const gp = (typeof GamepadUtils !== 'undefined' && GamepadUtils.getGamepadInput)
        ? GamepadUtils.getGamepadInput() : { action: false };
    const actionPressed = keys[' '] || gp.action;
    if (actionPressed && gameState.running && !gameState.paused && player.direction) {
        pump = { direction: player.direction };
    } else {
        pump = null;
    }
}

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

