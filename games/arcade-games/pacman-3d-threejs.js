// Pac-Man 3D - Real Three.js implementation
// **Timestamp**: 2025-02-07

const COLS = 28;
const ROWS = 27; // maze has 27 rows
const CELL = 1;  // units per cell

// Simplified maze (1=wall, 2=dot, 3=power, 0=empty)
const MAZE = [
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
];

let scene, camera, renderer, controls;
let pacmanMesh, ghostMeshes = [];
let walls = [], dots = [], powerPellets = [];
let pacman = { x: 14, z: 23, dirX: 0, dirZ: 0, speed: 0.08 };
let ghosts = [
    { x: 13, z: 11, vx: 0, vz: 0, color: 0xff0000 },
    { x: 14, z: 11, vx: 0, vz: 0, color: 0xffb8ff },
    { x: 13, z: 14, vx: 0, vz: 0, color: 0x00ffff },
    { x: 15, z: 14, vx: 0, vz: 0, color: 0xffb851 }
];
let score = 0, lives = 3, powerMode = false, powerTimer = 0;
let gameRunning = false, gamePaused = false, animId;

function init() {
    const container = document.getElementById('game3d');
    const w = container.clientWidth || 800;
    const h = container.clientHeight || Math.min(600, window.innerHeight - 200);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);

    camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(14, 35, 23);
    camera.lookAt(14, 0, 23);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(14, 0, 23);
        controls.minDistance = 20;
        controls.maxDistance = 80;
    }

    // Floor
    const floorGeom = new THREE.PlaneGeometry(COLS * CELL, ROWS * CELL);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x001122 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(20, 40, 20);
    light.castShadow = true;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Build maze
    const wallGeom = new THREE.BoxGeometry(CELL * 0.95, CELL * 0.95, CELL * 0.95);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x0066ff });
    const dotGeom = new THREE.SphereGeometry(0.15, 8, 8);
    const dotMat = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    const pelletGeom = new THREE.SphereGeometry(0.35, 12, 12);
    const pelletMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    for (let row = 0; row < MAZE.length; row++) {
        for (let col = 0; col < MAZE[row].length; col++) {
            const cell = MAZE[row][col];
            const x = col;
            const z = row;
            if (cell === 1) {
                const wall = new THREE.Mesh(wallGeom, wallMat);
                wall.position.set(x, 0.5, z);
                wall.castShadow = true;
                scene.add(wall);
                walls.push({ x: col, z: row });
            } else if (cell === 2) {
                const dot = new THREE.Mesh(dotGeom, dotMat.clone());
                dot.position.set(x, 0.3, z);
                dot.userData = { col, row, eaten: false };
                scene.add(dot);
                dots.push(dot);
            } else if (cell === 3) {
                const pellet = new THREE.Mesh(pelletGeom, pelletMat.clone());
                pellet.position.set(x, 0.35, z);
                pellet.userData = { col, row };
                scene.add(pellet);
                powerPellets.push(pellet);
            }
        }
    }

    // Pac-Man
    const pacmanGeom = new THREE.SphereGeometry(0.4, 16, 16);
    const pacmanMat = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    pacmanMesh = new THREE.Mesh(pacmanGeom, pacmanMat);
    pacmanMesh.position.set(14, 0.5, 23);
    pacmanMesh.castShadow = true;
    scene.add(pacmanMesh);

    // Ghosts
    const ghostGeom = new THREE.SphereGeometry(0.35, 12, 12);
    ghosts.forEach((g, i) => {
        const mat = new THREE.MeshLambertMaterial({ color: g.color });
        const mesh = new THREE.Mesh(ghostGeom, mat);
        mesh.position.set(g.x, 0.5, g.z);
        mesh.castShadow = true;
        scene.add(mesh);
        ghostMeshes.push(mesh);
    });

    window.addEventListener('resize', () => {
        const c = document.getElementById('game3d');
        camera.aspect = c.clientWidth / c.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(c.clientWidth, c.clientHeight);
    });
}

function canMove(x, z) {
    const col = Math.round(x);
    const row = Math.round(z);
    if (row < 0 || row >= MAZE.length || col < 0 || col >= MAZE[0].length) return false;
    return MAZE[row][col] !== 1;
}

