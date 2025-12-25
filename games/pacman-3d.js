// Pac-Man 3D Game Implementation
// **Timestamp**: 2025-12-04

const TILE_SIZE = 20;
const COLS = 28;
const ROWS = 31;
const DEPTH = 3; // 3 layers deep for 3D effect

// Game state
let pacman3d = {
    x: 14,
    y: 23,
    z: 1, // Middle layer
    direction: { x: 0, y: 0, z: 0 },
    nextDirection: { x: 0, y: 0, z: 0 },
    speed: 2,
    score: 0,
    lives: 3,
    color: '#FFFF00'
};

let ghosts3d = [];
let dots3d = [];
let powerPellets3d = [];
let level = 1;
let gameRunning = false;
let gamePaused = false;
let powerMode = false;
let powerModeTimer = 0;
let gameLoopId;

// Camera/view rotation
let cameraRotationY = 0;
let cameraRotationX = 60;

// 3D Maze layout (now 3D array)
const maze3d = [
    // Layer 0 (Bottom)
    [
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
    ],
    // Layer 1 (Middle) - Same as original but with some openings
    [
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
    ],
    // Layer 2 (Top) - Similar but with tunnels between layers
    [
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
    ]
];

// Initialize game
function initGame3D() {
    // Create maze elements
    const mazeElement = document.getElementById('maze3d');
    mazeElement.innerHTML = '';

    // Create 3D maze walls
    for (let z = 0; z < DEPTH; z++) {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (maze3d[z][row][col] === 1) {
                    const wall = document.createElement('div');
                    wall.className = 'wall-3d';
                    wall.style.left = `${col * TILE_SIZE}px`;
                    wall.style.top = `${row * TILE_SIZE}px`;
                    wall.style.transform = `translateZ(${z * TILE_SIZE * 2}px)`;
                    wall.style.width = `${TILE_SIZE}px`;
                    wall.style.height = `${TILE_SIZE}px`;
                    mazeElement.appendChild(wall);
                } else if (maze3d[z][row][col] === 2) {
                    // Dots
                    const dot = document.createElement('div');
                    dot.className = 'dot-3d';
                    dot.style.left = `${col * TILE_SIZE + 8}px`;
                    dot.style.top = `${row * TILE_SIZE + 8}px`;
                    dot.style.transform = `translateZ(${z * TILE_SIZE * 2}px)`;
                    dot.dataset.x = col;
                    dot.dataset.y = row;
                    dot.dataset.z = z;
                    dot.dataset.eaten = 'false';
                    mazeElement.appendChild(dot);
                    dots3d.push({element: dot, x: col, y: row, z: z, eaten: false});
                } else if (maze3d[z][row][col] === 3) {
                    // Power pellets
                    const pellet = document.createElement('div');
                    pellet.className = 'power-pellet-3d';
                    pellet.style.left = `${col * TILE_SIZE + 4}px`;
                    pellet.style.top = `${row * TILE_SIZE + 4}px`;
                    pellet.style.transform = `translateZ(${z * TILE_SIZE * 2}px)`;
                    pellet.dataset.x = col;
                    pellet.dataset.y = row;
                    pellet.dataset.z = z;
                    mazeElement.appendChild(pellet);
                    powerPellets3d.push({element: pellet, x: col, y: row, z: z});
                }
            }
        }
    }

    // Create Pac-Man
    const pacmanElement = document.createElement('div');
    pacmanElement.className = 'pacman-3d';
    pacmanElement.id = 'pacman3d';
    pacmanElement.style.left = `${pacman3d.x * TILE_SIZE}px`;
    pacmanElement.style.top = `${pacman3d.y * TILE_SIZE}px`;
    pacmanElement.style.transform = `translateZ(${pacman3d.z * TILE_SIZE * 2}px)`;
    mazeElement.appendChild(pacmanElement);

    // Initialize ghosts
    ghosts3d = [
        { x: 12, y: 11, z: 1, color: '#FF0000', name: 'Blinky', mode: 'chase', speed: 1.8 },
        { x: 14, y: 11, z: 1, color: '#FFB8FF', name: 'Pinky', mode: 'chase', speed: 1.8 },
        { x: 13, y: 14, z: 1, color: '#00FFFF', name: 'Inky', mode: 'scatter', speed: 1.8 },
        { x: 15, y: 14, z: 1, color: '#FFB851', name: 'Clyde', mode: 'scatter', speed: 1.8 }
    ];

    ghosts3d.forEach(ghost => {
        const ghostElement = document.createElement('div');
        ghostElement.className = 'ghost-3d';
        ghostElement.style.left = `${ghost.x * TILE_SIZE}px`;
        ghostElement.style.top = `${ghost.y * TILE_SIZE}px`;
        ghostElement.style.transform = `translateZ(${ghost.z * TILE_SIZE * 2}px)`;
        ghostElement.style.background = ghost.color;
        ghostElement.style.boxShadow = `0 0 10px ${ghost.color}`;
        mazeElement.appendChild(ghostElement);
        ghost.element = ghostElement;
    });

    powerMode = false;
    powerModeTimer = 0;
    updateScoreDisplay();
}

