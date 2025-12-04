// Ludo Game Implementation - SIMPLIFIED WORKING VERSION
// **Timestamp**: 2025-12-04

let players = ['red', 'blue', 'green', 'yellow'];
let currentPlayer = 0;
let diceValue = 0;
let gameActive = false;
let aiEnabled = true;
let pieces = {
    red: [{pos: -1, finished: false}, {pos: -1, finished: false}, {pos: -1, finished: false}, {pos: -1, finished: false}],
    blue: [{pos: -1, finished: false}, {pos: -1, finished: false}, {pos: -1, finished: false}, {pos: -1, finished: false}],
    green: [{pos: -1, finished: false}, {pos: -1, finished: false}, {pos: -1, finished: false}, {pos: -1, finished: false}],
    yellow: [{pos: -1, finished: false}, {pos: -1, finished: false}, {pos: -1, finished: false}, {pos: -1, finished: false}]
};

const BOARD_SIZE = 52;
const SAFE_SPACES = [0, 8, 13, 21, 26, 34, 39, 47];

function newGame() {
    gameActive = true;
    currentPlayer = 0;
    diceValue = 0;
    
    Object.keys(pieces).forEach(color => {
        pieces[color] = [
            {pos: -1, finished: false},
            {pos: -1, finished: false},
            {pos: -1, finished: false},
            {pos: -1, finished: false}
        ];
    });
    
    renderBoard();
    renderPlayerInfo();
    updateStatus(`${players[currentPlayer].toUpperCase()}'s turn - Roll the dice!`);
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    document.getElementById('aiToggle').textContent = aiEnabled ? '👤 Play vs AI' : '🤖 2-4 Players (AI)';
}

function rollDice() {
    if (!gameActive || diceValue !== 0) return;
    
    const dice = document.getElementById('dice');
    dice.classList.add('rolling');
    
    setTimeout(() => {
        diceValue = Math.floor(Math.random() * 6) + 1;
        dice.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceValue - 1];
        dice.classList.remove('rolling');
        
        updateStatus(`Rolled ${diceValue}! Select a piece to move.`);
        
        if (!canMove(players[currentPlayer])) {
            updateStatus(`No valid moves! Next player.`);
            setTimeout(nextTurn, 1500);
        } else if (aiEnabled && currentPlayer > 0) {
            setTimeout(aiMove, 1000);
        }
    }, 500);
}

function canMove(color) {
    const playerPieces = pieces[color];
    
    for (const piece of playerPieces) {
        if (piece.finished) continue;
        
        if (piece.pos === -1) {
            if (diceValue === 6) return true;
        } else {
            if (piece.pos + diceValue <= BOARD_SIZE + 5) return true;
        }
    }
    
    return false;
}

function movePiece(pieceIndex) {
    if (diceValue === 0) return;
    
    const color = players[currentPlayer];
    const piece = pieces[color][pieceIndex];
    
    if (piece.finished) {
        updateStatus('That piece is already finished!');
        return;
    }
    
    if (piece.pos === -1) {
        if (diceValue === 6) {
            piece.pos = getStartPosition(color);
            updateStatus(`${color.toUpperCase()} piece enters the board!`);
        } else {
            updateStatus('Need a 6 to get out of home!');
            return;
        }
    } else {
        piece.pos += diceValue;
        
        if (piece.pos >= BOARD_SIZE + 5) {
            piece.finished = true;
            updateStatus(`${color.toUpperCase()} piece finished!`);
        } else if (!SAFE_SPACES.includes(piece.pos % BOARD_SIZE) && piece.pos < BOARD_SIZE) {
            checkCaptures(color, piece.pos);
        }
    }
    
    renderBoard();
    
    if (checkWin(color)) {
        gameActive = false;
        updateStatus(`🎉 ${color.toUpperCase()} WINS!`);
        return;
    }
    
    if (diceValue === 6) {
        diceValue = 0;
        updateStatus(`${color.toUpperCase()} rolled 6! Roll again!`);
    } else {
        nextTurn();
    }
}

function getStartPosition(color) {
    const starts = {red: 0, blue: 13, green: 26, yellow: 39};
    return starts[color];
}

