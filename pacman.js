// Pac-Man Game Implementation
// **Timestamp**: 2025-12-03

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 20;
const COLS = 28;
const ROWS = 31;

// Game state
let pacman = {
    x: 14,
    y: 23,
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    mouthOpen: 0,
    speed: 2
};

let ghosts = [];
let dots = [];
let powerPellets = [];
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let powerMode = false;
let powerModeTimer = 0;
let gameLoop;

// Maze layout (1=wall, 0=path, 2=dot, 3=power pellet)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Initialize game
function initGame() {
    // Create maze dots
    dots = [];
    powerPellets = [];
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (maze[row][col] === 2) {
                dots.push({x: col, y: row});
            } else if (maze[row][col] === 3) {
                powerPellets.push({x: col, y: row});
            }
        }
    }
    
    // Initialize ghosts
    ghosts = [
        { x: 12, y: 11, color: '#FF0000', name: 'Blinky', mode: 'chase', target: null, speed: 1.8 },
        { x: 14, y: 11, color: '#FFB8FF', name: 'Pinky', mode: 'chase', target: null, speed: 1.8 },
        { x: 13, y: 14, color: '#00FFFF', name: 'Inky', mode: 'scatter', target: null, speed: 1.8 },
        { x: 15, y: 14, color: '#FFB851', name: 'Clyde', mode: 'scatter', target: null, speed: 1.8 }
    ];
    
    // Reset Pac-Man
    pacman = {
        x: 14,
        y: 23,
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 },
        mouthOpen: 0,
        speed: 2
    };
}

function drawMaze() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw walls
    ctx.fillStyle = '#2121FF';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (maze[row][col] === 1) {
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
    
    // Draw dots
    ctx.fillStyle = '#FFB897';
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(
            dot.x * TILE_SIZE + TILE_SIZE / 2,
            dot.y * TILE_SIZE + TILE_SIZE / 2,
            3, 0, Math.PI * 2
        );
        ctx.fill();
    });
    
    // Draw power pellets
    ctx.fillStyle = '#FFF';
    powerPellets.forEach(pellet => {
        ctx.beginPath();
        ctx.arc(
            pellet.x * TILE_SIZE + TILE_SIZE / 2,
            pellet.y * TILE_SIZE + TILE_SIZE / 2,
            6, 0, Math.PI * 2
        );
        ctx.fill();
    });
}

function drawPacman() {
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    const x = pacman.x * TILE_SIZE + TILE_SIZE / 2;
    const y = pacman.y * TILE_SIZE + TILE_SIZE / 2;
    const radius = TILE_SIZE / 2 - 2;
    
    // Mouth animation
    const mouthAngle = Math.abs(Math.sin(pacman.mouthOpen)) * 0.3;
    let startAngle, endAngle;
    
    if (pacman.direction.x > 0) { // Right
        startAngle = mouthAngle;
        endAngle = Math.PI * 2 - mouthAngle;
    } else if (pacman.direction.x < 0) { // Left
        startAngle = Math.PI + mouthAngle;
        endAngle = Math.PI - mouthAngle;
    } else if (pacman.direction.y > 0) { // Down
        startAngle = Math.PI / 2 + mouthAngle;
        endAngle = Math.PI / 2 - mouthAngle;
    } else if (pacman.direction.y < 0) { // Up
        startAngle = Math.PI * 1.5 + mouthAngle;
        endAngle = Math.PI * 1.5 - mouthAngle;
    } else {
        startAngle = 0.2;
        endAngle = Math.PI * 2 - 0.2;
    }
    
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        const x = ghost.x * TILE_SIZE + TILE_SIZE / 2;
        const y = ghost.y * TILE_SIZE + TILE_SIZE / 2;
        
        if (powerMode && powerModeTimer > 0) {
            ctx.fillStyle = powerModeTimer < 2000 ? '#0000FF' : '#FFF'; // Flash when ending
        } else {
            ctx.fillStyle = ghost.color;
        }
        
        // Ghost body
        ctx.beginPath();
        ctx.arc(x, y - 5, 8, Math.PI, 0);
        ctx.lineTo(x + 8, y + 5);
        ctx.lineTo(x + 5, y + 2);
        ctx.lineTo(x + 2, y + 5);
        ctx.lineTo(x - 2, y + 5);
        ctx.lineTo(x - 5, y + 2);
        ctx.lineTo(x - 8, y + 5);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x - 5, y - 5, 4, 4);
        ctx.fillRect(x + 1, y - 5, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(x - 4, y - 4, 2, 2);
        ctx.fillRect(x + 2, y - 4, 2, 2);
    });
}

