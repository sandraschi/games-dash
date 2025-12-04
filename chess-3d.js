// 3D Chess Implementation with Three.js
// **Timestamp**: 2025-12-04

let scene, camera, renderer, controls;
let board3D = [];
let pieces3D = [];
let selectedPiece = null;
let validMoves = [];
let currentPlayer = 'white';
let aiEnabled = false;
let boardState = [];

// Colors
const LIGHT_SQUARE = 0xF0D9B5;
const DARK_SQUARE = 0xB58863;
const HIGHLIGHT_COLOR = 0xFFFF00;
const VALID_MOVE_COLOR = 0x00FF00;

function initThreeJS() {
    const container = document.getElementById('chess3dContainer');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 20, 50);
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 12, 12);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(800, 800);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const spotLight = new THREE.SpotLight(0xffffff, 0.3);
    spotLight.position.set(-5, 10, -5);
    scene.add(spotLight);
    
    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2.1;
    
    // Create board and pieces
    createBoard();
    createPieces();
    
    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    renderer.domElement.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        // Check piece clicks
        const pieceIntersects = raycaster.intersectObjects(pieces3D.map(p => p.mesh));
        if (pieceIntersects.length > 0) {
            handlePieceClick(pieceIntersects[0].object);
            return;
        }
        
        // Check board clicks
        const boardIntersects = raycaster.intersectObjects(board3D);
        if (boardIntersects.length > 0) {
            handleBoardClick(boardIntersects[0].object);
        }
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function createBoard() {
    const boardGroup = new THREE.Group();
    
    // Board squares
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const isLight = (row + col) % 2 === 0;
            const geometry = new THREE.BoxGeometry(1, 0.2, 1);
            const material = new THREE.MeshStandardMaterial({
                color: isLight ? LIGHT_SQUARE : DARK_SQUARE,
                roughness: 0.7,
                metalness: 0.1
            });
            
            const square = new THREE.Mesh(geometry, material);
            square.position.set(col - 3.5, -0.1, row - 3.5);
            square.receiveShadow = true;
            square.userData = {row, col, type: 'square'};
            
            boardGroup.add(square);
            board3D.push(square);
        }
    }
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(9, 0.3, 9);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.8
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.35;
    base.receiveShadow = true;
    boardGroup.add(base);
    
    scene.add(boardGroup);
}

function createPiece(type, color, row, col) {
    const group = new THREE.Group();
    
    // Create 3D piece geometry
    let geometry;
    const height = 1.5;
    
    switch(type) {
        case 'pawn':
            geometry = new THREE.CylinderGeometry(0.2, 0.3, height, 16);
            const pawnTop = new THREE.SphereGeometry(0.25, 16, 16);
            const pawnTopMesh = new THREE.Mesh(pawnTop);
            pawnTopMesh.position.y = height / 2 + 0.2;
            group.add(pawnTopMesh);
            break;
        case 'rook':
            geometry = new THREE.CylinderGeometry(0.35, 0.35, height, 4);
            break;
        case 'knight':
            geometry = new THREE.ConeGeometry(0.35, height, 16);
            break;
        case 'bishop':
            geometry = new THREE.ConeGeometry(0.25, height * 1.2, 16);
            break;
        case 'queen':
            geometry = new THREE.CylinderGeometry(0.15, 0.4, height * 1.3, 16);
            const queenTop = new THREE.SphereGeometry(0.3, 16, 16);
            const queenTopMesh = new THREE.Mesh(queenTop);
            queenTopMesh.position.y = height * 1.3 / 2 + 0.25;
            group.add(queenTopMesh);
            break;
        case 'king':
            geometry = new THREE.CylinderGeometry(0.2, 0.4, height * 1.4, 16);
            const kingCross = new THREE.BoxGeometry(0.5, 0.1, 0.1);
            const kingCrossH = new THREE.Mesh(kingCross);
            kingCrossH.position.y = height * 1.4 / 2 + 0.5;
            group.add(kingCrossH);
            const kingCrossV = new THREE.BoxGeometry(0.1, 0.1, 0.5);
            const kingCrossVMesh = new THREE.Mesh(kingCrossV);
            kingCrossVMesh.position.y = height * 1.4 / 2 + 0.5;
            group.add(kingCrossVMesh);
            break;
    }
    
    const material = new THREE.MeshStandardMaterial({
        color: color === 'white' ? 0xF5F5DC : 0x2C2C2C,
        roughness: 0.6,
        metalness: 0.3
    });
    
    const baseMesh = new THREE.Mesh(geometry, material);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);
    
    // Add base disc
    const discGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const discMesh = new THREE.Mesh(discGeometry, material);
    discMesh.position.y = -height / 2 - 0.05;
    discMesh.castShadow = true;
    group.add(discMesh);
    
    group.position.set(col - 3.5, 0.5, row - 3.5);
    group.userData = {type, color, row, col};
    
    return group;
}

