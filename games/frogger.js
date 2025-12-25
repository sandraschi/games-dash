// Frogger Game Implementation - ENHANCED!
// **Timestamp**: 2025-12-03

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const COLS = 13;
const ROWS = 16;

let frog = { x: 6, y: 15, onLog: null, angle: 0 };
let score = 0;
let lives = 3;
let timeLeft = 60;
let gameRunning = false;
let gamePaused = false;
let gameLoop, timerLoop;
let waterAnimation = 0;

// Lane configurations
const lanes = [
    { y: 0, type: 'goal', objects: [] },
    { y: 1, type: 'safe', objects: [] },
    { y: 2, type: 'river', objects: [], speed: 1 },
    { y: 3, type: 'river', objects: [], speed: -1.5 },
    { y: 4, type: 'river', objects: [], speed: 2 },
    { y: 5, type: 'river', objects: [], speed: -1 },
    { y: 6, type: 'river', objects: [], speed: 1.5 },
    { y: 7, type: 'safe', objects: [] },
    { y: 8, type: 'road', objects: [], speed: 2 },
    { y: 9, type: 'road', objects: [], speed: -2.5 },
    { y: 10, type: 'road', objects: [], speed: 1.5 },
    { y: 11, type: 'road', objects: [], speed: -3 },
    { y: 12, type: 'road', objects: [], speed: 2.5 },
    { y: 13, type: 'safe', objects: [] },
    { y: 14, type: 'safe', objects: [] },
    { y: 15, type: 'start', objects: [] }
];

const goals = [
    { x: 1, reached: false },
    { x: 4, reached: false },
    { x: 7, reached: false },
    { x: 10, reached: false },
    { x: 12, reached: false }
];

function initLanes() {
    lanes.forEach(lane => {
        lane.objects = [];
        
        if (lane.type === 'river') {
            // Add logs and turtles
            const numObjects = 3 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numObjects; i++) {
                lane.objects.push({
                    x: i * (COLS / numObjects) * TILE_SIZE,
                    width: 3 * TILE_SIZE,
                    type: Math.random() > 0.5 ? 'log' : 'turtle'
                });
            }
        } else if (lane.type === 'road') {
            // Add vehicles
            const numVehicles = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numVehicles; i++) {
                lane.objects.push({
                    x: i * (COLS / numVehicles) * TILE_SIZE,
                    width: 2 * TILE_SIZE,
                    type: 'car'
                });
            }
        }
    });
}

function draw() {
    if (!gameRunning || gamePaused) return;
    
    waterAnimation += 0.1;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw lanes with enhanced graphics
    lanes.forEach(lane => {
        const y = lane.y * TILE_SIZE;
        
        if (lane.type === 'river') {
            // Animated water
            drawWater(y);
        } else if (lane.type === 'road') {
            // Textured road
            drawRoad(y);
        } else if (lane.type === 'safe') {
            // Grass texture
            drawGrass(y);
        } else if (lane.type === 'goal') {
            drawGoalZone(y);
        } else {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(0, y, canvas.width, TILE_SIZE);
        }
        
        // Draw lane objects with 3D effect
        lane.objects.forEach(obj => {
            if (lane.type === 'river') {
                if (obj.type === 'log') {
                    draw3DLog(obj.x, y + 5, obj.width, TILE_SIZE - 10);
                } else {
                    drawTurtle(obj.x, y + 5, obj.width, TILE_SIZE - 10);
                }
            } else if (lane.type === 'road') {
                drawVehicle(obj.x, y + 8, obj.width, TILE_SIZE - 16, lane.speed > 0);
            }
        });
    });
    
    // Draw goals
    goals.forEach(goal => {
        const x = goal.x * TILE_SIZE;
        if (goal.reached) {
            drawFrogInGoal(x, 5);
        } else {
            drawGoalSlot(x, 5);
        }
    });
    
    // Draw frog with animation
    drawFrog(frog.x * TILE_SIZE, frog.y * TILE_SIZE);
}

function drawWater(y) {
    // Base water color
    ctx.fillStyle = '#0066CC';
    ctx.fillRect(0, y, canvas.width, TILE_SIZE);
    
    // Animated waves
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 10) {
            const waveY = y + TILE_SIZE / 2 + Math.sin((x + waterAnimation * 20 + i * 50) / 30) * 3;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
    }
}

