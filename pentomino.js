// Pentomino Puzzle Game Implementation
// **Timestamp**: 2025-12-04

let gridRows = 6;
let gridCols = 10;
let grid = [];
let selectedPiece = null;
let selectedRotation = 0;
let selectedFlip = false;
let usedPieces = new Set();

// 12 pentomino pieces (represented as relative coordinates)
const PENTOMINOES = {
    F: [[0,0], [0,1], [1,0], [1,-1], [2,0]],
    I: [[0,0], [1,0], [2,0], [3,0], [4,0]],
    L: [[0,0], [1,0], [2,0], [3,0], [3,1]],
    N: [[0,0], [0,1], [1,1], [1,2], [1,3]],
    P: [[0,0], [0,1], [1,0], [1,1], [2,0]],
    T: [[0,0], [1,0], [2,0], [1,1], [1,2]],
    U: [[0,0], [0,1], [1,1], [2,0], [2,1]],
    V: [[0,0], [1,0], [2,0], [2,1], [2,2]],
    W: [[0,0], [0,1], [1,1], [1,2], [2,2]],
    X: [[1,0], [0,1], [1,1], [2,1], [1,2]],
    Y: [[0,0], [1,0], [2,0], [3,0], [2,1]],
    Z: [[0,0], [0,1], [1,1], [2,1], [2,2]]
};

const PIECE_COLORS = {
    F: '#FF6B6B', I: '#4ECDC4', L: '#FFD93D', N: '#95E1D3',
    P: '#FF9999', T: '#6BCF7F', U: '#A29BFE', V: '#FD79A8',
    W: '#FDCB6E', X: '#74B9FF', Y: '#55EFC4', Z: '#FAB1A0'
};

function setGridSize(rows) {
    gridRows = rows;
    gridCols = rows === 6 ? 10 : rows === 8 ? 8 : 6;
    
    [6, 8, 10].forEach(s => {
        const btn = document.getElementById(`btn-${s}`);
        if (btn) btn.classList.toggle('active', s === rows);
    });
    
    clearGrid();
}

function clearGrid() {
    grid = Array(gridRows).fill(null).map(() => Array(gridCols).fill(null));
    usedPieces.clear();
    selectedPiece = null;
    selectedRotation = 0;
    selectedFlip = false;
    renderGrid();
    renderPieces();
    updateProgress();
}

function renderGrid() {
    const gridElement = document.getElementById('pentominoGrid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${gridCols}, 35px)`;
    gridElement.style.gridTemplateRows = `repeat(${gridRows}, 35px)`;
    
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (grid[row][col]) {
                cell.classList.add('filled');
                cell.style.background = PIECE_COLORS[grid[row][col]];
            }
            
            cell.addEventListener('click', () => placePiece(row, col));
            cell.addEventListener('mouseenter', () => previewPiece(row, col));
            
            gridElement.appendChild(cell);
        }
    }
}

function renderPieces() {
    const piecesElement = document.getElementById('pieces');
    piecesElement.innerHTML = '';
    
    Object.keys(PENTOMINOES).forEach(name => {
        const btn = document.createElement('button');
        btn.className = 'piece-btn';
        btn.textContent = name;
        btn.style.background = `linear-gradient(135deg, ${PIECE_COLORS[name]}, ${PIECE_COLORS[name]}88)`;
        
        if (usedPieces.has(name)) {
            btn.classList.add('used');
        }
        
        if (selectedPiece === name) {
            btn.classList.add('selected');
        }
        
        btn.onclick = () => selectPiece(name);
        piecesElement.appendChild(btn);
    });
}

function selectPiece(name) {
    selectedPiece = name;
    selectedRotation = 0;
    selectedFlip = false;
    renderPieces();
    document.getElementById('status').textContent = `Selected: ${name} - Click grid to place`;
}

function rotate() {
    if (!selectedPiece) return;
    selectedRotation = (selectedRotation + 1) % 4;
    document.getElementById('status').textContent = `${selectedPiece} rotated (${selectedRotation * 90}°)`;
}

function flip() {
    if (!selectedPiece) return;
    selectedFlip = !selectedFlip;
    document.getElementById('status').textContent = `${selectedPiece} ${selectedFlip ? 'flipped' : 'normal'}`;
}

function transformCoords(coords, rotation, flip) {
    let result = [...coords];
    
    // Apply rotations
    for (let i = 0; i < rotation; i++) {
        result = result.map(([r, c]) => [c, -r]);
    }
    
    // Apply flip
    if (flip) {
        result = result.map(([r, c]) => [r, -c]);
    }
    
    return result;
}

function placePiece(row, col) {
    if (!selectedPiece || usedPieces.has(selectedPiece)) return;
    
    const coords = transformCoords(PENTOMINOES[selectedPiece], selectedRotation, selectedFlip);
    
    // Check if placement is valid
    for (const [dr, dc] of coords) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow < 0 || newRow >= gridRows || newCol < 0 || newCol >= gridCols) {
            document.getElementById('status').textContent = '❌ Out of bounds!';
            return;
        }
        
        if (grid[newRow][newCol]) {
            document.getElementById('status').textContent = '❌ Space already occupied!';
            return;
        }
    }
    
    // Place the piece
    for (const [dr, dc] of coords) {
        grid[row + dr][col + dc] = selectedPiece;
    }
    
    usedPieces.add(selectedPiece);
    selectedPiece = null;
    
    renderGrid();
    renderPieces();
    updateProgress();
    checkWin();
}

function previewPiece(row, col) {
    if (!selectedPiece || usedPieces.has(selectedPiece)) return;
    
    const coords = transformCoords(PENTOMINOES[selectedPiece], selectedRotation, selectedFlip);
    
    // Clear previous preview
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.style.opacity = '';
    });
    
    // Show preview
    for (const [dr, dc] of coords) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < gridRows && newCol >= 0 && newCol < gridCols) {
            const cell = document.querySelector(`.grid-cell[data-row="${newRow}"][data-col="${newCol}"]`);
            if (cell && !grid[newRow][newCol]) {
                cell.style.opacity = '0.5';
                cell.style.background = PIECE_COLORS[selectedPiece];
            }
        }
    }
}

function updateProgress() {
    document.getElementById('progress').textContent = `${usedPieces.size} / 12`;
}

function checkWin() {
    if (usedPieces.size === 12) {
        // Check if entire grid is filled
        let filled = 0;
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                if (grid[row][col]) filled++;
            }
        }
        
        if (filled === gridRows * gridCols) {
            document.getElementById('status').textContent = '🎉 PUZZLE COMPLETE! Perfect fit!';
        }
    }
}

// Initialize
setGridSize(6);