function canMove3D(x, y, z) {
    const col = Math.floor(x);
    const row = Math.floor(y);
    const layer = Math.floor(z);

    if (layer < 0 || layer >= DEPTH || row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        return false;
    }

    return maze3d[layer][row][col] !== 1;
}

function movePacman3D() {
    const moveSpeed = pacman3d.speed * 0.07;

    // Try to change direction
    if (pacman3d.nextDirection.x !== 0 || pacman3d.nextDirection.y !== 0 || pacman3d.nextDirection.z !== 0) {
        const nextX = pacman3d.x + pacman3d.nextDirection.x * moveSpeed;
        const nextY = pacman3d.y + pacman3d.nextDirection.y * moveSpeed;
        const nextZ = pacman3d.z + pacman3d.nextDirection.z * moveSpeed;

        if (canMove3D(nextX, nextY, nextZ)) {
            pacman3d.direction = pacman3d.nextDirection;
        }
    }

    // Move in current direction
    if (pacman3d.direction.x !== 0 || pacman3d.direction.y !== 0 || pacman3d.direction.z !== 0) {
        const newX = pacman3d.x + pacman3d.direction.x * moveSpeed;
        const newY = pacman3d.y + pacman3d.direction.y * moveSpeed;
        const newZ = pacman3d.z + pacman3d.direction.z * moveSpeed;

        if (canMove3D(newX, newY, newZ)) {
            pacman3d.x = newX;
            pacman3d.y = newY;
            pacman3d.z = newZ;

            // Update Pac-Man position
            const pacmanElement = document.getElementById('pacman3d');
            pacmanElement.style.left = `${pacman3d.x * TILE_SIZE}px`;
            pacmanElement.style.top = `${pacman3d.y * TILE_SIZE}px`;
            pacmanElement.style.transform = `translateZ(${pacman3d.z * TILE_SIZE * 2}px)`;

            // Tunnel wraparound
            if (pacman3d.x < -0.5) pacman3d.x = COLS - 0.5;
            if (pacman3d.x >= COLS + 0.5) pacman3d.x = 0.5;
        } else {
            pacman3d.direction = { x: 0, y: 0, z: 0 };
        }
    }

    // Check dot collision
    const pacmanCol = Math.floor(pacman3d.x);
    const pacmanRow = Math.floor(pacman3d.y);
    const pacmanLayer = Math.floor(pacman3d.z);

    // Check dots
    for (let i = dots3d.length - 1; i >= 0; i--) {
        const dot = dots3d[i];
        if (dot.x === pacmanCol && dot.y === pacmanRow && dot.z === pacmanLayer && !dot.eaten) {
            dot.eaten = true;
            dot.element.style.display = 'none';
            pacman3d.score += 10;
            updateScoreDisplay();
            break;
        }
    }

    // Check power pellets
    for (let i = powerPellets3d.length - 1; i >= 0; i--) {
        const pellet = powerPellets3d[i];
        if (pellet.x === pacmanCol && pellet.y === pacmanRow && pellet.z === pacmanLayer) {
            powerPellets3d.splice(i, 1);
            pellet.element.remove();
            pacman3d.score += 50;
            powerMode = true;
            powerModeTimer = 600; // 10 seconds at 60fps
            updateScoreDisplay();
            break;
        }
    }

    // Check win condition
    const uneatenDots = dots3d.filter(dot => !dot.eaten);
    if (uneatenDots.length === 0 && powerPellets3d.length === 0) {
        level++;
        initGame3D();
        startGame3D();
    }
}

