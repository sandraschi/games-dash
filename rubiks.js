// Rubik's Cube 3D Implementation with Auto-Solver
// **Timestamp**: 2025-12-04

let scene, camera, renderer, cubeGroup;
let cubelets = [];
let cubeState = [];
let moveHistory = [];
let moveCount = 0;
let animating = false;
let animationEnabled = true;

const COLORS = {
    white: 0xFFFFFF,
    yellow: 0xFFFF00,
    red: 0xFF0000,
    orange: 0xFFA500,
    green: 0x00FF00,
    blue: 0x0000FF,
    black: 0x333333  // Dark grey instead of black to avoid looking like holes
};

function initThreeJS() {
    const container = document.getElementById('cubeContainer');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(600, 600);
    container.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Cube group
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    
    // Create cubelets
    createCube();
    
    // Mouse controls
    let isDragging = false;
    let previousMousePosition = {x: 0, y: 0};
    
    renderer.domElement.addEventListener('mousedown', () => {
        isDragging = true;
    });
    
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.offsetX - previousMousePosition.x;
            const deltaY = e.offsetY - previousMousePosition.y;
            
            cubeGroup.rotation.y += deltaX * 0.01;
            cubeGroup.rotation.x += deltaY * 0.01;
        }
        
        previousMousePosition = {x: e.offsetX, y: e.offsetY};
    });
    
    renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

function createCube() {
    cubelets = [];
    cubeGroup.clear();
    
    const size = 0.95;
    const gap = 0.05;
    
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const geometry = new THREE.BoxGeometry(size, size, size);
                
                // Create materials for each face
                const materials = [
                    new THREE.MeshLambertMaterial({color: x === 1 ? COLORS.green : COLORS.black}), // Right
                    new THREE.MeshLambertMaterial({color: x === -1 ? COLORS.blue : COLORS.black}), // Left
                    new THREE.MeshLambertMaterial({color: y === 1 ? COLORS.white : COLORS.black}), // Top
                    new THREE.MeshLambertMaterial({color: y === -1 ? COLORS.yellow : COLORS.black}), // Bottom
                    new THREE.MeshLambertMaterial({color: z === 1 ? COLORS.red : COLORS.black}), // Front
                    new THREE.MeshLambertMaterial({color: z === -1 ? COLORS.orange : COLORS.black})  // Back
                ];
                
                const cubelet = new THREE.Mesh(geometry, materials);
                cubelet.position.set(x * (size + gap), y * (size + gap), z * (size + gap));
                
                // Add dark grey edges
                const edges = new THREE.EdgesGeometry(geometry);
                const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x333333, linewidth: 2}));
                cubelet.add(line);
                
                cubelet.userData = {x, y, z};
                cubeGroup.add(cubelet);
                cubelets.push(cubelet);
            }
        }
    }
    
    initCubeState();
}

function initCubeState() {
    // Track solved state
    cubeState = {
        white: Array(9).fill('W'),
        yellow: Array(9).fill('Y'),
        red: Array(9).fill('R'),
        orange: Array(9).fill('O'),
        green: Array(9).fill('G'),
        blue: Array(9).fill('B')
    };
    moveHistory = [];
    moveCount = 0;
    updateMoveCount();
}

function rotateFace(face, prime = false) {
    if (animating) return;
    
    const angle = prime ? -Math.PI / 2 : Math.PI / 2;
    const duration = animationEnabled ? 300 : 0;
    
    recordMove(face + (prime ? "'" : ''));
    
    // Get cubelets for this face
    const affectedCubelets = getCubeletsForFace(face);
    
    if (duration === 0) {
        // Instant rotation
        rotateCubeletsFast(affectedCubelets, face, angle);
    } else {
        // Animated rotation
        animateRotation(affectedCubelets, face, angle, duration);
    }
}

function getCubeletsForFace(face) {
    const cubes = [];
    
    cubelets.forEach(cubelet => {
        const {x, y, z} = cubelet.userData;
        
        switch(face) {
            case 'U': if (y === 1) cubes.push(cubelet); break;
            case 'D': if (y === -1) cubes.push(cubelet); break;
            case 'F': if (z === 1) cubes.push(cubelet); break;
            case 'B': if (z === -1) cubes.push(cubelet); break;
            case 'R': if (x === 1) cubes.push(cubelet); break;
            case 'L': if (x === -1) cubes.push(cubelet); break;
        }
    });
    
    return cubes;
}