function gameLoop() {
    if (!gameRunning || gamePaused) {
        animId = requestAnimationFrame(gameLoop);
        if (controls) controls.update();
        renderer.render(scene, camera);
        return;
    }

    // Move Pac-Man
    if (pacman.dirX !== 0 || pacman.dirZ !== 0) {
        const nx = pacman.x + pacman.dirX * pacman.speed;
        const nz = pacman.z + pacman.dirZ * pacman.speed;
        if (canMove(nx, nz)) {
            pacman.x = nx;
            pacman.z = nz;
            if (pacman.x < -0.5) pacman.x = COLS - 0.5;
            if (pacman.x >= COLS - 0.5) pacman.x = -0.5;
        } else {
            pacman.dirX = 0;
            pacman.dirZ = 0;
        }
        pacmanMesh.position.set(pacman.x, 0.5, pacman.z);
    }

    // Collect dots
    const pcol = Math.round(pacman.x);
    const prow = Math.round(pacman.z);
    dots.forEach(d => {
        if (!d.userData.eaten && d.userData.col === pcol && d.userData.row === prow) {
            d.userData.eaten = true;
            d.visible = false;
            score += 10;
        }
    });
    powerPellets.forEach((p, i) => {
        if (p.userData.col === pcol && p.userData.row === prow) {
            powerPellets.splice(i, 1);
            scene.remove(p);
            score += 50;
            powerMode = true;
            powerTimer = 300;
        }
    });

    // Move ghosts
    ghosts.forEach((g, i) => {
        const dx = pacman.x - g.x;
        const dz = pacman.z - g.z;
        if (powerMode) {
            g.vx = (g.x < pacman.x ? -0.04 : 0.04);
            g.vz = (g.z < pacman.z ? -0.04 : 0.04);
        } else {
            g.vx = (Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 0.04 : -0.04) : 0);
            g.vz = (Math.abs(dz) >= Math.abs(dx) ? (dz > 0 ? 0.04 : -0.04) : 0);
        }
        const nxg = g.x + g.vx;
        const nzg = g.z + g.vz;
        if (canMove(nxg, nzg)) {
            g.x = nxg;
            g.z = nzg;
        }
        ghostMeshes[i].position.set(g.x, 0.5, g.z);
    });

    // Ghost collision
    ghosts.forEach((g, i) => {
        if (Math.abs(g.x - pacman.x) < 0.5 && Math.abs(g.z - pacman.z) < 0.5) {
            if (powerMode) {
                score += 200;
                g.x = 13 + i; g.z = 11;
            } else {
                lives--;
                pacman.x = 14; pacman.z = 23;
                pacman.dirX = 0; pacman.dirZ = 0;
                ghosts.forEach((gg, j) => { gg.x = 13 + j; gg.z = 11; });
                if (lives <= 0) gameOver();
            }
        }
    });

    if (powerMode) { powerTimer--; if (powerTimer <= 0) powerMode = false; }

    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;

    if (controls) controls.update();
    renderer.render(scene, camera);
    animId = requestAnimationFrame(gameLoop);
}

function startGame() {
    gameRunning = true;
    gamePaused = false;
    document.getElementById('status').textContent = 'Playing! Arrow keys or WASD to move.';
}

function pauseGame() {
    gamePaused = !gamePaused;
    document.getElementById('status').textContent = gamePaused ? 'Paused' : 'Playing!';
}

function gameOver() {
    gameRunning = false;
    document.getElementById('status').textContent = 'Game Over! Score: ' + score;
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning) startGame();
        else pauseGame();
        e.preventDefault();
        return;
    }
    if (!gameRunning || gamePaused) return;
    switch (e.key) {
        case 'ArrowUp': case 'KeyW': pacman.dirX = 0; pacman.dirZ = -1; break;
        case 'ArrowDown': case 'KeyS': pacman.dirX = 0; pacman.dirZ = 1; break;
        case 'ArrowLeft': case 'KeyA': pacman.dirX = -1; pacman.dirZ = 0; break;
        case 'ArrowRight': case 'KeyD': pacman.dirX = 1; pacman.dirZ = 0; break;
    }
    e.preventDefault();
});

document.addEventListener('DOMContentLoaded', () => {
    init();
    gameLoop();
});
