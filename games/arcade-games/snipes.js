// Snipes - Single-player homage to the 1983 Novell NetWare classic
// **Timestamp**: 2025-02-07

const CELL = 20;
const COLS = 30;
const ROWS = 24;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const LEVELS = {
    1: { hives: 3, maxSnipes: 10, lives: 5 },
    2: { hives: 4, maxSnipes: 25, lives: 4 },
    3: { hives: 5, maxSnipes: 50, lives: 3 },
    4: { hives: 5, maxSnipes: 80, lives: 3 }
};

let maze = [];
let player = { x: 0, y: 0, dirX: 0, dirY: 0 };
let snipes = [];
let hives = [];
let bullets = [];
let snipeBullets = [];
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let lastSnipeSpawn = 0;
let animId;
let keys = {};
let fireCooldown = 0;

function buildMaze() {
    maze = [];
    for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
            const isBorder = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
            const density = 0.12;
            const randomWall = !isBorder && Math.random() < density;
            row.push(isBorder || randomWall ? 1 : 0);
        }
        maze.push(row);
    }
    ensurePath();
}

function ensurePath() {
    const open = [];
    for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
            if (maze[r][c] === 0) open.push({ r, c });
        }
    }
    const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    };
    shuffle(open);
    for (let i = 0; i < open.length; i += 4) {
        maze[open[i].r][open[i].c] = 0;
    }
}

function placePlayer() {
    for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
            if (maze[r][c] === 0) {
                player.x = c;
                player.y = r;
                return;
            }
        }
    }
}

function placeHives() {
    const cfg = LEVELS[level];
    hives = [];
    let placed = 0;
    for (let tryCount = 0; tryCount < 200 && placed < cfg.hives; tryCount++) {
        const r = 1 + Math.floor(Math.random() * (ROWS - 2));
        const c = 1 + Math.floor(Math.random() * (COLS - 2));
        if (maze[r][c] === 0 && Math.abs(r - player.y) + Math.abs(c - player.x) > 6) {
            const occupied = hives.some(h => h.x === c && h.y === r);
            if (!occupied) {
                hives.push({ x: c, y: r });
                placed++;
            }
        }
    }
}

function spawnSnipes() {
    const cfg = LEVELS[level];
    const toSpawn = Math.min(cfg.maxSnipes - snipes.length, hives.length);
    for (let i = 0; i < toSpawn; i++) {
        const hive = hives[Math.floor(Math.random() * hives.length)];
        if (!hive) continue;
        const spots = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const ny = hive.y + dy;
                const nx = hive.x + dx;
                if (ny >= 1 && ny < ROWS - 1 && nx >= 1 && nx < COLS - 1 && maze[ny][nx] === 0) {
                    const blocked = snipes.some(s => s.x === nx && s.y === ny) ||
                        (player.x === nx && player.y === ny);
                    if (!blocked) spots.push({ x: nx, y: ny });
                }
            }
        }
        if (spots.length > 0) {
            const spot = spots[Math.floor(Math.random() * spots.length)];
            snipes.push({ x: spot.x, y: spot.y, vx: 0, vy: 0, shootCooldown: 0 });
        }
    }
}

function isWall(x, y) {
    const c = Math.round(x);
    const r = Math.round(y);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
    return maze[r][c] === 1;
}

function movePlayer() {
    let dx = 0, dy = 0;
    if (keys['ArrowUp'] || keys['KeyW']) dy--;
    if (keys['ArrowDown'] || keys['KeyS']) dy++;
    if (keys['ArrowLeft'] || keys['KeyA']) dx--;
    if (keys['ArrowRight'] || keys['KeyD']) dx++;
    const sprint = keys['Space'] ? 1.5 : 1;
    if (dx !== 0 || dy !== 0) {
        const norm = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= norm;
        dy /= norm;
        const nx = player.x + dx * 0.25 * sprint;
        const ny = player.y + dy * 0.25 * sprint;
        if (!isWall(nx, ny)) {
            player.x = nx;
            player.y = ny;
        }
    }
    let fx = 0, fy = 0;
    if (keys['KeyW']) fy--;
    if (keys['KeyS']) fy++;
    if (keys['KeyA']) fx--;
    if (keys['KeyD']) fx++;
    if (fx !== 0 || fy !== 0) fire(fx, fy);
}

function fire(dx, dy) {
    if (fireCooldown > 0) return;
    fireCooldown = 4;
    if (dx === 0 && dy === 0) return;
    const norm = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= norm;
    dy /= norm;

    bullets.push({
        x: player.x + 0.5,
        y: player.y + 0.5,
        vx: dx * 0.5,
        vy: dy * 0.5
    });
}