function checkCaptures(color, position) {
    Object.keys(pieces).forEach(otherColor => {
        if (otherColor === color) return;
        
        pieces[otherColor].forEach(piece => {
            if (piece.pos === position && !piece.finished) {
                piece.pos = -1;
                updateStatus(`${color.toUpperCase()} captured ${otherColor.toUpperCase()}!`);
            }
        });
    });
}

function checkWin(color) {
    return pieces[color].every(piece => piece.finished);
}

function nextTurn() {
    diceValue = 0;
    currentPlayer = (currentPlayer + 1) % 4;
    renderPlayerInfo();
    updateStatus(`${players[currentPlayer].toUpperCase()}'s turn - Roll the dice!`);
    
    if (aiEnabled && currentPlayer > 0) {
        setTimeout(rollDice, 1000);
    }
}

function aiMove() {
    const color = players[currentPlayer];
    const playerPieces = pieces[color];
    
    let bestPiece = -1;
    let bestScore = -1000;
    
    playerPieces.forEach((piece, index) => {
        if (piece.finished) return;
        
        let score = 0;
        
        if (piece.pos === -1 && diceValue === 6) {
            score = 50;
        } else if (piece.pos !== -1) {
            score = piece.pos;
            
            if (piece.pos + diceValue >= BOARD_SIZE) {
                score += 100;
            }
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestPiece = index;
        }
    });
    
    if (bestPiece !== -1) {
        setTimeout(() => movePiece(bestPiece), 500);
    } else {
        nextTurn();
    }
}

function renderBoard() {
    const board = document.getElementById('ludoBoard');
    board.innerHTML = '';
    
    // Create cross-shaped path with absolute positioning
    const cellSize = 44;
    const pathPositions = generatePathPositions(cellSize);
    
    // Render path squares
    pathPositions.forEach((pos, index) => {
        const cell = document.createElement('div');
        cell.className = 'board-space';
        cell.style.position = 'absolute';
        cell.style.left = pos.x + 'px';
        cell.style.top = pos.y + 'px';
        cell.style.width = cellSize + 'px';
        cell.style.height = cellSize + 'px';
        cell.style.background = 'rgba(255, 255, 255, 0.9)';
        cell.style.border = '2px solid #8B4513';
        cell.style.borderRadius = '5px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        
        if (SAFE_SPACES.includes(index)) {
            cell.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
            cell.innerHTML = '⭐';
            cell.style.fontSize = '24px';
        }
        
        if (index === 0 || index === 13 || index === 26 || index === 39) {
            cell.style.background = 'linear-gradient(135deg, #FFD700, #FFC107)';
            cell.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.6)';
        }
        
        // Add pieces
        Object.keys(pieces).forEach(color => {
            pieces[color].forEach((piece, idx) => {
                if (piece.pos === index && !piece.finished) {
                    const pieceEl = createPieceElement(color, idx);
                    cell.appendChild(pieceEl);
                }
            });
        });
        
        board.appendChild(cell);
    });
    
    // Render HOME BASES as small separate overlays
    renderHomeBases();
}

function generatePathPositions(cellSize) {
    // Generate 52 path positions in cross shape
    const positions = [];
    const centerX = 350;
    const centerY = 350;
    
    // Create classic Ludo cross path (52 squares)
    // Bottom row going right (RED zone)
    for (let i = 0; i < 6; i++) positions.push({x: centerX - cellSize * 2 + i * cellSize, y: centerY + cellSize * 2});
    
    // Up right column (entering BLUE zone)
    for (let i = 0; i < 6; i++) positions.push({x: centerX + cellSize * 2, y: centerY + cellSize * 2 - i * cellSize});
    positions.push({x: centerX + cellSize * 2, y: centerY - cellSize * 2}); // 12
    
    // BLUE START
    positions.push({x: centerX + cellSize * 3, y: centerY - cellSize * 2}); // 13
    
    // Continue path
    for (let i = 0; i < 5; i++) positions.push({x: centerX + cellSize * 3, y: centerY - cellSize * 2 + (i + 1) * cellSize});
    for (let i = 0; i < 6; i++) positions.push({x: centerX + cellSize * 3 - (i + 1) * cellSize, y: centerY + cellSize * 2});
    
    // More positions to complete the 52-square circuit
    for (let i = positions.length; i < 52; i++) {
        positions.push({x: centerX + (i % 10) * cellSize, y: centerY + Math.floor(i / 10) * cellSize});
    }
    
    return positions;
}