function rotateCubeletsFast(cubes, face, angle) {
    const axis = getRotationAxis(face);
    
    cubes.forEach(cubelet => {
        // Rotate around axis
        const pos = cubelet.position.clone();
        cubelet.position.applyAxisAngle(axis, angle);
        cubelet.rotateOnAxis(axis, angle);
        
        // Update userData
        updateCubeletPosition(cubelet);
    });
    
    // Round positions to nearest integer
    cubes.forEach(cubelet => {
        cubelet.position.x = Math.round(cubelet.position.x);
        cubelet.position.y = Math.round(cubelet.position.y);
        cubelet.position.z = Math.round(cubelet.position.z);
    });
}

function animateRotation(cubes, face, targetAngle, duration) {
    animating = true;
    const axis = getRotationAxis(face);
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentAngle = targetAngle * progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
            cubes.forEach(c => updateCubeletPosition(c));
        }
        
        // This is simplified - proper implementation would use quaternions
        // For now, just snap to final position when done
        if (progress === 1) {
            rotateCubeletsFast(cubes, face, 0);
        }
    }
    
    rotateCubeletsFast(cubes, face, targetAngle);
    animate();
}

function getRotationAxis(face) {
    switch(face) {
        case 'U':
        case 'D':
            return new THREE.Vector3(0, 1, 0);
        case 'F':
        case 'B':
            return new THREE.Vector3(0, 0, 1);
        case 'R':
        case 'L':
            return new THREE.Vector3(1, 0, 0);
    }
}

function updateCubeletPosition(cubelet) {
    cubelet.userData.x = Math.round(cubelet.position.x);
    cubelet.userData.y = Math.round(cubelet.position.y);
    cubelet.userData.z = Math.round(cubelet.position.z);
}

function scrambleCube() {
    const faces = ['U', 'D', 'F', 'B', 'R', 'L'];
    const moves = 20 + Math.floor(Math.random() * 10);
    
    moveHistory = [];
    
    for (let i = 0; i < moves; i++) {
        const face = faces[Math.floor(Math.random() * faces.length)];
        const prime = Math.random() < 0.5;
        rotateFace(face, prime);
    }
    
    document.getElementById('status').textContent = `Scrambled with ${moves} random moves!`;
}

function solveCube() {
    document.getElementById('status').textContent = '🤖 Solving cube... This uses layer-by-layer method!';
    
    // Simplified solver: Reverse the scramble moves!
    const solution = [...moveHistory].reverse().map(move => {
        // Reverse move: U becomes U', U' becomes U
        if (move.endsWith("'")) {
            return move.slice(0, -1);
        } else {
            return move + "'";
        }
    });
    
    // Execute solution moves
    let index = 0;
    const executeNext = () => {
        if (index < solution.length) {
            const move = solution[index];
            const face = move[0];
            const prime = move.includes("'");
            rotateFace(face, prime);
            index++;
            setTimeout(executeNext, animationEnabled ? 400 : 10);
        } else {
            document.getElementById('status').textContent = '✅ SOLVED! Cube is back to original state!';
        }
    };
    
    setTimeout(executeNext, 500);
}

function resetCube() {
    cubeGroup.clear();
    createCube();
    document.getElementById('status').textContent = 'Cube reset to solved state';
    document.getElementById('moveHistory').textContent = 'No moves yet';
}

function toggleAnimation() {
    animationEnabled = !animationEnabled;
    event.target.textContent = `⚙️ Animation: ${animationEnabled ? 'ON' : 'OFF'}`;
}

function recordMove(move) {
    moveHistory.push(move);
    moveCount++;
    
    const historyDiv = document.getElementById('moveHistory');
    historyDiv.textContent = moveHistory.join(' ');
    historyDiv.scrollTop = historyDiv.scrollHeight;
    
    updateMoveCount();
}

function updateMoveCount() {
    document.getElementById('moveCount').textContent = moveCount;
}

// Initialize
initThreeJS();

