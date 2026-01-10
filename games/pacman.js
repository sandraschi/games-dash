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
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 3, 1],
    [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
    [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Initialize game
function initGame(fullReset = true) {
    // Create maze dots
    if (fullReset) {
        dots = [];
        powerPellets = [];

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (maze[row][col] === 2) {
                    dots.push({ x: col, y: row });
                } else if (maze[row][col] === 3) {
                    powerPellets.push({ x: col, y: row });
                }
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
    // Clamp drawing position to valid path tiles only!
    let drawX = pacman.x;
    let drawY = pacman.y;

    // Check if current position is in a wall
    const tileCol = Math.round(drawX);
    const tileRow = Math.round(drawY);
    if (tileRow >= 0 && tileRow < ROWS && tileCol >= 0 && tileCol < COLS) {
        if (maze[tileRow][tileCol] === 1) {
            // In a wall! Clamp to last known good position
            drawX = Math.round(drawX);
            drawY = Math.round(drawY);
        }
    }

    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();

    const x = drawX * TILE_SIZE + TILE_SIZE / 2;
    const y = drawY * TILE_SIZE + TILE_SIZE / 2;
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
        // Clamp ghost drawing position to valid paths only!
        let drawX = ghost.x;
        let drawY = ghost.y;

        // Check if ghost is in a wall
        const tileCol = Math.round(drawX);
        const tileRow = Math.round(drawY);
        if (tileRow >= 0 && tileRow < ROWS && tileCol >= 0 && tileCol < COLS) {
            if (maze[tileRow][tileCol] === 1) {
                // Ghost in wall! Clamp to nearest valid tile
                drawX = Math.round(drawX);
                drawY = Math.round(drawY);
            }
        }

        const x = drawX * TILE_SIZE + TILE_SIZE / 2;
        const y = drawY * TILE_SIZE + TILE_SIZE / 2;

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
    // Check center and 4 corners with proper sprite bounding box
    const margin = 0.35; // Sprite collision box (smaller than tile)

    // Adjust to center of tile for more accurate collision
    const centerX = x + 0.5;
    const centerY = y + 0.5;

    // Test points: center + 4 corners
    const testPoints = [
        { x: x + 0.5, y: y + 0.5 },                     // Center (offset)
        { x: centerX - margin, y: centerY - margin },   // Top-left
        { x: centerX + margin, y: centerY - margin },   // Top-right
        { x: centerX - margin, y: centerY + margin },   // Bottom-left
        { x: centerX + margin, y: centerY + margin }    // Bottom-right
    ];

    for (const point of testPoints) {
        const col = Math.floor(point.x);
        const row = Math.floor(point.y);

        // Allow tunnel wraparound at edges
        if (row === 14 && (col <= 0 || col >= COLS - 1)) {
            continue;
        }

        // Out of bounds check
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
            return false;
        }

        // Wall collision check
        if (maze[row][col] === 1) {
            return false;
        }
    }

    return true;
}

function movePacman() {
    const moveSpeed = 0.07; // Slightly slower for precise control

    // Try to change direction - with better grid alignment
    if (pacman.nextDirection.x !== 0 || pacman.nextDirection.y !== 0) {
        // Auto-align when trying to turn perpendicular
        if (pacman.nextDirection.x !== 0 && pacman.direction.y !== 0) {
            // Turning from vertical to horizontal - align vertically
            const alignedY = Math.round(pacman.y);
            if (Math.abs(pacman.y - alignedY) < 0.3) {
                pacman.y = alignedY;
            }
        } else if (pacman.nextDirection.y !== 0 && pacman.direction.x !== 0) {
            // Turning from horizontal to vertical - align horizontally
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
            // Hit a wall - stop completely
            // But verify we aren't getting stuck due to floating point drift
            // Snap to grid if very close
            pacman.x = Math.round(pacman.x * 100) / 100;
            pacman.y = Math.round(pacman.y * 100) / 100;
            pacman.direction = { x: 0, y: 0 };
        }
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

// Game Loop
function gameLoopFunc() {
    if (!gameRunning || gamePaused) return;

    update();
    draw();

    requestAnimationFrame(gameLoopFunc);
}

function update() {
    movePacman();
    moveGhosts();
    checkGhostCollision();
}

function draw() {
    drawMaze();

    drawPacman();
    drawGhosts();

    // Draw Score
    // (Score is updated in DOM, maybe draw on canvas too?)
    // DOM update is enough for now.
}

function startGame() {
    if (gameRunning) return;

    initGame(true); // Initial full reset
    gameRunning = true;
    gamePaused = false;
    document.getElementById('status').textContent = 'Game Running';
    document.getElementById('score').textContent = `Score: ${score} | Lives: ${lives} | Level: ${level}`;

    gameLoopFunc();
}

function pauseGame() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    document.getElementById('status').textContent = gamePaused ? 'PAUSED' : 'Game Running';

    if (!gamePaused) {
        gameLoopFunc();
    }
}

function gameOver() {
    gameRunning = false;
    document.getElementById('status').textContent = 'GAME OVER - Press SPACE to Restart';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FF0000';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

    // Record game stats to global system
    if (window.recordGameStats) {
        window.recordGameStats('pacman', 'loss', score, level);
    }
}

function checkGhostCollision() {
    for (const ghost of ghosts) {
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.8) { // Closer than 0.8 tiles
            if (powerMode) {
                // Eat ghost
                ghost.x = 13.5; // Send home
                ghost.y = 11.5; // Send home
                score += 200;
            } else {
                // Pacman dies
                handleDeath();
            }
        }
    }
}

function handleDeath() {
    lives--;
    document.getElementById('score').textContent = `Score: ${score} | Lives: ${lives} | Level: ${level}`;

    if (lives <= 0) {
        gameOver();
    } else {
        // Partial reset: just positions
        initGame(false);

        // Pause briefly?
        // For now just continue.
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        const moveSpeed = ghost.speed * 0.04; // Slower than Pacman

        // Simple random movement for now if at intersection
        // Or just keep moving in current direction if possible

        // We need 'currentDirection' for ghosts. 
        if (!ghost.direction) ghost.direction = { x: 0, y: 0 };

        // Simple logic: if moving, try to keep moving. If hit wall, pick new direction.
        const nextX = ghost.x + ghost.direction.x * moveSpeed;
        const nextY = ghost.y + ghost.direction.y * moveSpeed;

        if (ghost.direction.x === 0 && ghost.direction.y === 0) {
            // Start moving
            const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
            const valid = dirs.filter(d => canMove(ghost.x + d.x, ghost.y + d.y));
            if (valid.length > 0) {
                ghost.direction = valid[Math.floor(Math.random() * valid.length)];
            }
        } else if (canMove(nextX, nextY)) {
            // Continue
            ghost.x = nextX;
            ghost.y = nextY;

            // Randomly change direction at intersections (every tile)
            // Check if we are near center of tile
            if (Math.abs(ghost.x % 1 - 0.5) < 0.1 && Math.abs(ghost.y % 1 - 0.5) < 0.1) {
                if (Math.random() < 0.3) {
                    const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
                    const valid = dirs.filter(d => canMove(ghost.x + d.x, ghost.y + d.y));
                    if (valid.length > 0) {
                        ghost.direction = valid[Math.floor(Math.random() * valid.length)];
                    }
                }
            }
        } else {
            // Hit wall, pick new random valid direction
            const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
            const valid = dirs.filter(d => canMove(ghost.x + d.x, ghost.y + d.y));
            if (valid.length > 0) {
                ghost.direction = valid[Math.floor(Math.random() * valid.length)];
            } else {
                // Stuck? (Shouldn't happen)
                ghost.direction = { x: -ghost.direction.x, y: -ghost.direction.y };
            }
        }
    });
}

function nextLevel() {
    level++;
    // Reset positions but keep score
    pacman.x = 14; pacman.y = 23;
    pacman.direction = { x: 0, y: 0 };
    initGame(); // Re-inits dots
    // Restore score/level
    // Wait initGame resets score/level?
    // Looking at initGame in file: 
    // it resets dots, powerPellets, ghosts, pacman.
    // It does NOT reset score, lives, level. GOOD.
    document.getElementById('status').textContent = `Level ${level}!`;
}

function activatePowerMode() {
    powerMode = true;
    powerModeTimer = 600; // Frames?
    setTimeout(() => { powerMode = false; }, 10000); // 10 seconds
}


// Direction button controls
function setDirection(dx, dy) {
    if (!gameRunning) {
        startGame();
    }

    if (gamePaused) return;

    pacman.nextDirection = { x: dx, y: dy };
    console.log('Direction set from button:', dx, dy);
}

function stopDirection() {
    // Optional: could reset direction here, but letting it continue is better UX
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.key, e.code);

    if (e.code === 'Space') {
        if (!gameRunning) {
            startGame();
        } else {
            pauseGame();
        }
        e.preventDefault();
        return;
    }

    // Start game automatically if not running
    if (!gameRunning) {
        startGame();
    }

    if (gamePaused) return;

    // Use e.key for arrow keys and e.code for letter keys
    switch (e.key) {
        case 'ArrowUp':
            pacman.nextDirection = { x: 0, y: -1 };
            console.log('Direction set to UP (Arrow)');
            e.preventDefault();
            break;
        case 'ArrowDown':
            pacman.nextDirection = { x: 0, y: 1 };
            console.log('Direction set to DOWN (Arrow)');
            e.preventDefault();
            break;
        case 'ArrowLeft':
            pacman.nextDirection = { x: -1, y: 0 };
            console.log('Direction set to LEFT (Arrow)');
            e.preventDefault();
            break;
        case 'ArrowRight':
            pacman.nextDirection = { x: 1, y: 0 };
            console.log('Direction set to RIGHT (Arrow)');
            e.preventDefault();
            break;
    }

    // Also check e.code for WASD keys
    switch (e.code) {
        case 'KeyW':
            pacman.nextDirection = { x: 0, y: -1 };
            console.log('Direction set to UP (W)');
            e.preventDefault();
            break;
        case 'KeyS':
            pacman.nextDirection = { x: 0, y: 1 };
            console.log('Direction set to DOWN (S)');
            e.preventDefault();
            break;
        case 'KeyA':
            pacman.nextDirection = { x: -1, y: 0 };
            console.log('Direction set to LEFT (A)');
            e.preventDefault();
            break;
        case 'KeyD':
            pacman.nextDirection = { x: 1, y: 0 };
            console.log('Direction set to RIGHT (D)');
            e.preventDefault();
            break;
    }
});

