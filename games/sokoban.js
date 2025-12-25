// Sokoban Game (Package Pushing Puzzle)
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const COLS = 20;
const ROWS = 15;

// Level definitions (0=empty, 1=wall, 2=box, 3=target, 4=box on target, 5=player)
const LEVELS = [
    // Level 1
    [
        "11111111111111111111",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "11111111111111111111"
    ],
    // Level 2 - Simple puzzle
    [
        "11111111111111111111",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "10000000000000000001",
        "11111111111111111111"
    ]
];

let currentLevel = 0;
let level = [];
let player = {x: 0, y: 0};
let moves = 0;
let pushes = 0;
let moveHistory = [];

const keys = {};

function initLevel(levelNum) {
    currentLevel = levelNum;
    moves = 0;
    pushes = 0;
    moveHistory = [];
    
    // Create level from template
    level = [];
    for (let row = 0; row < ROWS; row++) {
        level[row] = [];
        for (let col = 0; col < COLS; col++) {
            if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
                level[row][col] = 1; // Wall
            } else {
                level[row][col] = 0; // Empty
            }
        }
    }
    
    // Level 1: Simple puzzle
    if (levelNum === 0) {
        // Add some walls
        for (let i = 2; i < 8; i++) {
            level[5][i] = 1;
            level[9][i] = 1;
        }
        for (let i = 5; i < 9; i++) {
            level[i][7] = 1;
        }
        
        // Add boxes
        level[6][3] = 2;
        level[6][4] = 2;
        level[7][3] = 2;
        
        // Add targets
        level[10][3] = 3;
        level[10][4] = 3;
        level[11][3] = 3;
        
        // Player
        player.x = 2;
        player.y = 6;
        level[player.y][player.x] = 5;
    } else if (levelNum === 1) {
        // Level 2: More complex
        for (let i = 3; i < 10; i++) {
            level[4][i] = 1;
            level[10][i] = 1;
        }
        for (let i = 4; i < 11; i++) {
            level[i][3] = 1;
            level[i][9] = 1;
        }
        
        level[6][5] = 2;
        level[6][6] = 2;
        level[7][5] = 2;
        level[7][6] = 2;
        
        level[8][5] = 3;
        level[8][6] = 3;
        level[9][5] = 3;
        level[9][6] = 3;
        
        player.x = 5;
        player.y = 5;
        level[player.y][player.x] = 5;
    }
    
    updateDisplay();
    render();
}

function render() {
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const offsetX = (canvas.width - COLS * TILE_SIZE) / 2;
    const offsetY = (canvas.height - ROWS * TILE_SIZE) / 2;
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = offsetX + col * TILE_SIZE;
            const y = offsetY + row * TILE_SIZE;
            const cell = level[row][col];
            
            // Draw floor
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            
            if (cell === 1) {
                // Wall
                ctx.fillStyle = '#4A4A4A';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#2A2A2A';
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (cell === 2) {
                // Box
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
                ctx.strokeStyle = '#654321';
                ctx.strokeRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
            } else if (cell === 3) {
                // Target
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FFA500';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (cell === 4) {
                // Box on target
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
            } else if (cell === 5) {
                // Player
                ctx.fillStyle = '#00FF00';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) return;
    
    const nextCell = level[newY][newX];
    
    if (nextCell === 1) {
        // Wall - can't move
        return;
    } else if (nextCell === 2 || nextCell === 4) {
        // Box - try to push
        const boxX = newX + dx;
        const boxY = newY + dy;
        
        if (boxX < 0 || boxX >= COLS || boxY < 0 || boxY >= ROWS) return;
        
        const boxNextCell = level[boxY][boxX];
        
        if (boxNextCell === 1 || boxNextCell === 2 || boxNextCell === 4) {
            // Can't push
            return;
        }
        
        // Push box
        if (boxNextCell === 3) {
            // Push onto target
            level[boxY][boxX] = 4;
        } else {
            level[boxY][boxX] = 2;
        }
        
        // Remove box from old position
        if (nextCell === 4) {
            level[newY][newX] = 3; // Was on target, leave target
        } else {
            level[newY][newX] = 0;
        }
        
        pushes++;
    }
    
    // Move player
    const oldCell = level[player.y][player.x];
    if (oldCell === 5) {
        level[player.y][player.x] = 0;
    }
    
    player.x = newX;
    player.y = newY;
    
    // Check if on target
    if (level[newY][newX] === 3) {
        level[newY][newX] = 5; // Player on target (visual only)
    } else {
        level[newY][newX] = 5;
    }
    
    moves++;
    checkWin();
    updateDisplay();
    render();
}

function checkWin() {
    let boxesOnTargets = 0;
    let totalBoxes = 0;
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (level[row][col] === 2) totalBoxes++;
            if (level[row][col] === 4) {
                boxesOnTargets++;
                totalBoxes++;
            }
        }
    }
    
    if (boxesOnTargets > 0 && boxesOnTargets === totalBoxes) {
        setTimeout(() => {
            alert(`Level ${currentLevel + 1} Complete! Moves: ${moves}, Pushes: ${pushes}`);
            if (currentLevel < LEVELS.length - 1) {
                nextLevel();
            } else {
                alert('All levels complete!');
            }
        }, 100);
    }
}

function updateDisplay() {
    document.getElementById('level').textContent = currentLevel + 1;
    document.getElementById('moves').textContent = moves;
    document.getElementById('pushes').textContent = pushes;
}

document.addEventListener('keydown', (e) => {
    if (keys[e.key]) return; // Prevent key repeat
    keys[e.key] = true;
    
    if (e.key === 'ArrowUp') {
        movePlayer(0, -1);
    } else if (e.key === 'ArrowDown') {
        movePlayer(0, 1);
    } else if (e.key === 'ArrowLeft') {
        movePlayer(-1, 0);
    } else if (e.key === 'ArrowRight') {
        movePlayer(1, 0);
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function restartLevel() {
    initLevel(currentLevel);
}

function nextLevel() {
    if (currentLevel < LEVELS.length - 1) {
        initLevel(currentLevel + 1);
    }
}

function prevLevel() {
    if (currentLevel > 0) {
        initLevel(currentLevel - 1);
    }
}

// Initialize
initLevel(0);