function drawRoad(y) {
    // Dark asphalt
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, y, canvas.width, TILE_SIZE);
    
    // Road markings
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, y + TILE_SIZE / 2 - 1, canvas.width, 2);
    
    // Dashed line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y + TILE_SIZE / 2);
    ctx.lineTo(canvas.width, y + TILE_SIZE / 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGrass(y) {
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, y, canvas.width, TILE_SIZE);
    
    // Grass texture (random dots)
    ctx.fillStyle = 'rgba(60, 150, 60, 0.5)';
    for (let i = 0; i < 50; i++) {
        const x = (y * 123 + i * 45) % canvas.width;
        const gy = y + (i * 67) % TILE_SIZE;
        ctx.fillRect(x, gy, 2, 3);
    }
}

function drawGoalZone(y) {
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(0, y, canvas.width, TILE_SIZE);
}

function draw3DLog(x, y, width, height) {
    // Main log body with wood texture
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#A0622C');
    gradient.addColorStop(0.3, '#8B4513');
    gradient.addColorStop(0.7, '#6B3410');
    gradient.addColorStop(1, '#4A2408');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Wood rings
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.arc(x + i, y + height / 2, height / 3, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Highlight (3D effect)
    ctx.fillStyle = 'rgba(200, 150, 100, 0.3)';
    ctx.fillRect(x, y, width, height / 3);
    
    // Shadow (3D effect)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y + height * 2/3, width, height / 3);
    
    // Bark texture
    ctx.strokeStyle = 'rgba(60, 30, 10, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const lineX = x + Math.random() * width;
        ctx.beginPath();
        ctx.moveTo(lineX, y);
        ctx.lineTo(lineX + (Math.random() - 0.5) * 10, y + height);
        ctx.stroke();
    }
}

