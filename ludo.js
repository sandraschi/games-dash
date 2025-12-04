// Ludo Game Implementation - Proper Board Layout
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

const BOARD_SIZE = 52; // 52 squares around the perimeter
const SAFE_SPACES = [0, 8, 13, 21, 26, 34, 39, 47]; // Safe star spaces

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
            if (piece.pos + diceValue <= BOARD_SIZE) return true;
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
        
        if (piece.pos >= BOARD_SIZE) {
            piece.finished = true;
            updateStatus(`${color.toUpperCase()} piece finished!`);
        }
        
        if (!SAFE_SPACES.includes(piece.pos % BOARD_SIZE)) {
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
    
    // Create proper Ludo board using CSS Grid
    board.style.display = 'grid';
    board.style.gridTemplateColumns = 'repeat(15, 1fr)';
    board.style.gridTemplateRows = 'repeat(15, 1fr)';
    board.style.gap = '0';
    
    // Create 15x15 grid (standard Ludo layout)
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.style.width = '100%';
            cell.style.height = '100%';
            cell.style.border = '1px solid rgba(139, 69, 19, 0.2)';
            
            // Determine cell type based on position
            const cellType = getCellType(row, col);
            
            if (cellType.type === 'home') {
                cell.style.background = cellType.color;
                cell.className = 'home-cell';
            } else if (cellType.type === 'path') {
                cell.style.background = 'rgba(255, 255, 255, 0.8)';
                cell.className = 'path-cell';
                cell.dataset.pathIndex = cellType.index;
                
                if (cellType.isStart) {
                    cell.style.background = `linear-gradient(135deg, ${cellType.startColor}, #FFD700)`;
                    cell.innerHTML = '⭐';
                    cell.style.fontSize = '24px';
                    cell.style.display = 'flex';
                    cell.style.alignItems = 'center';
                    cell.style.justifyContent = 'center';
                }
                
                // Add pieces to this cell
                renderPiecesOnCell(cell, cellType.index);
            } else if (cellType.type === 'center') {
                cell.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
                cell.innerHTML = '👑';
                cell.style.fontSize = '48px';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';
                cell.style.justifyContent = 'center';
            } else {
                cell.style.background = 'transparent';
            }
            
            board.appendChild(cell);
        }
    }
}

function getCellType(row, col) {
    // Ludo board 15x15 grid layout
    // Home bases: corners (0-5, 0-5), (0-5, 9-14), (9-14, 0-5), (9-14, 9-14)
    // Path: cross shape in middle
    // Center: (7,7)
    
    // RED home (bottom-left)
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) {
        return {type: 'home', color: 'linear-gradient(135deg, #FF6B6B, #FF5252)'};
    }
    
    // BLUE home (top-right)
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) {
        return {type: 'home', color: 'linear-gradient(135deg, #4ECDC4, #26C6DA)'};
    }
    
    // GREEN home (top-left)
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) {
        return {type: 'home', color: 'linear-gradient(135deg, #95E1D3, #66BB6A)'};
    }
    
    // YELLOW home (bottom-right)
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) {
        return {type: 'home', color: 'linear-gradient(135deg, #FFD93D, #FFC107)'};
    }
    
    // Center
    if (row === 7 && col === 7) {
        return {type: 'center'};
    }
    
    // Path squares (cross formation)
    // Left vertical column (col 6)
    if (col === 6 && row >= 0 && row <= 14 && row !== 7) {
        const index = getPathIndex('left', row);
        return {type: 'path', index, isStart: index === 39, startColor: '#FFFF00'};
    }
    
    // Right vertical column (col 8)
    if (col === 8 && row >= 0 && row <= 14 && row !== 7) {
        const index = getPathIndex('right', row);
        return {type: 'path', index, isStart: index === 13, startColor: '#0000FF'};
    }
    
    // Top horizontal row (row 6)
    if (row === 6 && col >= 0 && col <= 14 && col !== 7) {
        const index = getPathIndex('top', col);
        return {type: 'path', index, isStart: index === 26, startColor: '#00FF00'};
    }
    
    // Bottom horizontal row (row 8)
    if (row === 8 && col >= 0 && col <= 14 && col !== 7) {
        const index = getPathIndex('bottom', col);
        return {type: 'path', index, isStart: index === 0, startColor: '#FF0000'};
    }
    
    return {type: 'empty'};
}

function getPathIndex(side, pos) {
    // Map grid position to path index (0-51)
    // This is simplified - proper Ludo path mapping
    if (side === 'bottom') return pos; // 0-14
    if (side === 'right') return 13 + pos; // 13-27
    if (side === 'top') return 26 + pos; // 26-40
    if (side === 'left') return 39 + pos; // 39-53 (wraps)
    return 0;
}

function renderPiecesOnCell(cell, pathIndex) {
    Object.keys(pieces).forEach(color => {
        pieces[color].forEach((piece, pieceIndex) => {
            if (piece.pos === pathIndex && !piece.finished) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${color}`;
                pieceEl.style.width = '20px';
                pieceEl.style.height = '20px';
                pieceEl.style.borderRadius = '50%';
                pieceEl.style.border = '2px solid #000';
                pieceEl.style.cursor = 'pointer';
                pieceEl.style.position = 'absolute';
                pieceEl.onclick = () => movePiece(pieceIndex);
                cell.appendChild(pieceEl);
            }
        });
    });
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
