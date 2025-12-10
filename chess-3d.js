
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
    
    if (!container) {
        console.error('chess3dContainer not found!');
        alert('Error: chess3dContainer element not found!');
        return;
    }
    
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded!');
        container.innerHTML = '<p style="color: red; padding: 20px; text-align: center;">Error: Three.js library not loaded. Please refresh the page.</p>';
        return;
    }
    
    console.log('Initializing Three.js scene...');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 20, 50);
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 12, 12);
    camera.lookAt(0, 0, 0);
    
    // Renderer - Try multiple WebGL context options for better compatibility
    try {
        // Check if WebGL is supported
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            throw new Error('WebGL is not supported in this browser. Please enable WebGL in your browser settings or update your graphics drivers.');
        }
        
        // Try creating renderer with different options
        let rendererOptions = {
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false
        };
        
        try {
            renderer = new THREE.WebGLRenderer(rendererOptions);
        } catch (e) {
            // Fallback: try without antialias
            console.warn('Failed with antialias, trying without...', e);
            rendererOptions.antialias = false;
            renderer = new THREE.WebGLRenderer(rendererOptions);
        }
        
        renderer.setSize(800, 800);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Clear container first
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        console.log('Renderer created and added to container');
        console.log('WebGL context:', renderer.getContext());
        console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
    } catch (error) {
        console.error('Failed to create renderer:', error);
        let errorMsg = error.message || 'Unknown error';
        let helpText = '';
        
        if (errorMsg.includes('WebGL')) {
            helpText = '<br><br><strong>Possible solutions:</strong><ul style="text-align: left; display: inline-block;">' +
                      '<li>Enable WebGL in Firefox: about:config → search "webgl" → set webgl.disabled to false</li>' +
                      '<li>Enable hardware acceleration: Settings → General → Performance → uncheck "Use recommended performance settings" → check "Use hardware acceleration"</li>' +
                      '<li>Update your graphics drivers</li>' +
                      '<li>Try a different browser (Chrome, Edge)</li></ul>';
        }
        
        container.innerHTML = '<div style="color: red; padding: 20px; text-align: center; max-width: 600px; margin: 0 auto;">' +
                             '<p><strong>Error: Failed to initialize 3D renderer</strong></p>' +
                             '<p>' + errorMsg + '</p>' +
                             helpText +
                             '</div>';
        return;
    }
    
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
    try {
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            console.log('Using THREE.OrbitControls');
        } else if (typeof OrbitControls !== 'undefined') {
            controls = new OrbitControls(camera, renderer.domElement);
            console.log('Using global OrbitControls');
        } else {
            console.error('OrbitControls not loaded!');
            container.innerHTML = '<p style="color: red; padding: 20px; text-align: center;">Error: OrbitControls not loaded. Please refresh the page.</p>';
            return;
        }
    } catch (error) {
        console.error('Failed to create OrbitControls:', error);
        container.innerHTML = '<p style="color: red; padding: 20px; text-align: center;">Error: Failed to create camera controls: ' + error.message + '</p>';
        return;
    }
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2.1;
    
    // Create board and pieces
    try {
        console.log('Creating board...');
        createBoard();
        console.log('Creating pieces...');
        createPieces();
        console.log('Board and pieces created successfully');
    } catch (error) {
        console.error('Error creating board/pieces:', error);
        container.innerHTML = '<p style="color: red; padding: 20px; text-align: center;">Error creating board: ' + error.message + '</p>';
        return;
    }
    
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
        if (controls) controls.update();
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    
    console.log('Starting animation loop...');
    animate();
    console.log('3D Chess initialized successfully!');
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
    // Use enhanced models if low_poly set selected
    if (currentPieceSet === 'low_poly' && modelManager) {
        const piece = modelManager.createLowPolyPiece(type, color);
        // Fix positioning: use same formula as default pieces (col - 3.5, not multiplied by 1.2)
        piece.position.set(col - 3.5, 0.5, row - 3.5);
        piece.castShadow = true;
        piece.receiveShadow = true;
        piece.userData = {type, color, row, col};
        return piece;
    }

    
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
    if (!pieceData) return;
    
    // If clicking your own piece, select it
    if (pieceData.color === currentPlayer) {
        // If already selected, deselect
        if (selectedPiece === pieceData) {
            selectedPiece = null;
            clearHighlights();
            updateStatus(`${currentPlayer.toUpperCase()}'s turn - Click a piece to select it`);
            return;
        }
        
        // Select piece
        selectedPiece = pieceData;
        clearHighlights();
        highlightSquare(pieceData.row, pieceData.col, HIGHLIGHT_COLOR);
        
        // Show valid moves (simplified - would need full chess logic)
        showValidMoves(pieceData);
        
        updateStatus(`Selected ${pieceData.color} ${pieceData.type} - Click a green square to move`);
    } else {
        // Clicking opponent's piece - show message
        updateStatus(`That's ${pieceData.color}'s piece. Select your own ${currentPlayer} pieces.`);
    }
}