// Mouse controls for canvas
let mouseControlEnabled = false;

document.getElementById('gameCanvas').addEventListener('mousedown', (e) => {
    if (!gameRunning || gamePaused) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to grid coordinates
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    // Calculate direction from Pac-Man to clicked position
    const pacmanGridX = Math.floor(pacman.x);
    const pacmanGridY = Math.floor(pacman.y);

    const dx = gridX - pacmanGridX;
    const dy = gridY - pacmanGridY;

    // Set direction based on which axis has greater difference
    if (Math.abs(dx) > Math.abs(dy)) {
        pacman.nextDirection = { x: dx > 0 ? 1 : -1, y: 0 };
    } else if (dy !== 0) {
        pacman.nextDirection = { x: 0, y: dy > 0 ? 1 : -1 };
    }

    mouseControlEnabled = true;
});

document.getElementById('gameCanvas').addEventListener('mousemove', (e) => {
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
        pacman.nextDirection = { x: dx > 0 ? 1 : -1, y: 0 };
    } else if (dy !== 0) {
        pacman.nextDirection = { x: 0, y: dy > 0 ? 1 : -1 };
    }
});

document.addEventListener('mouseup', () => {
    mouseControlEnabled = false;
});

// Initialize game when DOM is ready
function initializePacman() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Pacman canvas not found!');
        setTimeout(initializePacman, 100);
        return;
    }

    console.log('Initializing Pacman...');
    try {
        initGame();
        drawMaze();
        drawPacman();
        drawGhosts();
        console.log('Pacman initialized successfully!');
    } catch (error) {
        console.error('Error initializing Pacman:', error);
    }
}

// Initialize on DOMContentLoaded or immediately if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializePacman, 100);
    });
} else {
    setTimeout(initializePacman, 100);
}

// Also try on window load as fallback
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas && (!dots || dots.length === 0)) {
        console.log('Initializing Pacman on window load (fallback)');
        initializePacman();
    }
});