function renderHomeBases() {
    const board = document.getElementById('ludoBoard');
    const homeSize = 120;
    
    const homeConfigs = [
        {color: 'green', top: 40, left: 40},
        {color: 'yellow', top: 40, right: 40},
        {color: 'red', bottom: 40, left: 40},
        {color: 'blue', bottom: 40, right: 40}
    ];
    
    homeConfigs.forEach(config => {
        const homeBase = document.createElement('div');
        homeBase.style.position = 'absolute';
        homeBase.style.width = homeSize + 'px';
        homeBase.style.height = homeSize + 'px';
        homeBase.style.borderRadius = '15px';
        homeBase.style.display = 'grid';
        homeBase.style.gridTemplateColumns = 'repeat(2, 1fr)';
        homeBase.style.gridTemplateRows = 'repeat(2, 1fr)';
        homeBase.style.gap = '8px';
        homeBase.style.padding = '15px';
        homeBase.style.border = '4px solid';
        homeBase.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.3)';
        homeBase.style.zIndex = '100';
        
        if (config.top !== undefined) homeBase.style.top = config.top + 'px';
        if (config.bottom !== undefined) homeBase.style.bottom = config.bottom + 'px';
        if (config.left !== undefined) homeBase.style.left = config.left + 'px';
        if (config.right !== undefined) homeBase.style.right = config.right + 'px';
        
        const colorMap = {
            green: {bg: 'linear-gradient(135deg, #95E1D3, #66BB6A)', border: '#388E3C'},
            yellow: {bg: 'linear-gradient(135deg, #FFD93D, #FFC107)', border: '#F57C00'},
            red: {bg: 'linear-gradient(135deg, #FF6B6B, #FF5252)', border: '#D32F2F'},
            blue: {bg: 'linear-gradient(135deg, #4ECDC4, #26C6DA)', border: '#0097A7'}
        };
        
        homeBase.style.background = colorMap[config.color].bg;
        homeBase.style.borderColor = colorMap[config.color].border;
        
        // Add 4 slots
        for (let i = 0; i < 4; i++) {
            const slot = document.createElement('div');
            slot.style.background = 'rgba(255, 255, 255, 0.3)';
            slot.style.border = '2px solid rgba(255, 255, 255, 0.5)';
            slot.style.borderRadius = '50%';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            
            const homePieces = pieces[config.color].filter(p => p.pos === -1);
            if (homePieces[i]) {
                const pieceIndex = pieces[config.color].indexOf(homePieces[i]);
                const pieceEl = createPieceElement(config.color, pieceIndex);
                slot.appendChild(pieceEl);
            }
            
            homeBase.appendChild(slot);
        }
        
        board.appendChild(homeBase);
    });
}

function createPieceElement(color, index) {
    const pieceEl = document.createElement('div');
    pieceEl.className = `piece ${color}`;
    pieceEl.style.position = 'relative';
    pieceEl.onclick = () => {
        if (players[currentPlayer] === color) {
            movePiece(index);
        }
    };
    return pieceEl;
}

function renderPlayerInfo() {
    const infoDiv = document.getElementById('playerInfo');
    infoDiv.innerHTML = '';
    
    players.forEach((color, index) => {
        const box = document.createElement('div');
        box.className = `player-box ${color}`;
        if (index === currentPlayer) box.classList.add('active');
        
        const finished = pieces[color].filter(p => p.finished).length;
        const onBoard = pieces[color].filter(p => p.pos !== -1 && !p.finished).length;
        
        box.innerHTML = `
            <h3 style="margin: 0;">${color.toUpperCase()} ${index === 0 ? '(You)' : '(AI)'}</h3>
            <p style="margin: 5px 0;">In Home: ${4 - onBoard - finished}</p>
            <p style="margin: 5px 0;">On Board: ${onBoard}</p>
            <p style="margin: 5px 0; color: #4CAF50;">Finished: ${finished}/4</p>
        `;
        
        infoDiv.appendChild(box);
    });
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize
newGame();