function handleBoardClick(squareMesh) {
    if (!selectedPiece) {
        updateStatus(`${currentPlayer.toUpperCase()}'s turn - Click one of your pieces first`);
        return;
    }
    
    const {row, col} = squareMesh.userData;
    
    // Check if it's a valid move (simplified check - would need full chess validation)
    const isValid = validMoves.some(m => m.row === row && m.col === col);
    
    if (!isValid && (row !== selectedPiece.row || col !== selectedPiece.col)) {
        updateStatus(`Invalid move! Click a green highlighted square.`);
        return;
    }
    
    // Attempt move
    movePiece(selectedPiece, row, col);
}

function movePiece(piece, toRow, toCol) {
    // Check multiplayer mode
    const urlParams = new URLSearchParams(window.location.search);
    const isMultiplayer = urlParams.get('multiplayer') === 'true';
    const myColor = urlParams.get('color');
    
    // In multiplayer, only allow moves on your turn
    if (isMultiplayer && currentPlayer !== myColor) {
        return;
    }
    
    // Check if there's a piece at destination (capture)
    const capturedPiece = pieces3D.find(p => p.row === toRow && p.col === toCol);
    if (capturedPiece) {
        // Remove captured piece from scene
        scene.remove(capturedPiece.mesh);
        // Remove from pieces array
        const index = pieces3D.indexOf(capturedPiece);
        if (index > -1) {
            pieces3D.splice(index, 1);
        }
    }
    
    // Clear the old square in board state
    boardState[piece.row][piece.col] = null;
    
    // Update piece position
    piece.mesh.position.set(toCol - 3.5, 0.5, toRow - 3.5);
    piece.row = toRow;
    piece.col = toCol;
    
    // Update board state
    boardState[toRow][toCol] = {type: piece.type, color: piece.color};
    
    // Send move in multiplayer mode
    if (isMultiplayer && window.sendMove && window.currentGame) {
        const game = window.currentGame();
        if (game && game.game_id) {
            window.sendMove(game.game_id, JSON.stringify({fromRow: piece.row, fromCol: piece.col, toRow, toCol}));
        }
    }
    
    // Clear selection
    selectedPiece = null;
    clearHighlights();
    
    // Switch player
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateStatus(`${currentPlayer.toUpperCase()}'s turn`);
    
    // Trigger AI if enabled (only if not multiplayer)
    if (!isMultiplayer && aiEnabled && currentPlayer === 'black') {
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

// Piece set management
let modelManager = null;
let currentPieceSet = 'low_poly'; // Default to Classic (low_poly)

function initModelManager() {
    if (typeof Chess3DModels !== 'undefined') {
        modelManager = new Chess3DModels();
    } else {
        console.error('Chess3DModels not loaded!');
        // Create a minimal fallback
        modelManager = {
            sets: {
                default: { name: 'Modern' },
                low_poly: { name: 'Classic' }
            }
        };
    }
}

function changePieceSet(setName) {
    currentPieceSet = setName;
    
    // Update button states
    document.querySelectorAll('.piece-set-selector .view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const btnId = 'set-' + setName.replace('_', '');
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
    
    // Recreate all pieces with new set
    newGame();
    if (modelManager && modelManager.sets[setName]) {
        updateStatus('Piece set changed to: ' + modelManager.sets[setName].name);
    }
}

// Set default piece set on initialization
function setDefaultPieceSet() {
    currentPieceSet = 'low_poly'; // Classic is default
    // Update button to show Classic as active
    const classicBtn = document.getElementById('set-lowpoly');
    const modernBtn = document.getElementById('set-default');
    if (classicBtn) classicBtn.classList.add('active');
    if (modernBtn) modernBtn.classList.remove('active');
}

// Initialize when DOM ready
function initializeChess3D() {
    console.log('Initializing 3D chess...');
    console.log('THREE available:', typeof THREE !== 'undefined');
    console.log('Container exists:', document.getElementById('chess3dContainer') !== null);
    console.log('OrbitControls available:', typeof THREE.OrbitControls !== 'undefined' || typeof OrbitControls !== 'undefined');
    
    const container = document.getElementById('chess3dContainer');
    if (!container) {
        console.error('chess3dContainer element not found!');
        return;
    }
    
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded!');
        container.innerHTML = '<p style="color: red; padding: 20px; text-align: center;">Error: Three.js library not loaded. Please refresh the page.</p>';
        return;
    }
    
    // Wait a bit for all scripts to load
    setTimeout(() => {
        console.log('Initializing model manager and Three.js...');
        try {
            initModelManager();
            setDefaultPieceSet(); // Set Classic (low_poly) as default
            initThreeJS();
        } catch (error) {
            console.error('Error initializing 3D chess:', error);
            container.innerHTML = '<p style="color: red; padding: 20px; text-align: center;">Error initializing 3D chess: ' + error.message + '</p>';
        }
    }, 200);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChess3D);
} else {
    // DOM already loaded, wait for window load to ensure scripts are ready
    if (document.readyState === 'complete') {
        initializeChess3D();
    } else {
        window.addEventListener('load', initializeChess3D);
    }
}
