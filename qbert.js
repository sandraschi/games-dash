// Q*bert Game Implementation - Complete Edition
// **Timestamp**: 2025-12-04
// Now with Coily, Ugg, Wrongway, Elevators, and Proper Scoring!

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CUBE_SIZE = 60;
let qbert = { row: 0, col: 0 };
let pyramid = [];
let enemies = [];
let elevators = [];
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let targetColor = '#FF00FF';
let currentColor = '#FFA500';
let difficulty = 1;
let enemySpawnTimer = 0;
let coilySpawnTimer = 0;

// Scoring
const SCORES = {
    cubeChange: 25,
    levelComplete: 1000,
    coilyDefeat: 500,
    enemyAvoid: 50,
    elevator: 100
};

function setDifficulty(level) {
    difficulty = level;
    [1, 2, 3].forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        if (btn) btn.classList.toggle('active', d === level);
    });
}

function initPyramid() {
    pyramid = [];
    for (let row = 0; row < 7; row++) {
        pyramid[row] = [];
        for (let col = 0; col <= row; col++) {
            pyramid[row][col] = {
                color: currentColor,
                changed: false
            };
        }
    }
    
    // Create elevators on sides (top cubes only)
    elevators = [
        {row: 0, col: -1, active: true}, // Left side
        {row: 0, col: 1, active: true}   // Right side (off the actual pyramid)
    ];
}

function getCubePosition(row, col) {
    const centerX = canvas.width / 2;
    const startY = 100;
    
    const x = centerX + (col - row / 2) * CUBE_SIZE;
    const y = startY + row * CUBE_SIZE * 0.5;
    
    return { x, y };
}

