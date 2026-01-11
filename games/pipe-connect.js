/**
 * Pipe Connect - Game Logic
 * Implements solvable level generation with walls and fixed pipes.
 */

const TYPES = {
    STRAIGHT: 'straight',
    CORNER: 'corner',
    T: 't',
    WALL: 'wall',
    EMPTY: 'empty'
};

const DIRECTIONS = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

let currentLevel = 1;
let gridSize = 5;
let state = [];
let isGameActive = true;
let worm = {
    x: 0,
    y: 0,
    active: false,
    speed: 2000, // ms per move
    lastMove: 0
};

// Level Configuration
function getLevelConfig(level) {
    const size = Math.min(10, 5 + Math.floor((level - 1) / 2));
    // Complication density increases with level
    const wallDensity = Math.min(0.2, (level - 1) * 0.02);
    const fixedDensity = Math.min(0.15, (level - 1) * 0.015);
    return {
        size,
        wallDensity,
        fixedDensity
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    currentLevel = 1;
    loadLevel(currentLevel);
}

function nextLevel() {
    currentLevel++;
    loadLevel(currentLevel);
}

function resetGame() {
    loadLevel(currentLevel);
}

function stopWorm() {
    worm.active = false;
    if (worm.interval) clearInterval(worm.interval);
}

function startWorm() {
    if (currentLevel < 5) return;
    worm.active = true;
    const source = state.find(p => p.isSource);
    worm.x = source.x;
    worm.y = source.y;
    worm.lastMove = Date.now();

    if (worm.interval) clearInterval(worm.interval);
    worm.interval = setInterval(tickWorm, worm.speed);
}

function showSolution() {
    if (!isGameActive) return;
    state.forEach(pipe => {
        if (pipe.type !== TYPES.WALL && pipe.type !== TYPES.EMPTY) {
            pipe.rotation = pipe.solutionRotation;
            if (pipe.svg) {
                pipe.svg.style.transform = `rotate(${pipe.rotation}deg)`;
            }
        }
    });
    updateFlow();
    document.getElementById('status').textContent = "SOLUTION REVEALED";
}

function loadLevel(levelNum) {
    const config = getLevelConfig(levelNum);
    gridSize = config.size;
    worm.speed = Math.max(800, 3000 - (levelNum * 200));

    document.getElementById('levelDisplay').textContent = `LEVEL ${levelNum}`;
    document.getElementById('status').textContent = "Connect source to drain";
    document.getElementById('status').style.color = "var(--accent-blue)";

    const alertEl = document.getElementById('wormAlert');
    if (alertEl) alertEl.style.display = levelNum >= 5 ? 'block' : 'none';

    stopWorm();
    generateSolvableLevel(config);
    renderGrid();
    isGameActive = true;
    updateFlow();

    if (levelNum >= 5) {
        setTimeout(startWorm, 2000); // 2s delay before worm starts
    }
}

function generateSolvableLevel(config) {
    const { size, wallDensity, fixedDensity } = config;
    state = [];

    let attempts = 0;
    let path = null;
    let source, drain;

    while (!path && attempts < 100) {
        attempts++;
        const map = Array(size).fill().map(() => Array(size).fill(null));

        // Pick Source and Drain
        source = { x: 0, y: Math.floor(Math.random() * size) };
        drain = { x: size - 1, y: Math.floor(Math.random() * size) };

        // Place Walls (avoiding source/drain)
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if ((x === source.x && y === source.y) || (x === drain.x && y === drain.y)) continue;
                if (Math.random() < wallDensity) {
                    map[y][x] = { type: TYPES.WALL };
                }
            }
        }

        // Find Path
        path = generatePath(size, source.x, source.y, drain.x, drain.y, map);

        if (path) {
            // Build the solvable state from path
            const connMap = Array(size).fill().map(() => Array(size).fill(null));
            const addConn = (x, y, dir) => {
                if (!connMap[y][x]) connMap[y][x] = new Set();
                connMap[y][x].add(dir);
            };

            for (let i = 0; i < path.length; i++) {
                const curr = path[i];
                const next = path[i + 1];
                if (next) {
                    if (next.x > curr.x) addConn(curr.x, curr.y, DIRECTIONS.RIGHT);
                    else if (next.x < curr.x) addConn(curr.x, curr.y, DIRECTIONS.LEFT);
                    else if (next.y > curr.y) addConn(curr.x, curr.y, DIRECTIONS.DOWN);
                    else if (next.y < curr.y) addConn(curr.x, curr.y, DIRECTIONS.UP);

                    if (curr.x > next.x) addConn(next.x, next.y, DIRECTIONS.RIGHT);
                    else if (curr.x < next.x) addConn(next.x, next.y, DIRECTIONS.LEFT);
                    else if (curr.y > next.y) addConn(next.x, next.y, DIRECTIONS.DOWN);
                    else if (curr.y < next.y) addConn(next.x, next.y, DIRECTIONS.UP);
                }
            }

            // Finalize State
            state = [];
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const isSource = (x === source.x && y === source.y);
                    const isDrain = (x === drain.x && y === drain.y);

                    if (map[y][x]?.type === TYPES.WALL) {
                        state.push({ x, y, type: TYPES.WALL, rotation: 0, isSource: false, isDrain: false, active: false });
                        continue;
                    }

                    const conns = connMap[y][x];
                    let type = TYPES.EMPTY;
                    let solutionRotation = 0;

                    if (conns) {
                        const c = Array.from(conns).sort((a, b) => a - b);
                        if (c.length === 2) {
                            if ((c[0] === 0 && c[1] === 2) || (c[0] === 1 && c[1] === 3)) {
                                type = TYPES.STRAIGHT;
                                solutionRotation = (c[0] === 1) ? 90 : 0;
                            } else {
                                type = TYPES.CORNER;
                                // Corner 0: Up+Right (0,1)
                                if (c[0] === 0 && c[1] === 1) solutionRotation = 0;
                                else if (c[0] === 1 && c[1] === 2) solutionRotation = 90;
                                else if (c[0] === 2 && c[1] === 3) solutionRotation = 180;
                                else if (c[0] === 0 && c[1] === 3) solutionRotation = 270;
                            }
                        } else {
                            // Endpoint/T-branch
                            type = TYPES.STRAIGHT;
                            if (c.includes(DIRECTIONS.LEFT) || c.includes(DIRECTIONS.RIGHT)) solutionRotation = 90;
                        }
                    } else {
                        // Deco pipes
                        const rnd = Math.random();
                        type = rnd < 0.3 ? TYPES.STRAIGHT : (rnd < 0.6 ? TYPES.CORNER : TYPES.EMPTY);
                    }

                    const isFixed = !isSource && !isDrain && type !== TYPES.EMPTY && Math.random() < fixedDensity;
                    const rotation = isFixed ? solutionRotation : Math.floor(Math.random() * 4) * 90;

                    state.push({
                        x, y, type, rotation, solutionRotation,
                        isSource, isDrain, isFixed, active: false
                    });
                }
            }
        }
    }
}

