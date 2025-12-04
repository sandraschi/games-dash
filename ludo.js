// Ludo Game Implementation - Classic Board Layout
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
    board.style.display = 'block';
    board.style.position = 'relative';
    
    const boardSize = 700;
    const cellSize = boardSize / 15;
    
    // Draw 15x15 grid for classic Ludo layout
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.style.position = 'absolute';
            cell.style.left = (col * cellSize) + 'px';
            cell.style.top = (row * cellSize) + 'px';
            cell.style.width = cellSize + 'px';
            cell.style.height = cellSize + 'px';
            cell.style.boxSizing = 'border-box';
            cell.style.border = '1px solid rgba(139, 69, 19, 0.2)';
            
            const cellInfo = getCellInfo(row, col);
            
            if (cellInfo.type === 'home') {
                // Home base areas
                cell.style.background = cellInfo.color;
                
                // Add slots for pieces in home
                if (cellInfo.isSlot) {
                    cell.style.background = 'rgba(255, 255, 255, 0.3)';
                    cell.style.border = '2px solid rgba(255, 255, 255, 0.5)';
                    cell.style.borderRadius = '50%';
                    cell.style.margin = '2px';
                    
                    // Check if piece should be here
                    const colorPieces = pieces[cellInfo.homeColor].filter(p => p.pos === -1);
                    if (colorPieces[cellInfo.slotIndex]) {
                        const pieceEl = createPieceElement(cellInfo.homeColor, cellInfo.slotIndex);
                        cell.appendChild(pieceEl);
                    }
                }
            } else if (cellInfo.type === 'path') {
                // Path squares
                cell.style.background = 'rgba(255, 255, 255, 0.9)';
                cell.style.borderColor = '#8B4513';
                cell.dataset.pathIndex = cellInfo.index;
                
                if (SAFE_SPACES.includes(cellInfo.index)) {
                    cell.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
                    cell.innerHTML = '<div style="font-size: 18px; text-align: center;">⭐</div>';
                }
                
                if (cellInfo.isStart) {
                    cell.style.background = `linear-gradient(135deg, ${cellInfo.startColor}, #FFD700)`;
                    cell.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.6)';
                }
                
                // Add pieces on this path square
                Object.keys(pieces).forEach(color => {
                    pieces[color].forEach((piece, idx) => {
                        if (piece.pos === cellInfo.index && !piece.finished) {
                            const pieceEl = createPieceElement(color, idx);
                            pieceEl.style.position = 'absolute';
                            pieceEl.style.left = '50%';
                            pieceEl.style.top = '50%';
                            pieceEl.style.transform = 'translate(-50%, -50%)';
                            cell.appendChild(pieceEl);
                        }
                    });
                });
            } else if (cellInfo.type === 'home-column') {
                // Home columns leading to center
                cell.style.background = `linear-gradient(135deg, ${cellInfo.color}, ${cellInfo.color}AA)`;
                cell.style.borderColor = cellInfo.color;
            } else if (cellInfo.type === 'center') {
                // Victory center
                cell.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
                cell.innerHTML = '<div style="font-size: 32px; text-align: center; line-height: ' + cellSize + 'px;">👑</div>';
                cell.style.borderRadius = '50%';
                cell.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
            }
            
            board.appendChild(cell);
        }
    }
}

