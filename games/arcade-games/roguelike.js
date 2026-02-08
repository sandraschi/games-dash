// Roguelike - Minimal dungeon crawler inspired by Rogue/NetHack
// **Timestamp**: 2025-02-07

const CELL = 15;
const COLS = 40;
const ROWS = 24;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const MONSTERS = {
    g: { name: 'goblin', hp: 5, atk: 2, xp: 5, symbol: 'g' },
    k: { name: 'kobold', hp: 3, atk: 1, xp: 3, symbol: 'k' },
    o: { name: 'orc', hp: 8, atk: 4, xp: 12, symbol: 'o' },
    d: { name: 'dragon', hp: 15, atk: 6, xp: 25, symbol: 'd' }
};

let map = [];
let player = { x: 0, y: 0, hp: 20, maxHp: 20, atk: 5, depth: 1 };
let monsters = [];
let items = [];
let stairs = null;
let gameOver = false;
let gameWon = false;
let log = [];

function addLog(msg) {
    log.push(msg);
    if (log.length > 6) log.shift();
    const el = document.getElementById('log');
    if (el) el.innerHTML = log.join('<br>');
}

function buildDungeon() {
    map = [];
    for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
            row.push(1);
        }
        map.push(row);
    }

    const rooms = [];
    for (let i = 0; i < 8; i++) {
        const w = 4 + Math.floor(Math.random() * 5);
        const h = 3 + Math.floor(Math.random() * 4);
        const x = 1 + Math.floor(Math.random() * (COLS - w - 2));
        const y = 1 + Math.floor(Math.random() * (ROWS - h - 2));
        let overlap = false;
        for (const r of rooms) {
            if (x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y) {
                overlap = true;
                break;
            }
        }
        if (!overlap) {
            rooms.push({ x, y, w, h });
            for (let ry = y; ry < y + h; ry++) {
                for (let rx = x; rx < x + w; rx++) {
                    map[ry][rx] = 0;
                }
            }
        }
    }

    for (let i = 1; i < rooms.length; i++) {
        const a = rooms[i - 1];
        const b = rooms[i];
        const ax = Math.floor(a.x + a.w / 2);
        const ay = Math.floor(a.y + a.h / 2);
        const bx = Math.floor(b.x + b.w / 2);
        const by = Math.floor(b.y + b.h / 2);
        for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
            if (x >= 1 && x < COLS - 1) map[ay][x] = 0;
        }
        for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
            if (y >= 1 && y < ROWS - 1) map[y][bx] = 0;
        }
    }

    const first = rooms[0];
    player.x = Math.floor(first.x + first.w / 2);
    player.y = Math.floor(first.y + first.h / 2);

    const last = rooms[rooms.length - 1];
    stairs = { x: Math.floor(last.x + last.w / 2), y: Math.floor(last.y + last.h / 2) };

    monsters = [];
    const types = ['g', 'g', 'k', 'k', 'o'];
    if (player.depth >= 3) types.push('d');
    for (let i = 0; i < 3 + player.depth * 2; i++) {
        const room = rooms[1 + Math.floor(Math.random() * (rooms.length - 1))];
        const rx = room.x + Math.floor(Math.random() * room.w);
        const ry = room.y + Math.floor(Math.random() * room.h);
        if (map[ry][rx] === 0 && (rx !== player.x || ry !== player.y) && (rx !== stairs.x || ry !== stairs.y)) {
            const type = types[Math.floor(Math.random() * types.length)];
            const mon = MONSTERS[type];
            monsters.push({
                x: rx, y: ry, type, hp: mon.hp, maxHp: mon.hp, atk: mon.atk, xp: mon.xp, symbol: mon.symbol
            });
        }
    }

    items = [];
    for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const rx = room.x + Math.floor(Math.random() * room.w);
        const ry = room.y + Math.floor(Math.random() * room.h);
        if (map[ry][rx] === 0 && (rx !== player.x || ry !== player.y)) {
            items.push({ x: rx, y: ry, type: Math.random() < 0.5 ? 'potion' : 'gold' });
        }
    }
}

function getMonsterAt(x, y) {
    return monsters.find(m => m.x === x && m.y === y && m.hp > 0);
}

function getItemAt(x, y) {
    return items.find(i => i.x === x && i.y === y);
}

function tryMove(dx, dy) {
    if (gameOver || gameWon) return;
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (nx < 1 || nx >= COLS - 1 || ny < 1 || ny >= ROWS - 1) return;
    if (map[ny][nx] === 1) return;
    const mon = getMonsterAt(nx, ny);
    if (mon) {
        const dmg = Math.max(1, player.atk - Math.floor(Math.random() * 2));
        mon.hp -= dmg;
        addLog('You hit the ' + mon.name + ' for ' + dmg + ' damage.');
        if (mon.hp <= 0) {
            addLog('You kill the ' + mon.name + '.');
            mon.hp = 0;
        } else {
            moveMonsters();
            processMonsters();
        }
        draw();
        return;
    }
    const it = getItemAt(nx, ny);
    if (it) {
        if (it.type === 'potion') {
            const heal = 5 + Math.floor(Math.random() * 6);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            addLog('You drink a potion and heal ' + heal + ' HP.');
        } else {
            addLog('You pick up gold.');
        }
        items = items.filter(i => i.x !== nx || i.y !== ny);
        player.x = nx;
        player.y = ny;
        moveMonsters();
        processMonsters();
        draw();
        return;
    }
    if (nx === stairs.x && ny === stairs.y) {
        if (player.depth >= 5) {
            gameWon = true;
            addLog('You reach the bottom and claim the Amulet! You win!');
        } else {
            player.depth++;
            addLog('You descend to level ' + player.depth + '.');
            buildDungeon();
        }
        draw();
        return;
    }
    player.x = nx;
    player.y = ny;
    moveMonsters();
    processMonsters();
    draw();
}