function generatePath(size, sx, sy, ex, ey, map) {
    const stack = [{ x: sx, y: sy, path: [{ x: sx, y: sy }] }];
    const visited = new Set([`${sx},${sy}`]);
    let attempts = 0;

    while (stack.length > 0 && attempts < 2000) {
        attempts++;
        const curr = stack[stack.length - 1];
        if (curr.x === ex && curr.y === ey) return curr.path;

        const neighbors = [
            { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
        ].sort(() => Math.random() - 0.5);

        let moved = false;
        for (let d of neighbors) {
            const nx = curr.x + d.x, ny = curr.y + d.y;
            const key = `${nx},${ny}`;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size && !visited.has(key) && map[ny][nx]?.type !== TYPES.WALL) {
                visited.add(key);
                stack.push({ x: nx, y: ny, path: [...curr.path, { x: nx, y: ny }] });
                moved = true;
                break;
            }
        }
        if (!moved) stack.pop();
    }
    return null;
}

function renderGrid() {
    const gridEl = document.getElementById('pipeGrid');
    gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 70px)`;
    gridEl.innerHTML = '';

    state.forEach(pipe => {
        const cell = document.createElement('div');
        cell.className = 'pipe-cell';
        if (pipe.isSource) cell.classList.add('source');
        if (pipe.isDrain) cell.classList.add('drain');
        if (pipe.isFixed) cell.classList.add('fixed');
        if (pipe.type === TYPES.WALL) cell.classList.add('wall');

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "pipe-svg");
        svg.style.transform = `rotate(${pipe.rotation}deg)`;

        if (pipe.type !== TYPES.EMPTY) {
            const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
            use.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#pipe-${pipe.type}`);
            svg.appendChild(use);
        }

        cell.appendChild(svg);
        cell.onclick = () => rotatePipe(pipe);
        pipe.cell = cell;
        pipe.svg = svg;
        gridEl.appendChild(cell);
    });
}

function rotatePipe(pipe) {
    if (!isGameActive || pipe.isFixed || pipe.type === TYPES.WALL) return;
    pipe.rotation = (pipe.rotation + 90) % 360;
    pipe.svg.style.transform = `rotate(${pipe.rotation}deg)`;
    if (window.gameSound) window.gameSound.playSound('click');
    updateFlow();
}

