// Ms. Pac-Man Game Implementation
// **Timestamp**: 2025-12-04

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
    speed: 2,
    score: 0,
    lives: 3,
    color: '#FF69B4' // Pink for Ms. Pac-Man
};

let ghosts = [];
let dots = [];
let powerPellets = [];
let level = 1;
let gameRunning = false;
let gamePaused = false;
let powerMode = false;
let powerModeTimer = 0;
let gameLoopId;

// Ms. Pac-Man has slightly different maze with more paths
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
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
                dots.push({x: col, y: row, eaten: false});
            } else if (maze[row][col] === 3) {
                powerPellets.push({x: col, y: row});
            }
        }
    }

    // Initialize ghosts - Ms. Pac-Man has different colored ghosts
    ghosts = [
        { x: 12, y: 11, color: '#FF1493', name: 'Sue', mode: 'chase', target: null, speed: 1.8 },
        { x: 14, y: 11, color: '#FF69B4', name: 'Funky', mode: 'chase', target: null, speed: 1.8 },
        { x: 13, y: 14, color: '#FFB6C1', name: 'Spunky', mode: 'scatter', target: null, speed: 1.8 },
        { x: 15, y: 14, color: '#FF6347', name: 'Timid', mode: 'scatter', target: null, speed: 1.8 }
    ];

    // Reset Ms. Pac-Man
    pacman = {
        x: 14,
        y: 23,
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 },
        mouthOpen: 0,
        speed: 2,
        score: 0,
        lives: 3,
        color: '#FF69B4'
    };

    powerMode = false;
    powerModeTimer = 0;
    updateScoreDisplay();
}

function setDifficulty(difficulty) {
    // Ms. Pac-Man uses the same difficulty system as Pac-Man
}

function getAISpeed() {
    return 1.8; // Not used in Ms. Pac-Man
}

// Direction button controls
function setDirection(dx, dy) {
    if (!gameRunning || gamePaused) return;
    pacman.nextDirection = {x: dx, y: dy};
}

function stopDirection() {
    // Let direction continue for better UX
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
        case 'KeyW':
            pacman.nextDirection = {x: 0, y: -1};
            break;
        case 'ArrowDown':
        case 'KeyS':
            pacman.nextDirection = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
        case 'KeyA':
            pacman.nextDirection = {x: -1, y: 0};
            break;
        case 'ArrowRight':
        case 'KeyD':
            pacman.nextDirection = {x: 1, y: 0};
            break;
    }
    e.preventDefault();
});

// Mouse controls for canvas
let mouseControlEnabled = false;

canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning || gamePaused) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    const pacmanGridX = Math.floor(pacman.x);
    const pacmanGridY = Math.floor(pacman.y);

    const dx = gridX - pacmanGridX;
    const dy = gridY - pacmanGridY;

    if (Math.abs(dx) > Math.abs(dy)) {
        pacman.nextDirection = {x: dx > 0 ? 1 : -1, y: 0};
    } else if (dy !== 0) {
        pacman.nextDirection = {x: 0, y: dy > 0 ? 1 : -1};
    }

    mouseControlEnabled = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (!mouseControlEnabled || !gameRunning || gamePaused) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    const pacmanGridX = Math.floor(pacman.x);
    const pacmanGridY = Math.floor(pacman.y);

    const dx = gridX - pacmanGridX;
    const dy = gridY - pacmanGridY;

    if (Math.abs(dx) > Math.abs(dy)) {
        pacman.nextDirection = {x: dx > 0 ? 1 : -1, y: 0};
    } else if (dy !== 0) {
        pacman.nextDirection = {x: 0, y: dy > 0 ? 1 : -1};
    }
});

document.addEventListener('mouseup', () => {
    mouseControlEnabled = false;
});

function canMove(x, y) {
    const col = Math.floor(x);
    const row = Math.floor(y);

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        return false;
    }

    return maze[row][col] !== 1;
}