function getCellInfo(row, col) {
    // Classic Ludo 15x15 layout
    // Home bases: 6x6 in each corner
    // Path: Cross shape (rows 6,8 and cols 6,8)
    // Home columns: rows/cols 7 leading to center (7,7)
    
    // GREEN home (top-left, 0-5, 0-5)
    if (row <= 5 && col <= 5) {
        if ((row === 1 || row === 4) && (col === 1 || col === 4)) {
            return {type: 'home', color: 'linear-gradient(135deg, #95E1D3, #66BB6A)', isSlot: true, homeColor: 'green', slotIndex: row === 1 ? (col === 1 ? 0 : 1) : (col === 1 ? 2 : 3)};
        }
        return {type: 'home', color: 'linear-gradient(135deg, #95E1D3, #66BB6A)'};
    }
    
    // YELLOW home (top-right, 0-5, 9-14)
    if (row <= 5 && col >= 9) {
        if ((row === 1 || row === 4) && (col === 10 || col === 13)) {
            return {type: 'home', color: 'linear-gradient(135deg, #FFD93D, #FFC107)', isSlot: true, homeColor: 'yellow', slotIndex: row === 1 ? (col === 10 ? 0 : 1) : (col === 10 ? 2 : 3)};
        }
        return {type: 'home', color: 'linear-gradient(135deg, #FFD93D, #FFC107)'};
    }
    
    // RED home (bottom-left, 9-14, 0-5)
    if (row >= 9 && col <= 5) {
        if ((row === 10 || row === 13) && (col === 1 || col === 4)) {
            return {type: 'home', color: 'linear-gradient(135deg, #FF6B6B, #FF5252)', isSlot: true, homeColor: 'red', slotIndex: row === 10 ? (col === 1 ? 0 : 1) : (col === 1 ? 2 : 3)};
        }
        return {type: 'home', color: 'linear-gradient(135deg, #FF6B6B, #FF5252)'};
    }
    
    // BLUE home (bottom-right, 9-14, 9-14)
    if (row >= 9 && col >= 9) {
        if ((row === 10 || row === 13) && (col === 10 || col === 13)) {
            return {type: 'home', color: 'linear-gradient(135deg, #4ECDC4, #26C6DA)', isSlot: true, homeColor: 'blue', slotIndex: row === 10 ? (col === 10 ? 0 : 1) : (col === 10 ? 2 : 3)};
        }
        return {type: 'home', color: 'linear-gradient(135deg, #4ECDC4, #26C6DA)'};
    }
    
    // Center victory square
    if (row === 7 && col === 7) {
        return {type: 'center'};
    }
    
    // Path squares forming cross
    // Bottom row (row 8) - RED to BLUE
    if (row === 8 && col >= 0 && col <= 5) {
        return {type: 'path', index: col, isStart: col === 0, startColor: '#FF0000'};
    }
    if (row === 8 && col >= 9 && col <= 14) {
        return {type: 'path', index: 6 + (col - 9), isStart: false, startColor: '#FF0000'};
    }
    
    // Right column (col 8) - BLUE to GREEN
    if (col === 8 && row >= 0 && row <= 5) {
        return {type: 'path', index: 13 + (5 - row), isStart: row === 0, startColor: '#4ECDC4'};
    }
    if (col === 8 && row >= 9 && row <= 14) {
        return {type: 'path', index: 19 + (row - 9), isStart: false, startColor: '#4ECDC4'};
    }
    
    // Top row (row 6) - GREEN to YELLOW
    if (row === 6 && col >= 9 && col <= 14) {
        return {type: 'path', index: 26 + (14 - col), isStart: col === 14, startColor: '#95E1D3'};
    }
    if (row === 6 && col >= 0 && col <= 5) {
        return {type: 'path', index: 32 + (5 - col), isStart: false, startColor: '#95E1D3'};
    }
    
    // Left column (col 6) - YELLOW to RED
    if (col === 6 && row >= 9 && row <= 14) {
        return {type: 'path', index: 39 + (14 - row), isStart: row === 14, startColor: '#FFD93D'};
    }
    if (col === 6 && row >= 0 && row <= 5) {
        return {type: 'path', index: 45 + row, isStart: false, startColor: '#FFD93D'};
    }
    
    // Home columns (colored paths to center)
    if (row === 7 && col >= 1 && col <= 5) {
        return {type: 'home-column', color: '#FF6B6B'}; // Red home column
    }
    if (col === 7 && row >= 1 && row <= 5) {
        return {type: 'home-column', color: '#4ECDC4'}; // Blue home column
    }
    if (row === 7 && col >= 9 && col <= 13) {
        return {type: 'home-column', color: '#95E1D3'}; // Green home column
    }
    if (col === 7 && row >= 9 && row <= 13) {
        return {type: 'home-column', color: '#FFD93D'}; // Yellow home column
    }
    
    return {type: 'empty'};
}

function createPieceElement(color, index) {
    const pieceEl = document.createElement('div');
    pieceEl.className = `piece ${color}`;
    pieceEl.onclick = () => {
        if (players[currentPlayer] === color) {
            movePiece(index);
        }
    };
    return pieceEl;
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