function drawCube(x, y, color) {
    // Top face
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + CUBE_SIZE / 2, y + CUBE_SIZE / 4);
    ctx.lineTo(x, y + CUBE_SIZE / 2);
    ctx.lineTo(x - CUBE_SIZE / 2, y + CUBE_SIZE / 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Left face
    ctx.fillStyle = darkenColor(color, 0.3);
    ctx.beginPath();
    ctx.moveTo(x, y + CUBE_SIZE / 2);
    ctx.lineTo(x - CUBE_SIZE / 2, y + CUBE_SIZE / 4);
    ctx.lineTo(x - CUBE_SIZE / 2, y + CUBE_SIZE * 0.75);
    ctx.lineTo(x, y + CUBE_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Right face
    ctx.fillStyle = darkenColor(color, 0.5);
    ctx.beginPath();
    ctx.moveTo(x, y + CUBE_SIZE / 2);
    ctx.lineTo(x + CUBE_SIZE / 2, y + CUBE_SIZE / 4);
    ctx.lineTo(x + CUBE_SIZE / 2, y + CUBE_SIZE * 0.75);
    ctx.lineTo(x, y + CUBE_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgb(${r * (1 - factor)}, ${g * (1 - factor)}, ${b * (1 - factor)})`;
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pyramid
    for (let row = pyramid.length - 1; row >= 0; row--) {
        for (let col = 0; col <= row; col++) {
            const pos = getCubePosition(row, col);
            drawCube(pos.x, pos.y, pyramid[row][col].color);
        }
    }
    
    // Draw elevators (flying discs)
    elevators.forEach(elevator => {
        if (elevator.active) {
            const pos = getCubePosition(elevator.row, elevator.col);
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y + 20, 25, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
    
    // Draw enemies
    enemies.forEach(enemy => drawEnemy(enemy));
    
    // Draw Q*bert
    const qPos = getCubePosition(qbert.row, qbert.col);
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(qPos.x, qPos.y - 10, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Q*bert eyes
    ctx.fillStyle = '#FFF';
    ctx.fillRect(qPos.x - 8, qPos.y - 15, 6, 6);
    ctx.fillRect(qPos.x + 2, qPos.y - 15, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(qPos.x - 6, qPos.y - 13, 3, 3);
    ctx.fillRect(qPos.x + 4, qPos.y - 13, 3, 3);
    
    // Q*bert snout
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.arc(qPos.x, qPos.y - 7, 5, 0, Math.PI);
    ctx.fill();
    
    if (gameRunning && !gamePaused) {
        requestAnimationFrame(draw);
    }
}

function drawEnemy(enemy) {
    const pos = getCubePosition(enemy.row, enemy.col);
    
    if (enemy.type === 'coily') {
        // Coily the snake (purple)
        ctx.fillStyle = '#8B00FF';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Snake eyes
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(pos.x - 6, pos.y - 12, 4, 4);
        ctx.fillRect(pos.x + 2, pos.y - 12, 4, 4);
        
        // Tongue
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(pos.x - 1, pos.y - 5, 2, 8);
    } else if (enemy.type === 'ugg') {
        // Ugg (purple, moves down-left)
        ctx.fillStyle = '#9B59B6';
        ctx.fillRect(pos.x - 8, pos.y - 15, 16, 16);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(pos.x - 5, pos.y - 12, 4, 4);
        ctx.fillRect(pos.x + 1, pos.y - 12, 4, 4);
    } else if (enemy.type === 'wrongway') {
        // Wrongway (purple, moves down-right)
        ctx.fillStyle = '#8E44AD';
        ctx.fillRect(pos.x - 8, pos.y - 15, 16, 16);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(pos.x - 5, pos.y - 12, 4, 4);
        ctx.fillRect(pos.x + 1, pos.y - 12, 4, 4);
    }
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (enemy.type === 'coily') {
            // Coily chases Q*bert!
            if (enemy.row < qbert.row) {
                if (enemy.col < qbert.col) {
                    enemy.row++;
                    enemy.col++;
                } else {
                    enemy.row++;
                }
            }
        } else if (enemy.type === 'ugg') {
            // Ugg moves down-left
            if (enemy.row < 6) {
                enemy.row++;
            } else {
                enemies.splice(index, 1);
            }
        } else if (enemy.type === 'wrongway') {
            // Wrongway moves down-right
            if (enemy.row < 6 && enemy.col < enemy.row) {
                enemy.row++;
                enemy.col++;
            } else {
                enemies.splice(index, 1);
            }
        }
        
        // Check collision with Q*bert
        if (enemy.row === qbert.row && enemy.col === qbert.col) {
            if (enemy.type === 'coily') {
                loseLife();
            }
            enemies.splice(index, 1);
        }
    });
}

function spawnEnemies() {
    enemySpawnTimer++;
    coilySpawnTimer++;
    
    const spawnRate = 180 / difficulty; // Faster on higher difficulty
    
    // Spawn Coily
    if (coilySpawnTimer > spawnRate * 2 && enemies.filter(e => e.type === 'coily').length === 0) {
        enemies.push({type: 'coily', row: 0, col: 0});
        coilySpawnTimer = 0;
    }
    
    // Spawn Ugg/Wrongway
    if (enemySpawnTimer > spawnRate && Math.random() < 0.5) {
        const type = Math.random() < 0.5 ? 'ugg' : 'wrongway';
        const startRow = Math.floor(Math.random() * 4) + 2;
        enemies.push({type, row: startRow, col: type === 'ugg' ? 0 : startRow});
        enemySpawnTimer = 0;
    }
}

function useElevator() {
    // Check if Q*bert is on a cube adjacent to an elevator
    if (qbert.row === 0 && (qbert.col === 0 || qbert.col === qbert.row)) {
        // Can use elevator!
        score += SCORES.elevator;
        
        // Defeat Coily if chasing
        const coilyIndex = enemies.findIndex(e => e.type === 'coily');
        if (coilyIndex !== -1) {
            enemies.splice(coilyIndex, 1);
            score += SCORES.coilyDefeat;
        }
        
        // Teleport to top
        qbert.row = 0;
        qbert.col = 0;
        
        updateScore();
        return true;
    }
    return false;
}

function moveQbert(rowDelta, colDelta) {
    const newRow = qbert.row + rowDelta;
    const newCol = qbert.col + colDelta;
    
    // Check bounds
    if (newRow < 0 || newRow >= pyramid.length) {
        // Try to use elevator
        if (!useElevator()) {
            loseLife();
        }
        return;
    }
    if (newCol < 0 || newCol > newRow) {
        // Try to use elevator
        if (!useElevator()) {
            loseLife();
        }
        return;
    }
    
    qbert.row = newRow;
    qbert.col = newCol;
    
    // Change cube color
    if (!pyramid[newRow][newCol].changed) {
        pyramid[newRow][newCol].color = targetColor;
        pyramid[newRow][newCol].changed = true;
        score += SCORES.cubeChange;
        
        // Check if all cubes changed
        if (checkLevelComplete()) {
            levelComplete();
        }
    }
    
    updateScore();
}

function checkLevelComplete() {
    for (let r = 0; r < pyramid.length; r++) {
        for (let c = 0; c <= r; c++) {
            if (!pyramid[r][c].changed) return false;
        }
    }
    return true;
}

function levelComplete() {
    score += SCORES.levelComplete;
    level++;
    qbert.row = 0;
    qbert.col = 0;
    enemies = [];
    targetColor = ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00', '#FF6B6B'][level % 5];
    initPyramid();
    updateScore();
}

function loseLife() {
    lives--;
    if (lives <= 0) {
        gameOver();
    } else {
        qbert.row = 0;
        qbert.col = 0;
        enemies = enemies.filter(e => e.type !== 'coily'); // Remove Coily on death
    }
    updateScore();
}

function gameOver() {
    gameRunning = false;
    document.getElementById('status').textContent = 'GAME OVER! Press Start to Restart';
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFA500';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '32px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score} | Lives: ${lives} | Level: ${level}`;
}

function startGame() {
    initPyramid();
    qbert.row = 0;
    qbert.col = 0;
    score = 0;
    lives = 3;
    level = 1;
    enemies = [];
    enemySpawnTimer = 0;
    coilySpawnTimer = 0;
    gameRunning = true;
    gamePaused = false;
    document.getElementById('status').textContent = 'Game Running - Watch out for Coily!';
    updateScore();
    gameLoop();
}

function pauseGame() {
    gamePaused = !gamePaused;
    document.getElementById('status').textContent = gamePaused ? 'Game Paused' : 'Game Running';
    if (!gamePaused && gameRunning) {
        gameLoop();
    }
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    updateEnemies();
    spawnEnemies();
    draw();
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
    
    // Diagonal movement (Q*bert style)
    switch(e.key) {
        case 'ArrowUp':     // Up-left
            moveQbert(-1, -1);
            break;
        case 'ArrowRight':  // Up-right
            moveQbert(-1, 0);
            break;
        case 'ArrowDown':   // Down-right
            moveQbert(1, 1);
            break;
        case 'ArrowLeft':   // Down-left
            moveQbert(1, 0);
            break;
        case 'e':
        case 'E':
            // Emergency elevator (if adjacent)
            useElevator();
            break;
    }
    e.preventDefault();
});

// Initialize display
initPyramid();
draw();