function drawTurtle(x, y, width, height) {
    const numTurtles = Math.floor(width / 35);
    
    for (let i = 0; i < numTurtles; i++) {
        const tx = x + i * 35 + 5;
        
        // Turtle shell
        const gradient = ctx.createRadialGradient(tx + 15, y + height/2, 5, tx + 15, y + height/2, 15);
        gradient.addColorStop(0, '#90EE90');
        gradient.addColorStop(1, '#006400');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(tx + 15, y + height/2, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Shell pattern
        ctx.strokeStyle = 'rgba(0, 100, 0, 0.5)';
        ctx.lineWidth = 2;
        for (let j = 0; j < 4; j++) {
            ctx.beginPath();
            ctx.arc(tx + 15, y + height/2, 5 + j * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Head
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(tx + 25, y + height/2 - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(tx + 24, y + height/2 - 7, 2, 2);
    }
}

function drawVehicle(x, y, width, height, facingRight) {
    // Car body with gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    const color = width > 60 ? '#FF4444' : Math.random() > 0.5 ? '#4444FF' : '#FF44FF';
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, darkenColor(color, 0.3));
    gradient.addColorStop(1, darkenColor(color, 0.5));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Windshield (3D effect)
    ctx.fillStyle = 'rgba(100, 150, 200, 0.6)';
    if (facingRight) {
        ctx.fillRect(x + width * 0.6, y + 2, width * 0.3, height - 4);
    } else {
        ctx.fillRect(x + width * 0.1, y + 2, width * 0.3, height - 4);
    }
    
    // Wheels
    ctx.fillStyle = '#000';
    const wheelY = y + height - 3;
    ctx.fillRect(x + 5, wheelY, 8, 4);
    ctx.fillRect(x + width - 13, wheelY, 8, 4);
    
    // Highlight (3D shine)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x, y, width, height / 4);
}

function darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgb(${r * (1-factor)}, ${g * (1-factor)}, ${b * (1-factor)})`;
}

function drawFrog(x, y) {
    const centerX = x + TILE_SIZE / 2;
    const centerY = y + TILE_SIZE / 2;
    
    // Frog body (3D effect)
    const gradient = ctx.createRadialGradient(
        centerX - 5, centerY - 5, 5,
        centerX, centerY, 18
    );
    gradient.addColorStop(0, '#90EE90');
    gradient.addColorStop(0.6, '#00FF00');
    gradient.addColorStop(1, '#008800');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (bulging)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(centerX - 6, centerY - 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 6, centerY - 8, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX - 6, centerY - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 6, centerY - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI);
    ctx.stroke();
    
    // Legs (simplified)
    ctx.fillStyle = '#00AA00';
    // Back legs
    ctx.beginPath();
    ctx.ellipse(centerX - 12, centerY + 8, 6, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 12, centerY + 8, 6, 4, 0.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawGoalSlot(x, y) {
    // Goal slot with lily pad
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE - 10);
    
    // Lily pad
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(x + TILE_SIZE/2, y + TILE_SIZE/2, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Lily pad center
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawFrogInGoal(x, y) {
    // Small frog sitting in goal
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.ellipse(x + TILE_SIZE/2, y + TILE_SIZE/2, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE/2 - 4, y + TILE_SIZE/2 - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE/2 + 4, y + TILE_SIZE/2 - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE/2 - 4, y + TILE_SIZE/2 - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE/2 + 4, y + TILE_SIZE/2 - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function update() {
    if (!gameRunning || gamePaused) return;
    
    // Move lane objects
    lanes.forEach(lane => {
        if (lane.speed) {
            lane.objects.forEach(obj => {
                obj.x += lane.speed;
                
                // Wraparound
                if (obj.x > canvas.width) obj.x = -obj.width;
                if (obj.x < -obj.width) obj.x = canvas.width;
            });
        }
    });
    
    // Check if frog on log/turtle
    frog.onLog = null;
    const currentLane = lanes.find(l => l.y === frog.y);
    
    if (currentLane && currentLane.type === 'river') {
        const onPlatform = currentLane.objects.find(obj => 
            frog.x * TILE_SIZE > obj.x && 
            frog.x * TILE_SIZE < obj.x + obj.width
        );
        
        if (onPlatform) {
            frog.onLog = currentLane;
            frog.x += currentLane.speed / TILE_SIZE;
        } else {
            // Fell in water!
            loseLife();
            return;
        }
    }
    
    // Check road collision
    if (currentLane && currentLane.type === 'road') {
        const hitCar = currentLane.objects.some(obj =>
            frog.x * TILE_SIZE > obj.x &&
            frog.x * TILE_SIZE < obj.x + obj.width
        );
        
        if (hitCar) {
            loseLife();
            return;
        }
    }
    
    // Check goal reached
    if (frog.y === 0) {
        const goal = goals.find(g => Math.abs(g.x - frog.x) < 1);
        if (goal && !goal.reached) {
            goal.reached = true;
            score += 200 + timeLeft * 10;
            resetFrog();
            
            if (goals.every(g => g.reached)) {
                nextLevel();
            }
        }
    }
    
    // Check boundaries
    if (frog.x < 0 || frog.x >= COLS || frog.y < 0) {
        loseLife();
    }
}

function resetFrog() {
    frog.x = 6;
    frog.y = 15;
    frog.onLog = null;
}

function loseLife() {
    playDeathSound();
    lives--;
    if (lives <= 0) {
        gameOver();
    } else {
        resetFrog();
        timeLeft = 60;
    }
}

function nextLevel() {
    goals.forEach(g => g.reached = false);
    resetFrog();
    timeLeft = 60;
    lanes.forEach(lane => {
        if (lane.speed) lane.speed *= 1.2;
    });
    initLanes();
}

function gameOver() {
    gameRunning = false;
    clearInterval(timerLoop);
    document.getElementById('status').textContent = 'GAME OVER! Press Start to Restart';
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '32px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score} | Lives: ${lives} | Time: ${timeLeft}`;
}

function startGame() {
    initLanes();
    score = 0;
    lives = 3;
    timeLeft = 60;
    gameRunning = true;
    gamePaused = false;
    resetFrog();
    goals.forEach(g => g.reached = false);
    
    document.getElementById('status').textContent = 'Game Running';
    updateScore();
    
    clearInterval(timerLoop);
    timerLoop = setInterval(() => {
        if (gameRunning && !gamePaused) {
            timeLeft--;
            updateScore();
            if (timeLeft <= 0) {
                loseLife();
                timeLeft = 60;
            }
        }
    }, 1000);
    
    gameLoopFunc();
}

function pauseGame() {
    gamePaused = !gamePaused;
    document.getElementById('status').textContent = gamePaused ? 'Game Paused' : 'Game Running';
    if (!gamePaused && gameRunning) {
        gameLoopFunc();
    }
}

function gameLoopFunc() {
    if (!gameRunning || gamePaused) return;
    
    update();
    draw();
    
    gameLoop = setTimeout(gameLoopFunc, 1000 / 30);
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
            if (frog.y > 0) {
                frog.y--;
                score += 10;
                playJumpSound();
            }
            break;
        case 'ArrowDown':
            if (frog.y < ROWS - 1) {
                frog.y++;
                playJumpSound();
            }
            break;
        case 'ArrowLeft':
            if (frog.x > 0) {
                frog.x--;
                playJumpSound();
            }
            break;
        case 'ArrowRight':
            if (frog.x < COLS - 1) {
                frog.x++;
                playJumpSound();
            }
            break;
    }
    e.preventDefault();
});

// Add sound effects
function playJumpSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 400;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {}
}

function playDeathSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {}
}

// Initialize
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawFrog(frog.x * TILE_SIZE, frog.y * TILE_SIZE);