function processMonsters() {
    if (gameOver || gameWon) return;
    monsters.forEach(m => {
        if (m.hp <= 0) return;
        const dist = Math.abs(m.x - player.x) + Math.abs(m.y - player.y);
        if (dist > 1) return;
        const dmg = Math.max(1, m.atk - Math.floor(Math.random() * 2));
        player.hp -= dmg;
        addLog('The ' + m.name + ' hits you for ' + dmg + ' damage.');
        if (player.hp <= 0) {
            player.hp = 0;
            gameOver = true;
            addLog('You die...');
        }
    });
}

function startGame() {
    player = { x: 0, y: 0, hp: 20, maxHp: 20, atk: 5, depth: 1 };
    monsters = [];
    items = [];
    stairs = null;
    gameOver = false;
    gameWon = false;
    log = [];
    addLog('Welcome, adventurer. Descend 5 levels to win.');
    buildDungeon();
    updateUI();
    draw();
}

function updateUI() {
    document.getElementById('hp').textContent = player.hp;
    document.getElementById('maxHp').textContent = player.maxHp;
    document.getElementById('level').textContent = player.depth;
    document.getElementById('atk').textContent = player.atk;
    document.getElementById('status').textContent = gameOver ? 'Game Over' : gameWon ? 'You Win!' : 'Arrow keys or WASD';
}

function moveMonsters() {
    monsters.forEach(m => {
        if (m.hp <= 0) return;
        const dist = Math.abs(m.x - player.x) + Math.abs(m.y - player.y);
        if (dist <= 1) return;
        let bestDx = 0, bestDy = 0, bestDist = 999;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = m.x + dx;
                const ny = m.y + dy;
                if (map[ny][nx] !== 0) continue;
                if (getMonsterAt(nx, ny)) continue;
                const d = Math.abs(nx - player.x) + Math.abs(ny - player.y);
                if (d < bestDist) {
                    bestDist = d;
                    bestDx = dx;
                    bestDy = dy;
                }
            }
        }
        if (bestDx !== 0 || bestDy !== 0) {
            m.x += bestDx;
            m.y += bestDy;
        }
    });
}

function draw() {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = map[r][c];
            ctx.fillStyle = cell === 1 ? '#21262d' : '#161b22';
            ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
            if (cell === 1) {
                ctx.strokeStyle = '#30363d';
                ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
            }
        }
    }

    items.forEach(i => {
        ctx.fillStyle = i.type === 'potion' ? '#a371f7' : '#d29922';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.type === 'potion' ? '!' : '$', (i.x + 0.5) * CELL, (i.y + 0.5) * CELL);
    });

    if (stairs) {
        ctx.fillStyle = '#8b949e';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('>', (stairs.x + 0.5) * CELL, (stairs.y + 0.5) * CELL);
    }

    monsters.forEach(m => {
        if (m.hp <= 0) return;
        ctx.fillStyle = m.type === 'd' ? '#f85149' : m.type === 'o' ? '#d29922' : '#7ee787';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.symbol, (m.x + 0.5) * CELL, (m.y + 0.5) * CELL);
    });

    const px = player.x;
    const py = player.y;
    ctx.fillStyle = '#7ee787';
    ctx.shadowColor = '#7ee787';
    ctx.shadowBlur = 6;
    ctx.font = 'bold 16px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@', (px + 0.5) * CELL, (py + 0.5) * CELL);
    ctx.shadowBlur = 0;

    if (gameOver || gameWon) {
        ctx.fillStyle = 'rgba(13, 17, 23, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = gameWon ? '#7ee787' : '#f85149';
        ctx.font = 'bold 24px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(gameWon ? 'YOU WIN!' : 'GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '14px JetBrains Mono';
        ctx.fillStyle = '#8b949e';
        ctx.fillText('Score: Level ' + player.depth, canvas.width / 2, canvas.height / 2 + 20);
    }

    updateUI();
}

document.addEventListener('keydown', (e) => {
    let dx = 0, dy = 0;
    if (['ArrowUp', 'KeyW'].includes(e.code)) dy = -1;
    if (['ArrowDown', 'KeyS'].includes(e.code)) dy = 1;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) dx = -1;
    if (['ArrowRight', 'KeyD'].includes(e.code)) dx = 1;
    if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        tryMove(dx, dy);
    }
});

startGame();