function moveBullets() {
    bullets = bullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        if (isWall(b.x, b.y)) return false;
        for (let i = snipes.length - 1; i >= 0; i--) {
            const s = snipes[i];
            if (Math.abs(b.x - (s.x + 0.5)) < 0.6 && Math.abs(b.y - (s.y + 0.5)) < 0.6) {
                snipes.splice(i, 1);
                score += 100;
                return false;
            }
        }
        for (let i = hives.length - 1; i >= 0; i--) {
            const h = hives[i];
            if (Math.abs(b.x - (h.x + 0.5)) < 0.6 && Math.abs(b.y - (h.y + 0.5)) < 0.6) {
                hives.splice(i, 1);
                score += 250;
                return false;
            }
        }
        return b.x > 0 && b.x < COLS && b.y > 0 && b.y < ROWS;
    });

    snipeBullets = snipeBullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        if (isWall(b.x, b.y)) return false;
        const px = player.x + 0.5;
        const py = player.y + 0.5;
        if (Math.abs(b.x - px) < 0.5 && Math.abs(b.y - py) < 0.5) {
            lives--;
            return false;
        }
        return b.x > 0 && b.x < COLS && b.y > 0 && b.y < ROWS;
    });
}

function moveSnipes() {
    const px = player.x + 0.5;
    const py = player.y + 0.5;
    snipes.forEach(s => {
        const dx = px - (s.x + 0.5);
        const dy = py - (s.y + 0.5);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ax = dx / dist;
        const ay = dy / dist;
        const nx = s.x + ax * 0.08;
        const ny = s.y + ay * 0.08;
        if (!isWall(nx, ny)) {
            s.x = nx;
            s.y = ny;
        }
        s.shootCooldown--;
        if (s.shootCooldown <= 0 && dist < 8) {
            s.shootCooldown = 30;
            snipeBullets.push({
                x: s.x + 0.5,
                y: s.y + 0.5,
                vx: ax * 0.35,
                vy: ay * 0.35
            });
        }
    });
}

function gameLoop() {
    if (!gameRunning || gamePaused) {
        draw();
        animId = requestAnimationFrame(gameLoop);
        return;
    }

    if (fireCooldown > 0) fireCooldown--;
    movePlayer();
    moveBullets();
    moveSnipes();

    if (Date.now() - lastSnipeSpawn > 2000) {
        spawnSnipes();
        lastSnipeSpawn = Date.now();
    }

    if (lives <= 0) {
        gameRunning = false;
        document.getElementById('status').textContent = 'Game Over';
    } else if (snipes.length === 0 && hives.length === 0) {
        document.getElementById('status').textContent = 'You Win!';
        gameRunning = false;
    }

    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('snipesLeft').textContent = snipes.length + hives.length;

    draw();
    animId = requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (maze[r][c] === 1) {
                ctx.fillStyle = '#21262d';
                ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
                ctx.strokeStyle = '#30363d';
                ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
            }
        }
    }

    bullets.forEach(b => {
        ctx.fillStyle = '#7ee787';
        ctx.shadowColor = '#7ee787';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(b.x * CELL, b.y * CELL, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.shadowBlur = 0;

    snipeBullets.forEach(b => {
        ctx.fillStyle = '#f85149';
        ctx.beginPath();
        ctx.arc(b.x * CELL, b.y * CELL, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    hives.forEach(h => {
        ctx.fillStyle = '#d29922';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('#', (h.x + 0.5) * CELL, (h.y + 0.5) * CELL);
    });

    snipes.forEach(s => {
        ctx.fillStyle = '#f85149';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('*', (s.x + 0.5) * CELL, (s.y + 0.5) * CELL);
    });

    ctx.fillStyle = '#7ee787';
    ctx.shadowColor = '#7ee787';
    ctx.shadowBlur = 8;
    ctx.font = 'bold 16px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@', (player.x + 0.5) * CELL, (player.y + 0.5) * CELL);
    ctx.shadowBlur = 0;

    if (!gameRunning && (lives <= 0 || (snipes.length === 0 && hives.length === 0))) {
        ctx.fillStyle = 'rgba(13, 17, 23, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = lives <= 0 ? '#f85149' : '#7ee787';
        ctx.font = 'bold 28px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(lives <= 0 ? 'GAME OVER' : 'YOU WIN', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px JetBrains Mono';
        ctx.fillStyle = '#8b949e';
        ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    }
}

function startGame() {
    level = parseInt(document.getElementById('levelSelect').value, 10) || 1;
    const cfg = LEVELS[level];
    lives = cfg.lives;
    score = 0;
    bullets = [];
    snipeBullets = [];
    buildMaze();
    placePlayer();
    placeHives();
    snipes = [];
    spawnSnipes();
    lastSnipeSpawn = Date.now();
    gameRunning = true;
    gamePaused = false;
    document.getElementById('status').textContent = 'Playing';
}

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
    if (e.code === 'Space' && !gameRunning) {
        startGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

document.getElementById('levelSelect').addEventListener('change', () => {
    if (!gameRunning) level = parseInt(document.getElementById('levelSelect').value, 10);
});

buildMaze();
placePlayer();
placeHives();
snipes = [];
draw();
animId = requestAnimationFrame(gameLoop);