function getOutputs(pipe) {
    const r = (pipe.rotation % 360) / 90;
    const type = pipe.type;
    let base = [];
    if (type === TYPES.STRAIGHT) base = [0, 2];
    else if (type === TYPES.CORNER) base = [0, 1];
    else if (type === TYPES.T) base = [0, 1, 2];
    else return [];
    return base.map(d => (d + r) % 4);
}

function updateFlow() {
    state.forEach(p => {
        p.active = false;
        if (p.cell) p.cell.classList.remove('active');
    });

    const source = state.find(p => p.isSource);
    if (!source) return;

    let queue = [source];
    let visited = new Set();
    source.active = true;
    source.distance = 0;
    source.cell.classList.add('active');

    while (queue.length > 0) {
        const curr = queue.shift();
        const outputs = getOutputs(curr);
        outputs.forEach(dir => {
            let nx = curr.x, ny = curr.y, entryDir = -1;
            if (dir === 0) { ny--; entryDir = 2; }
            if (dir === 1) { nx++; entryDir = 3; }
            if (dir === 2) { ny++; entryDir = 0; }
            if (dir === 3) { nx--; entryDir = 1; }

            const next = state.find(p => p.x === nx && p.y === ny);
            if (next && getOutputs(next).includes(entryDir)) {
                if (!next.active) {
                    next.active = true;
                    // Store distance for nemesis tracking
                    next.distance = (curr.distance || 0) + 1;
                    if (next.cell) next.cell.classList.add('active');
                    queue.push(next);
                    if (next.isDrain) handleWin();
                }
            }
        });
    }

    // After flow update, refresh worm visually if active
    if (worm.active) renderWorm();
}

function renderWorm() {
    state.forEach(p => {
        if (p.cell) p.cell.classList.remove('worm');
    });
    const wormPipe = state.find(p => p.x === worm.x && p.y === worm.y);
    if (wormPipe && wormPipe.cell) {
        wormPipe.cell.classList.add('worm');
    }
}

function tickWorm() {
    if (!isGameActive || !worm.active) return;

    const source = state.find(p => p.isSource);
    // Worm moves along active pipes toward the highest distance
    const currentPipe = state.find(p => p.x === worm.x && p.y === worm.y);
    if (!currentPipe || !currentPipe.active) {
        // If worm is stranded, it retreats to source
        moveWormTo(source.x, source.y);
        return;
    }

    // Find neighbors that are active and have more distance (moving "forward")
    const outputs = getOutputs(currentPipe);
    let bestNext = null;
    let maxDist = currentPipe.distance || 0;

    outputs.forEach(dir => {
        let nx = worm.x, ny = worm.y, entryDir = -1;
        if (dir === 0) { ny--; entryDir = 2; }
        if (dir === 1) { nx++; entryDir = 3; }
        if (dir === 2) { ny++; entryDir = 0; }
        if (dir === 3) { nx--; entryDir = 1; }

        const next = state.find(p => p.x === nx && p.y === ny);
        if (next && next.active && getOutputs(next).includes(entryDir)) {
            if (next.distance > maxDist) {
                maxDist = next.distance;
                bestNext = next;
            }
        }
    });

    if (bestNext) {
        moveWormTo(bestNext.x, bestNext.y);

        // Check if caught the "head"
        // The head is the active pipe with the highest distance
        const allActive = state.filter(p => p.active);
        const maxFlowDist = Math.max(...allActive.map(p => p.distance || 0));

        if (bestNext.distance === maxFlowDist && maxFlowDist > 0) {
            handleGameOver("PIPEWORM CAUGHT THE FLOW!");
        }
    }
}

function moveWormTo(x, y) {
    worm.x = x;
    worm.y = y;
    renderWorm();
    if (window.gameSound) window.gameSound.playSound('click'); // Worm crawl sound placeholder
}

function handleGameOver(msg) {
    if (!isGameActive) return;
    isGameActive = false;
    stopWorm();
    document.getElementById('status').textContent = msg;
    document.getElementById('status').style.color = "#f00";
    if (window.gameSound) window.gameSound.playSound('fail');
}

function handleWin() {
    if (!isGameActive) return;
    const drain = state.find(p => p.isDrain);
    if (drain && drain.active) {
        document.getElementById('status').textContent = "SYSTEM CONNECTED! Stabilizing...";
        document.getElementById('status').style.color = "#0f0";
        if (window.gameSound) window.gameSound.playSound('win');
        isGameActive = false;
    }
}