function canMove(x, y) {
    const col = Math.floor(x);
    const row = Math.floor(y);
    
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        return col === -1 || col === COLS; // Allow tunnel
    }
    
    return maze[row][col] !== 1;
}

function movePacman() {
    // Try to change direction
    const nextX = pacman.x + pacman.nextDirection.x * 0.1;
    const nextY = pacman.y + pacman.nextDirection.y * 0.1;
    
    if (canMove(nextX, nextY)) {
        pacman.direction = pacman.nextDirection;
    }
    
    // Move in current direction
    const newX = pacman.x + pacman.direction.x * 0.1;
    const newY = pacman.y + pacman.direction.y * 0.1;
    
    if (canMove(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;
        
        // Tunnel wraparound
        if (pacman.x < 0) pacman.x = COLS - 1;
        if (pacman.x >= COLS) pacman.x = 0;
        
        pacman.mouthOpen += 0.2;
    }
    
    // Check dot collision
    const pacCol = Math.round(pacman.x);
    const pacRow = Math.round(pacman.y);
    
    const dotIndex = dots.findIndex(d => d.x === pacCol && d.y === pacRow);
    if (dotIndex > -1) {
        dots.splice(dotIndex, 1);
        score += 10;
        
        if (dots.length === 0 && powerPellets.length === 0) {
            nextLevel();
        }
    }
    
    const pelletIndex = powerPellets.findIndex(p => p.x === pacCol && p.y === pacRow);
    if (pelletIndex > -1) {
        powerPellets.splice(pelletIndex, 1);
        score += 50;
        activatePowerMode();
    }
}

function activatePowerMode() {
    powerMode = true;
    powerModeTimer = 6000;
    ghosts.forEach(g => g.mode = 'frightened');
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        if (ghost.mode === 'frightened') {
            // Random movement when scared
            const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
            const validDirs = dirs.filter(d => canMove(ghost.x + d.x * 0.1, ghost.y + d.y * 0.1));
            if (validDirs.length > 0 && Math.random() < 0.05) {
                const randomDir = validDirs[Math.floor(Math.random() * validDirs.length)];
                ghost.direction = randomDir;
            }
        } else {
            // AI behavior
            updateGhostTarget(ghost);
            moveTowardsTarget(ghost);
        }
        
        // Move ghost
        if (ghost.direction) {
            const newX = ghost.x + ghost.direction.x * 0.05;
            const newY = ghost.y + ghost.direction.y * 0.05;
            
            if (canMove(newX, newY)) {
                ghost.x = newX;
                ghost.y = newY;
            }
        }
    });
}

function updateGhostTarget(ghost) {
    switch(ghost.name) {
        case 'Blinky': // Aggressive chaser
            ghost.target = {x: pacman.x, y: pacman.y};
            break;
        case 'Pinky': // Ambusher (4 tiles ahead)
            ghost.target = {
                x: pacman.x + pacman.direction.x * 4,
                y: pacman.y + pacman.direction.y * 4
            };
            break;
        case 'Inky': // Patrol
            if (Math.random() < 0.02) {
                ghost.target = {
                    x: Math.random() * COLS,
                    y: Math.random() * ROWS
                };
            }
            break;
        case 'Clyde': // Random wanderer
            if (Math.random() < 0.05) {
                ghost.target = {
                    x: Math.random() * COLS,
                    y: Math.random() * ROWS
                };
            }
            break;
    }
}