function moveGhosts3D() {
    ghosts3d.forEach(ghost => {
        let newX = ghost.x;
        let newY = ghost.y;
        let newZ = ghost.z;

        // Simple AI for 3D movement
        switch(ghost.name) {
            case 'Blinky': // Chaser
                if (Math.abs(ghost.x - pacman3d.x) > Math.abs(ghost.y - pacman3d.y)) {
                    newX += ghost.x < pacman3d.x ? 0.05 : -0.05;
                } else {
                    newY += ghost.y < pacman3d.y ? 0.05 : -0.05;
                }
                // Sometimes move between layers
                if (Math.random() < 0.01) {
                    newZ += ghost.z < pacman3d.z ? 0.05 : -0.05;
                }
                break;

            case 'Pinky': // Ambusher
                const targetX = pacman3d.x + pacman3d.direction.x * 4;
                const targetY = pacman3d.y + pacman3d.direction.y * 4;
                if (Math.abs(ghost.x - targetX) > Math.abs(ghost.y - targetY)) {
                    newX += ghost.x < targetX ? 0.05 : -0.05;
                } else {
                    newY += ghost.y < targetY ? 0.05 : -0.05;
                }
                break;

            case 'Inky': // Patrol
                if (ghost.mode === 'scatter') {
                    if (ghost.x < 20) newX += 0.05;
                    if (ghost.y > 5) newY -= 0.05;
                }
                break;

            case 'Clyde': // Random
                if (Math.random() < 0.02) {
                    const directions = [
                        {x: 0, y: -1, z: 0}, {x: 0, y: 1, z: 0}, {x: -1, y: 0, z: 0}, {x: 1, y: 0, z: 0},
                        {x: 0, y: 0, z: -1}, {x: 0, y: 0, z: 1}
                    ];
                    const dir = directions[Math.floor(Math.random() * directions.length)];
                    ghost.direction = dir;
                }
                newX += ghost.direction.x * 0.05;
                newY += ghost.direction.y * 0.05;
                newZ += ghost.direction.z * 0.05;
                break;
        }

        // Check wall collision
        if (canMove3D(newX, newY, newZ)) {
            ghost.x = newX;
            ghost.y = newY;
            ghost.z = newZ;

            // Update ghost position
            ghost.element.style.left = `${ghost.x * TILE_SIZE}px`;
            ghost.element.style.top = `${ghost.y * TILE_SIZE}px`;
            ghost.element.style.transform = `translateZ(${ghost.z * TILE_SIZE * 2}px)`;
        }

        // Check collision with Pac-Man
        if (Math.abs(ghost.x - pacman3d.x) < 0.5 && Math.abs(ghost.y - pacman3d.y) < 0.5 && Math.abs(ghost.z - pacman3d.z) < 0.5) {
            if (powerMode) {
                // Eat ghost
                pacman3d.score += 200;
                ghost.x = 14;
                ghost.y = 11;
                ghost.z = 1;
                ghost.element.style.left = `${ghost.x * TILE_SIZE}px`;
                ghost.element.style.top = `${ghost.y * TILE_SIZE}px`;
                ghost.element.style.transform = `translateZ(${ghost.z * TILE_SIZE * 2}px)`;
                updateScoreDisplay();
            } else {
                // Lose a life
                pacman3d.lives--;
                if (pacman3d.lives <= 0) {
                    gameOver3D('Game Over! Final Score: ' + pacman3d.score);
                } else {
                    // Reset positions
                    pacman3d.x = 14;
                    pacman3d.y = 23;
                    pacman3d.z = 1;
                    document.getElementById('pacman3d').style.left = `${pacman3d.x * TILE_SIZE}px`;
                    document.getElementById('pacman3d').style.top = `${pacman3d.y * TILE_SIZE}px`;
                    document.getElementById('pacman3d').style.transform = `translateZ(${pacman3d.z * TILE_SIZE * 2}px)`;

                    ghosts3d.forEach(g => {
                        g.x = 14;
                        g.y = 11;
                        g.z = 1;
                        g.element.style.left = `${g.x * TILE_SIZE}px`;
                        g.element.style.top = `${g.y * TILE_SIZE}px`;
                        g.element.style.transform = `translateZ(${g.z * TILE_SIZE * 2}px)`;
                    });
                    updateScoreDisplay();
                }
            }
        }
    });
}