function movePacman() {
    const moveSpeed = pacman.speed * 0.07;

    // Try to change direction
    if (pacman.nextDirection.x !== 0 || pacman.nextDirection.y !== 0) {
        if (pacman.nextDirection.x !== 0 && pacman.direction.y !== 0) {
            const alignedY = Math.round(pacman.y);
            if (Math.abs(pacman.y - alignedY) < 0.3) {
                pacman.y = alignedY;
            }
        } else if (pacman.nextDirection.y !== 0 && pacman.direction.x !== 0) {
            const alignedX = Math.round(pacman.x);
            if (Math.abs(pacman.x - alignedX) < 0.3) {
                pacman.x = alignedX;
            }
        }

        const nextX = pacman.x + pacman.nextDirection.x * moveSpeed;
        const nextY = pacman.y + pacman.nextDirection.y * moveSpeed;

        if (canMove(nextX, nextY)) {
            pacman.direction = pacman.nextDirection;
        }
    }

    // Move in current direction
    if (pacman.direction.x !== 0 || pacman.direction.y !== 0) {
        const newX = pacman.x + pacman.direction.x * moveSpeed;
        const newY = pacman.y + pacman.direction.y * moveSpeed;

        if (canMove(newX, newY)) {
            pacman.x = newX;
            pacman.y = newY;

            // Tunnel wraparound
            if (pacman.x < -0.5) pacman.x = COLS - 0.5;
            if (pacman.x >= COLS + 0.5) pacman.x = 0.5;

            pacman.mouthOpen += 0.2;
        } else {
            pacman.direction = { x: 0, y: 0 };
        }
    }

    // Check dot collision
    const pacmanCol = Math.floor(pacman.x);
    const pacmanRow = Math.floor(pacman.y);

    // Check dots
    for (let i = dots.length - 1; i >= 0; i--) {
        if (dots[i].x === pacmanCol && dots[i].y === pacmanRow && !dots[i].eaten) {
            dots[i].eaten = true;
            pacman.score += 10;
            updateScoreDisplay();
            break;
        }
    }

    // Check power pellets
    for (let i = powerPellets.length - 1; i >= 0; i--) {
        if (powerPellets[i].x === pacmanCol && powerPellets[i].y === pacmanRow) {
            powerPellets.splice(i, 1);
            pacman.score += 50;
            powerMode = true;
            powerModeTimer = 600; // 10 seconds at 60fps
            updateScoreDisplay();
            break;
        }
    }

    // Check win condition - all dots eaten
    const uneatenDots = dots.filter(dot => !dot.eaten);
    if (uneatenDots.length === 0 && powerPellets.length === 0) {
        level++;
        initGame();
        startGame();
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        let newX = ghost.x;
        let newY = ghost.y;

        // Different ghost behaviors for Ms. Pac-Man
        switch(ghost.name) {
            case 'Sue': // More aggressive
                if (Math.abs(ghost.x - pacman.x) > Math.abs(ghost.y - pacman.y)) {
                    newX += ghost.x < pacman.x ? 0.06 : -0.06;
                } else {
                    newY += ghost.y < pacman.y ? 0.06 : -0.06;
                }
                break;

            case 'Funky': // More erratic
                const random = Math.random();
                if (random < 0.3) {
                    newX += Math.sin(Date.now() * 0.002) * 0.06;
                    newY += Math.cos(Date.now() * 0.002) * 0.06;
                } else {
                    newX += ghost.x < pacman.x ? 0.05 : -0.05;
                    newY += ghost.y < pacman.y ? 0.05 : -0.05;
                }
                break;

            case 'Spunky': // Patrols more
                if (ghost.mode === 'scatter') {
                    // Move towards top-left corner
                    if (ghost.x > 5) newX -= 0.05;
                    if (ghost.y > 5) newY -= 0.05;
                } else {
                    newX += Math.sin(Date.now() * 0.001) * 0.05;
                    newY += Math.cos(Date.now() * 0.001) * 0.05;
                }
                break;

            case 'Timid': // More predictable, easier to avoid
                if (Math.random() < 0.02) {
                    const directions = [
                        {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
                    ];
                    const dir = directions[Math.floor(Math.random() * directions.length)];
                    ghost.direction = dir;
                }
                newX += ghost.direction.x * 0.04;
                newY += ghost.direction.y * 0.04;
                break;
        }

        // Check wall collision
        if (canMove(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        }

        // Check collision with Pac-Man
        if (Math.abs(ghost.x - pacman.x) < 0.5 && Math.abs(ghost.y - pacman.y) < 0.5) {
            if (powerMode) {
                // Eat ghost
                pacman.score += 200;
                ghost.x = 14;
                ghost.y = 11;
                updateScoreDisplay();
            } else {
                // Lose a life
                pacman.lives--;
                if (pacman.lives <= 0) {
                    gameOver('Game Over! Final Score: ' + pacman.score);
                } else {
                    // Reset positions
                    pacman.x = 14;
                    pacman.y = 23;
                    pacman.direction = { x: 0, y: 0 };
                    pacman.nextDirection = { x: 0, y: 0 };
                    ghosts.forEach(g => {
                        g.x = 14;
                        g.y = 11;
                    });
                    updateScoreDisplay();
                }
            }
        }
    });
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (maze[row][col] === 1) {
                ctx.fillStyle = '#0000FF';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw dots
    dots.forEach(dot => {
        if (!dot.eaten) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc((dot.x + 0.5) * TILE_SIZE, (dot.y + 0.5) * TILE_SIZE, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });

    // Draw power pellets
    ctx.fillStyle = '#FFFFFF';
    powerPellets.forEach(pellet => {
        ctx.beginPath();
        ctx.arc((pellet.x + 0.5) * TILE_SIZE, (pellet.y + 0.5) * TILE_SIZE, 6, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Draw Ms. Pac-Man
    ctx.fillStyle = pacman.color;
    const centerX = (pacman.x + 0.5) * TILE_SIZE;
    const centerY = (pacman.y + 0.5) * TILE_SIZE;
    const radius = TILE_SIZE * 0.4;

    const mouthAngle = Math.sin(pacman.mouthOpen) * 0.3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, mouthAngle, 2 * Math.PI - mouthAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Add bow decoration for Ms. Pac-Man
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY - 8, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 3, centerY - 8, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw ghosts
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.fillRect(ghost.x * TILE_SIZE, ghost.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Ghost eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((ghost.x + 0.2) * TILE_SIZE, (ghost.y + 0.2) * TILE_SIZE, 4, 4);
        ctx.fillRect((ghost.x + 0.6) * TILE_SIZE, (ghost.y + 0.2) * TILE_SIZE, 4, 4);

        ctx.fillStyle = '#000000';
        ctx.fillRect((ghost.x + 0.25) * TILE_SIZE, (ghost.y + 0.25) * TILE_SIZE, 2, 2);
        ctx.fillRect((ghost.x + 0.65) * TILE_SIZE, (ghost.y + 0.25) * TILE_SIZE, 2, 2);
    });

    // Power mode effect
    if (powerMode) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ghosts.forEach(ghost => {
            ctx.strokeRect(ghost.x * TILE_SIZE - 2, ghost.y * TILE_SIZE - 2, TILE_SIZE + 4, TILE_SIZE + 4);
        });
    }
}

function gameLoop() {
    if (!gamePaused) {
        movePacman();
        moveGhosts();

        // Power mode timer
        if (powerMode) {
            powerModeTimer--;
            if (powerModeTimer <= 0) {
                powerMode = false;
            }
        }
    }

    draw();
}

function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    gamePaused = false;
    document.getElementById('status').textContent = 'Playing Ms. Pac-Man!';

    if (!gameLoopId) {
        gameLoopId = setInterval(gameLoop, 1000/60);
    }
}

function pauseGame() {
    gamePaused = !gamePaused;
    document.getElementById('status').textContent = gamePaused ? 'Paused - Press SPACE to resume' : 'Playing Ms. Pac-Man!';
}

function gameOver(message) {
    gameRunning = false;
    clearInterval(gameLoopId);
    gameLoopId = null;
    document.getElementById('status').textContent = message;
}

function updateScoreDisplay() {
    document.querySelector('.score').textContent = `Score: ${pacman.score}`;
    document.querySelector('.lives').textContent = `Lives: ${pacman.lives}`;
}

// Initialize
initGame();