function moveTowardsTarget(ghost) {
    if (!ghost.target) return;
    
    const dx = ghost.target.x - ghost.x;
    const dy = ghost.target.y - ghost.y;
    
    // Simple pathfinding
    if (Math.abs(dx) > Math.abs(dy)) {
        ghost.direction = {x: Math.sign(dx), y: 0};
    } else {
        ghost.direction = {x: 0, y: Math.sign(dy)};
    }
}

function checkCollisions() {
    ghosts.forEach((ghost, index) => {
        const dist = Math.sqrt(
            Math.pow(pacman.x - ghost.x, 2) + 
            Math.pow(pacman.y - ghost.y, 2)
        );
        
        if (dist < 0.5) {
            if (powerMode) {
                // Eat ghost
                score += 200 * (index + 1);
                ghost.x = 14;
                ghost.y = 11;
                ghost.mode = 'scatter';
            } else {
                // Pac-Man dies
                loseLife();
            }
        }
    });
}

function loseLife() {
    lives--;
    if (lives <= 0) {
        gameOver();
    } else {
        resetPositions();
    }
}

function resetPositions() {
    pacman.x = 14;
    pacman.y = 23;
    pacman.direction = {x: 0, y: 0};
    pacman.nextDirection = {x: 0, y: 0};
    
    ghosts[0].x = 12; ghosts[0].y = 11;
    ghosts[1].x = 14; ghosts[1].y = 11;
    ghosts[2].x = 13; ghosts[2].y = 14;
    ghosts[3].x = 15; ghosts[3].y = 14;
}

function nextLevel() {
    level++;
    initGame();
    pacman.speed += 0.2;
    ghosts.forEach(g => g.speed += 0.2);
}

function gameOver() {
    gameRunning = false;
    document.getElementById('status').textContent = 'GAME OVER! Press Start to Restart';
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFF00';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '32px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
}

function update() {
    if (!gameRunning || gamePaused) return;
    
    movePacman();
    moveGhosts();
    checkCollisions();
    
    if (powerMode) {
        powerModeTimer -= 16;
        if (powerModeTimer <= 0) {
            powerMode = false;
            ghosts.forEach(g => g.mode = 'chase');
        }
    }
    
    updateScore();
}

function draw() {
    if (!gameRunning || gamePaused) return;
    
    drawMaze();
    drawPacman();
    drawGhosts();
    
    requestAnimationFrame(draw);
}

function gameLoopFunc() {
    if (!gameRunning || gamePaused) return;
    
    update();
    drawMaze();
    drawPacman();
    drawGhosts();
    
    gameLoop = setTimeout(gameLoopFunc, 1000 / 60);
}

function startGame() {
    initGame();
    score = 0;
    lives = 3;
    level = 1;
    gameRunning = true;
    gamePaused = false;
    powerMode = false;
    document.getElementById('status').textContent = 'Game Running';
    updateScore();
    gameLoopFunc();
}

function pauseGame() {
    gamePaused = !gamePaused;
    document.getElementById('status').textContent = gamePaused ? 'Game Paused' : 'Game Running';
    if (!gamePaused && gameRunning) {
        gameLoopFunc();
    }
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score} | Lives: ${lives} | Level: ${level}`;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning) {
            startGame();
        } else {
            pauseGame();
        }
        e.preventDefault();
        return;
    }
    
    if (!gameRunning || gamePaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
            pacman.nextDirection = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            pacman.nextDirection = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            pacman.nextDirection = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            pacman.nextDirection = {x: 1, y: 0};
            break;
    }
    e.preventDefault();
});

// Initialize display
drawMaze();
drawPacman();
drawGhosts();

