// Pac-Man vs AI Game Implementation
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 20;
const COLS = 28;
const ROWS = 31;

// Game state
let playerPacman = {
    x: 14,
    y: 23,
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    mouthOpen: 0,
    speed: 2,
    score: 0,
    color: '#FFFF00'
};

let aiPacman = {
    x: 14,
    y: 3,
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    mouthOpen: 0,
    speed: 2,
    score: 0,
    color: '#FF6B6B',
    lastDecisionTime: 0,
    difficulty: 'easy'
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
                dots.push({x: col, y: row, eaten: false, eatenBy: null});
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

    // Reset Pac-Men
    playerPacman = {
        x: 14,
        y: 23,
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 },
        mouthOpen: 0,
        speed: 2,
        score: 0,
        color: '#FFFF00'
    };

    aiPacman = {
        x: 14,
        y: 3,
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 },
        mouthOpen: 0,
        speed: getAISpeed(),
        score: 0,
        color: '#FF6B6B',
        lastDecisionTime: 0,
        difficulty: aiPacman.difficulty
    };

    powerMode = false;
    powerModeTimer = 0;
    updateScoreDisplay();
}

function setDifficulty(difficulty) {
    // Remove active class from all buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));

    // Add active class to clicked button
    event.target.classList.add('active');

    aiPacman.difficulty = difficulty;
    aiPacman.speed = getAISpeed();

    if (gameRunning) {
        // Update AI speed during gameplay
        aiPacman.speed = getAISpeed();
    }
}

function getAISpeed() {
    switch(aiPacman.difficulty) {
        case 'easy': return 1.5;
        case 'medium': return 1.8;
        case 'hard': return 2.0;
        case 'expert': return 2.2;
        default: return 1.8;
    }
}