function createPieces() {
    const initialBoard = [
        [{type: 'rook', color: 'black'}, {type: 'knight', color: 'black'}, {type: 'bishop', color: 'black'}, {type: 'queen', color: 'black'}, {type: 'king', color: 'black'}, {type: 'bishop', color: 'black'}, {type: 'knight', color: 'black'}, {type: 'rook', color: 'black'}],
        Array(8).fill(null).map(() => ({type: 'pawn', color: 'black'})),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null).map(() => ({type: 'pawn', color: 'white'})),
        [{type: 'rook', color: 'white'}, {type: 'knight', color: 'white'}, {type: 'bishop', color: 'white'}, {type: 'queen', color: 'white'}, {type: 'king', color: 'white'}, {type: 'bishop', color: 'white'}, {type: 'knight', color: 'white'}, {type: 'rook', color: 'white'}]
    ];
    
    boardState = initialBoard;
    pieces3D = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = initialBoard[row][col];
            if (piece) {
                const piece3D = createPiece(piece.type, piece.color, row, col);
                scene.add(piece3D);
                pieces3D.push({mesh: piece3D, row, col, ...piece});
            }
        }
    }
}

function handlePieceClick(pieceMesh) {
    const pieceData = pieces3D.find(p => p.mesh === pieceMesh);
    if (!pieceData || pieceData.color !== currentPlayer) return;
    
    // Select piece
    selectedPiece = pieceData;
    clearHighlights();
    highlightSquare(pieceData.row, pieceData.col, HIGHLIGHT_COLOR);
    
    // Show valid moves (simplified - would need full chess logic)
    showValidMoves(pieceData);
    
    updateStatus(`Selected ${pieceData.color} ${pieceData.type}`);
}

function handleBoardClick(squareMesh) {
    if (!selectedPiece) return;
    
    const {row, col} = squareMesh.userData;
    
    // Attempt move (simplified - would need validation)
    movePiece(selectedPiece, row, col);
}

function movePiece(piece, toRow, toCol) {
    // Update piece position
    piece.mesh.position.set(toCol - 3.5, 0.5, toRow - 3.5);
    piece.row = toRow;
    piece.col = toCol;
    
    // Update board state
    boardState[toRow][toCol] = {type: piece.type, color: piece.color};
    
    // Clear selection
    selectedPiece = null;
    clearHighlights();
    
    // Switch player
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateStatus(`${currentPlayer}'s turn`);
    
    // Trigger AI if enabled
    if (aiEnabled && currentPlayer === 'black') {
        setTimeout(getAIMove, 500);
    }
}

function showValidMoves(piece) {
    // Simplified valid moves highlighting
    validMoves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            // Would need proper chess move validation here
            if (row !== piece.row || col !== piece.col) {
                highlightSquare(row, col, VALID_MOVE_COLOR, 0.3);
                validMoves.push({row, col});
            }
        }
    }
}

function highlightSquare(row, col, color, opacity = 0.5) {
    const square = board3D.find(s => s.userData.row === row && s.userData.col === col);
    if (square) {
        square.material.emissive = new THREE.Color(color);
        square.material.emissiveIntensity = opacity;
    }
}

function clearHighlights() {
    board3D.forEach(square => {
        square.material.emissive = new THREE.Color(0x000000);
        square.material.emissiveIntensity = 0;
    });
    validMoves = [];
}

function setView(viewName) {
    ['default', 'white', 'black', 'top'].forEach(v => {
        const btn = document.getElementById(`view-${v}`);
        if (btn) btn.classList.toggle('active', v === viewName);
    });
    
    switch(viewName) {
        case 'default':
            camera.position.set(0, 12, 12);
            controls.target.set(0, 0, 0);
            break;
        case 'white':
            camera.position.set(0, 8, 15);
            controls.target.set(0, 0, 0);
            break;
        case 'black':
            camera.position.set(0, 8, -15);
            controls.target.set(0, 0, 0);
            break;
        case 'top':
            camera.position.set(0, 20, 0);
            controls.target.set(0, 0, 0);
            break;
    }
    
    controls.update();
}

function newGame() {
    // Clear existing pieces
    pieces3D.forEach(p => scene.remove(p.mesh));
    pieces3D = [];
    
    // Recreate pieces
    createPieces();
    
    currentPlayer = 'white';
    selectedPiece = null;
    clearHighlights();
    updateStatus("New game! White to move");
}

function flipBoard() {
    // Rotate camera 180 degrees
    const currentAngle = Math.atan2(camera.position.z, camera.position.x);
    const newAngle = currentAngle + Math.PI;
    const distance = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
    
    camera.position.x = Math.cos(newAngle) * distance;
    camera.position.z = Math.sin(newAngle) * distance;
    controls.update();
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    const btn = document.getElementById('aiToggle');
    const aiControls = document.getElementById('aiControls');
    
    if (aiEnabled) {
        btn.textContent = '👤 Play vs Human';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
        aiControls.style.display = 'block';
        updateStatus('AI enabled! Real Stockfish backend required.');
    } else {
        btn.textContent = '🤖 Play vs AI';
        btn.style.background = '';
        aiControls.style.display = 'none';
    }
}

function setAIDifficulty() {
    const level = document.getElementById('aiLevel').value;
    document.getElementById('aiLevelDisplay').textContent = level;
}

async function getAIMove() {
    // This would connect to the Stockfish backend
    // For now, placeholder
    updateStatus('🤖 Stockfish thinking... (needs backend integration)');
    
    // Integration point: Use same FEN/UCI logic as 2D chess
    // fetch('http://localhost:9543/api/move', {...})
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize
initThreeJS();