function gameLoop3D() {
    if (!gamePaused) {
        movePacman3D();
        moveGhosts3D();

        // Power mode timer
        if (powerMode) {
            powerModeTimer--;
            if (powerModeTimer <= 0) {
                powerMode = false;
            }
        }
    }
}

function startGame3D() {
    if (gameRunning) return;

    gameRunning = true;
    gamePaused = false;
    document.getElementById('status').textContent = 'Playing Pac-Man 3D!';

    if (!gameLoopId) {
        gameLoopId = setInterval(gameLoop3D, 1000/60);
    }
}

function pauseGame3D() {
    gamePaused = !gamePaused;
    document.getElementById('status').textContent = gamePaused ? 'Paused - Press SPACE to resume' : 'Playing Pac-Man 3D!';
}

function gameOver3D(message) {
    gameRunning = false;
    clearInterval(gameLoopId);
    gameLoopId = null;
    document.getElementById('status').textContent = message;
}

// Direction button controls
function setDirection(dx, dy) {
    if (!gameRunning || gamePaused) return;
    pacman3d.nextDirection = {x: dx, y: dy, z: 0};
}

function stopDirection() {
    // Let direction continue
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning) {
            startGame3D();
        } else {
            pauseGame3D();
        }
        e.preventDefault();
        return;
    }

    if (!gameRunning || gamePaused) return;

    switch(e.key) {
        case 'ArrowUp':
        case 'KeyW':
            pacman3d.nextDirection = {x: 0, y: -1, z: 0};
            break;
        case 'ArrowDown':
        case 'KeyS':
            pacman3d.nextDirection = {x: 0, y: 1, z: 0};
            break;
        case 'ArrowLeft':
        case 'KeyA':
            pacman3d.nextDirection = {x: -1, y: 0, z: 0};
            break;
        case 'ArrowRight':
        case 'KeyD':
            pacman3d.nextDirection = {x: 1, y: 0, z: 0};
            break;
        case 'KeyQ':
            pacman3d.nextDirection = {x: 0, y: 0, z: -1}; // Down a layer
            break;
        case 'KeyE':
            pacman3d.nextDirection = {x: 0, y: 0, z: 1}; // Up a layer
            break;
    }
    e.preventDefault();
});

// Camera controls
function rotateView(angle) {
    cameraRotationY += angle;
    updateCamera();
}

function tiltView(angle) {
    cameraRotationX += angle;
    updateCamera();
}

function updateCamera() {
    const mazeElement = document.getElementById('maze3d');
    mazeElement.style.transform = `rotateX(${cameraRotationX}deg) rotateY(${cameraRotationY}deg)`;
}

function updateScoreDisplay() {
    document.querySelector('.score').textContent = `Score: ${pacman3d.score}`;
    document.querySelector('.lives').textContent = `Lives: ${pacman3d.lives}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initGame3D();
});