// Direction button controls
function setDirection(dx, dy) {
    if (!gameRunning || gamePaused) return;
    playerPacman.nextDirection = {x: dx, y: dy};
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
            playerPacman.nextDirection = {x: 0, y: -1};
            break;
        case 'ArrowDown':
        case 'KeyS':
            playerPacman.nextDirection = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
        case 'KeyA':
            playerPacman.nextDirection = {x: -1, y: 0};
            break;
        case 'ArrowRight':
        case 'KeyD':
            playerPacman.nextDirection = {x: 1, y: 0};
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

    const pacmanGridX = Math.floor(playerPacman.x);
    const pacmanGridY = Math.floor(playerPacman.y);

    const dx = gridX - pacmanGridX;
    const dy = gridY - pacmanGridY;

    if (Math.abs(dx) > Math.abs(dy)) {
        playerPacman.nextDirection = {x: dx > 0 ? 1 : -1, y: 0};
    } else if (dy !== 0) {
        playerPacman.nextDirection = {x: 0, y: dy > 0 ? 1 : -1};
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

    const pacmanGridX = Math.floor(playerPacman.x);
    const pacmanGridY = Math.floor(playerPacman.y);

    const dx = gridX - pacmanGridX;
    const dy = gridY - pacmanGridY;

    if (Math.abs(dx) > Math.abs(dy)) {
        playerPacman.nextDirection = {x: dx > 0 ? 1 : -1, y: 0};
    } else if (dy !== 0) {
        playerPacman.nextDirection = {x: 0, y: dy > 0 ? 1 : -1};
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

function movePacman(pacman) {
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
            dots[i].eatenBy = pacman === playerPacman ? 'player' : 'ai';
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

function makeAIDecision() {
    const now = Date.now();

    // Make decisions less frequently based on difficulty
    const decisionInterval = {
        'easy': 1000,   // 1 second
        'medium': 700,  // 0.7 seconds
        'hard': 500,    // 0.5 seconds
        'expert': 300   // 0.3 seconds
    };

    if (now - aiPacman.lastDecisionTime < decisionInterval[aiPacman.difficulty]) {
        return;
    }

    aiPacman.lastDecisionTime = now;

    // Find nearest uneaten dot
    let nearestDot = null;
    let nearestDistance = Infinity;

    for (let dot of dots) {
        if (!dot.eaten) {
            const distance = Math.abs(dot.x - aiPacman.x) + Math.abs(dot.y - aiPacman.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestDot = dot;
            }
        }
    }

    if (nearestDot) {
        // Calculate direction to nearest dot
        const dx = nearestDot.x - aiPacman.x;
        const dy = nearestDot.y - aiPacman.y;

        // Choose primary direction
        if (Math.abs(dx) > Math.abs(dy)) {
            aiPacman.nextDirection = {x: dx > 0 ? 1 : -1, y: 0};
        } else {
            aiPacman.nextDirection = {x: 0, y: dy > 0 ? 1 : -1};
        }

        // Add some randomness based on difficulty
        const randomFactor = {
            'easy': 0.3,   // 30% chance of random move
            'medium': 0.2, // 20% chance
            'hard': 0.1,   // 10% chance
            'expert': 0.05 // 5% chance
        };

        if (Math.random() < randomFactor[aiPacman.difficulty]) {
            const directions = [
                {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
            ];
            aiPacman.nextDirection = directions[Math.floor(Math.random() * directions.length)];
        }
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        let newX = ghost.x;
        let newY = ghost.y;

        // Simple AI for different ghost behaviors
        switch(ghost.name) {
            case 'Blinky': // Chaser - target Pac-Man (player)
                if (Math.abs(ghost.x - playerPacman.x) > Math.abs(ghost.y - playerPacman.y)) {
                    newX += ghost.x < playerPacman.x ? 0.05 : -0.05;
                } else {
                    newY += ghost.y < playerPacman.y ? 0.05 : -0.05;
                }
                break;

            case 'Pinky': // Ambusher - target ahead of player
                const targetX = playerPacman.x + playerPacman.direction.x * 4;
                const targetY = playerPacman.y + playerPacman.direction.y * 4;
                if (Math.abs(ghost.x - targetX) > Math.abs(ghost.y - targetY)) {
                    newX += ghost.x < targetX ? 0.05 : -0.05;
                } else {
                    newY += ghost.y < targetY ? 0.05 : -0.05;
                }
                break;

            case 'Inky': // Patrol - move in patterns
                if (ghost.mode === 'scatter') {
                    // Move towards top-right corner
                    if (ghost.x < 20) newX += 0.05;
                    if (ghost.y > 5) newY -= 0.05;
                } else {
                    newX += Math.sin(Date.now() * 0.001) * 0.05;
                    newY += Math.cos(Date.now() * 0.001) * 0.05;
                }
                break;

            case 'Clyde': // Random - unpredictable movement
                if (Math.random() < 0.02) {
                    const directions = [
                        {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
                    ];
                    const dir = directions[Math.floor(Math.random() * directions.length)];
                    ghost.direction = dir;
                }
                newX += ghost.direction.x * 0.05;
                newY += ghost.direction.y * 0.05;
                break;
        }

        // Check wall collision
        if (canMove(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        }

        // Check collision with player Pac-Man
        if (Math.abs(ghost.x - playerPacman.x) < 0.5 && Math.abs(ghost.y - playerPacman.y) < 0.5) {
            if (powerMode) {
                // Eat ghost
                playerPacman.score += 200;
                ghost.x = 14;
                ghost.y = 11;
                updateScoreDisplay();
            } else {
                // Player dies - AI wins round
                aiPacman.score += 500; // Bonus for defeating player
                gameOver('AI Wins! Player was caught by ghost.');
                return;
            }
        }

        // Check collision with AI Pac-Man
        if (Math.abs(ghost.x - aiPacman.x) < 0.5 && Math.abs(ghost.y - aiPacman.y) < 0.5) {
            if (powerMode) {
                // Eat ghost
                aiPacman.score += 200;
                ghost.x = 14;
                ghost.y = 11;
                updateScoreDisplay();
            }
            // AI can be caught too, but it just respawns
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

    // Draw dots with ownership indication
    dots.forEach(dot => {
        if (!dot.eaten) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc((dot.x + 0.5) * TILE_SIZE, (dot.y + 0.5) * TILE_SIZE, 2, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Draw eaten dots with different colors
            ctx.fillStyle = dot.eatenBy === 'player' ? '#FFFF00' : '#FF6B6B';
            ctx.beginPath();
            ctx.arc((dot.x + 0.5) * TILE_SIZE, (dot.y + 0.5) * TILE_SIZE, 1, 0, 2 * Math.PI);
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

    // Draw player Pac-Man
    ctx.fillStyle = playerPacman.color;
    const playerCenterX = (playerPacman.x + 0.5) * TILE_SIZE;
    const playerCenterY = (playerPacman.y + 0.5) * TILE_SIZE;
    const radius = TILE_SIZE * 0.4;

    const mouthAngle = Math.sin(playerPacman.mouthOpen) * 0.3;
    ctx.beginPath();
    ctx.arc(playerCenterX, playerCenterY, radius, mouthAngle, 2 * Math.PI - mouthAngle);
    ctx.lineTo(playerCenterX, playerCenterY);
    ctx.fill();

    // Draw AI Pac-Man
    ctx.fillStyle = aiPacman.color;
    const aiCenterX = (aiPacman.x + 0.5) * TILE_SIZE;
    const aiCenterY = (aiPacman.y + 0.5) * TILE_SIZE;

    const aiMouthAngle = Math.sin(aiPacman.mouthOpen) * 0.3;
    ctx.beginPath();
    ctx.arc(aiCenterX, aiCenterY, radius, aiMouthAngle, 2 * Math.PI - aiMouthAngle);
    ctx.lineTo(aiCenterX, aiCenterY);
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
        movePacman(playerPacman);
        makeAIDecision();
        movePacman(aiPacman);
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
    document.getElementById('status').textContent = 'Playing...';

    if (!gameLoopId) {
        gameLoopId = setInterval(gameLoop, 1000/60);
    }
}

function pauseGame() {
    gamePaused = !gamePaused;
    document.getElementById('status').textContent = gamePaused ? 'Paused - Press SPACE to resume' : 'Playing...';
}

function gameOver(message) {
    gameRunning = false;
    clearInterval(gameLoopId);
    gameLoopId = null;
    document.getElementById('status').textContent = message || `Game Over! Player: ${playerPacman.score} | AI: ${aiPacman.score}`;
}

function updateScoreDisplay() {
    document.querySelector('.player-score').textContent = `Player: ${playerPacman.score}`;
    document.querySelector('.ai-score').textContent = `AI: ${aiPacman.score}`;
}

// Initialize
initGame();
