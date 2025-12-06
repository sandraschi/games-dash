// Tempest Game (Simplified - 2D representation of tube)
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false
};

// Tube representation (16 segments)
const TUBE_SEGMENTS = 16;
const TUBE_RADIUS = 200;
const TUBE_CENTER_X = canvas.width / 2;
const TUBE_CENTER_Y = canvas.height / 2;

// Player position (segment index)
let playerSegment = 0;
let playerAngle = 0;

// Enemies
let enemies = [];

// Bullets
let bullets = [];

const keys = {};

function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    bullets = [];
    enemies = [];
    playerSegment = 0;
    playerAngle = 0;
    
    // Create enemies
    for (let i = 0; i < 10 + gameState.level * 2; i++) {
        enemies.push({
            segment: Math.floor(Math.random() * TUBE_SEGMENTS),
            distance: 100 + Math.random() * 300,
            speed: 1 + gameState.level * 0.2,
            type: Math.random() < 0.7 ? 'spike' : 'tank',
            alive: true
        });
    }
    
    updateDisplay();
}

function getSegmentPosition(segment, distance) {
    const angle = (segment / TUBE_SEGMENTS) * Math.PI * 2;
    const x = TUBE_CENTER_X + Math.cos(angle) * (TUBE_RADIUS + distance);
    const y = TUBE_CENTER_Y + Math.sin(angle) * (TUBE_RADIUS + distance);
    return {x, y, angle};
}

function drawTube() {
    // Draw tube segments
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < TUBE_SEGMENTS; i++) {
        const pos1 = getSegmentPosition(i, 0);
        const pos2 = getSegmentPosition((i + 1) % TUBE_SEGMENTS, 0);
        
        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.stroke();
    }
}

function drawPlayer() {
    const pos = getSegmentPosition(playerSegment, 0);
    
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw claws
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
        const angle = pos.angle + (i * Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(
            pos.x + Math.cos(angle) * 20,
            pos.y + Math.sin(angle) * 20
        );
        ctx.stroke();
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        const pos = getSegmentPosition(enemy.segment, enemy.distance);
        
        if (enemy.type === 'spike') {
            ctx.fillStyle = '#FF00FF';
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const angle = pos.angle + (i * Math.PI * 2 / 3);
                const x = pos.x + Math.cos(angle) * 10;
                const y = pos.y + Math.sin(angle) * 10;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(pos.x - 10, pos.y - 10, 20, 20);
        }
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = '#FFFFFF';
        const pos = getSegmentPosition(bullet.segment, bullet.distance);
        ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);
    });
}

function updatePlayer() {
    if (keys['ArrowLeft']) {
        playerSegment = (playerSegment - 1 + TUBE_SEGMENTS) % TUBE_SEGMENTS;
        playerAngle = (playerSegment / TUBE_SEGMENTS) * Math.PI * 2;
    }
    if (keys['ArrowRight']) {
        playerSegment = (playerSegment + 1) % TUBE_SEGMENTS;
        playerAngle = (playerSegment / TUBE_SEGMENTS) * Math.PI * 2;
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.distance += 8;
        return bullet.distance < 500;
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (!enemy.alive) return;
        
        enemy.distance -= enemy.speed;
        
        if (enemy.distance < 0) {
            // Reached player
            gameState.lives--;
            enemy.alive = false;
            
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                gameState.running = false;
            }
        }
    });
}

function checkCollisions() {
    // Bullets vs enemies
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (!enemy.alive) return;
            
            if (bullet.segment === enemy.segment &&
                Math.abs(bullet.distance - enemy.distance) < 30) {
                
                enemy.alive = false;
                bullets.splice(bulletIndex, 1);
                
                gameState.score += enemy.type === 'tank' ? 200 : 100;
            }
        });
    });
    
    // Check win condition
    if (enemies.every(e => !e.alive)) {
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
    updateBullets();
    updateEnemies();
    checkCollisions();
    
    drawTube();
    drawEnemies();
    drawBullets();
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
        bullets.push({
            segment: playerSegment,
            distance: 0
        });
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
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

