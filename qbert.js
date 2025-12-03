// Q*bert Game Implementation
// **Timestamp**: 2025-12-03

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CUBE_SIZE = 60;
let qbert = { row: 0, col: 0 };
let pyramid = [];
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let gameLoop;
let targetColor = '#FF00FF';
let currentColor = '#FFA500';

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
    if (!gameRunning || gamePaused) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pyramid
    for (let row = pyramid.length - 1; row >= 0; row--) {
        for (let col = 0; col <= row; col++) {
            const pos = getCubePosition(row, col);
            drawCube(pos.x, pos.y, pyramid[row][col].color);
        }
    }
    
    // Draw Q*bert
    const qPos = getCubePosition(qbert.row, qbert.col);
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(qPos.x, qPos.y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.fillRect(qPos.x - 8, qPos.y - 5, 6, 6);
    ctx.fillRect(qPos.x + 2, qPos.y - 5, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(qPos.x - 6, qPos.y - 3, 3, 3);
    ctx.fillRect(qPos.x + 4, qPos.y - 3, 3, 3);
    
    requestAnimationFrame(draw);
}

function moveQbert(rowDelta, colDelta) {
    const newRow = qbert.row + rowDelta;
    const newCol = qbert.col + colDelta;
    
    // Check bounds
    if (newRow < 0 || newRow >= pyramid.length) {
        loseLife();
        return;
    }
    if (newCol < 0 || newCol > newRow) {
        loseLife();
        return;
    }
    
    qbert.row = newRow;
    qbert.col = newCol;
    
    // Change cube color
    if (!pyramid[newRow][newCol].changed) {
        pyramid[newRow][newCol].color = targetColor;
        pyramid[newRow][newCol].changed = true;
        score += 25;
        
        // Check if all cubes changed
        let allChanged = true;
        for (let r = 0; r < pyramid.length; r++) {
            for (let c = 0; c <= r; c++) {
                if (!pyramid[r][c].changed) {
                    allChanged = false;
                    break;
                }
            }
            if (!allChanged) break;
        }
        
        if (allChanged) {
            nextLevel();
        }
    }
    
    updateScore();
}

function loseLife() {
    lives--;
    if (lives <= 0) {
        gameOver();
    } else {
        qbert.row = 0;
        qbert.col = 0;
    }
}

function nextLevel() {
    level++;
    qbert.row = 0;
    qbert.col = 0;
    targetColor = ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00'][level % 4];
    initPyramid();
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
    gameRunning = true;
    gamePaused = false;
    document.getElementById('status').textContent = 'Game Running';
    updateScore();
    draw();
}

function pauseGame() {
    gamePaused = !gamePaused;
    document.getElementById('status').textContent = gamePaused ? 'Game Paused' : 'Game Running';
    if (!gamePaused && gameRunning) {
        draw();
    }
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
            moveQbert(-1, 0);
            break;
        case 'ArrowDown':
            moveQbert(1, 0);
            break;
        case 'ArrowLeft':
            moveQbert(0, -1);
            break;
        case 'ArrowRight':
            moveQbert(1, 1);
            break;
    }
    e.preventDefault();
});

// Initialize display
initPyramid();
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
for (let row = 0; row < 7; row++) {
    for (let col = 0; col <= row; col++) {
        const pos = getCubePosition(row, col);
        drawCube(pos.x, pos.y, pyramid[row][col].color);
    }
}

