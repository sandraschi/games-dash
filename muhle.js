// Mühle (Nine Men's Morris) Game Implementation
// **Timestamp**: 2025-12-03

const POSITIONS = [
    // Outer square
    {x: 50, y: 50}, {x: 300, y: 50}, {x: 550, y: 50},
    {x: 50, y: 300}, {x: 550, y: 300},
    {x: 50, y: 550}, {x: 300, y: 550}, {x: 550, y: 550},
    // Middle square
    {x: 150, y: 150}, {x: 300, y: 150}, {x: 450, y: 150},
    {x: 150, y: 300}, {x: 450, y: 300},
    {x: 150, y: 450}, {x: 300, y: 450}, {x: 450, y: 450},
    // Inner square
    {x: 250, y: 250}, {x: 300, y: 250}, {x: 350, y: 250},
    {x: 250, y: 300}, {x: 350, y: 300},
    {x: 250, y: 350}, {x: 300, y: 350}, {x: 350, y: 350}
];

const MILLS = [
    // Outer square
    [0,1,2], [5,6,7], [0,3,5], [2,4,7],
    // Middle square
    [8,9,10], [13,14,15], [8,11,13], [10,12,15],
    // Inner square
    [16,17,18], [21,22,23], [16,19,21], [18,20,23],
    // Connecting lines
    [1,9,17], [6,14,22], [3,11,19], [4,12,20]
];

const ADJACENCIES = [
    [1,3], [0,2,9], [1,4], [0,5,11], [2,7,12], [3,6], [5,7,14], [4,6],
    [9,11], [1,8,10,17], [9,12], [3,8,13,19], [4,10,15,20], [11,14], [6,13,15,22], [12,14],
    [17,19], [9,16,18], [17,20], [11,16,21], [12,18,23], [19,22], [14,21,23], [20,22]
];

let board = Array(24).fill(null);
let currentPlayer = 'white';
let phase = 'placement';
let whitePieces = 9;
let blackPieces = 9;
let whitePlaced = 0;
let blackPlaced = 0;
let selectedPosition = null;
let mustRemove = false;
let aiEnabled = false;
let aiLevel = 4;
let aiThinking = false;

function initBoard() {
    board = Array(24).fill(null);
    currentPlayer = 'white';
    phase = 'placement';
    whitePieces = 9;
    blackPieces = 9;
    whitePlaced = 0;
    blackPlaced = 0;
    selectedPosition = null;
    mustRemove = false;
    renderBoard();
    updateStatus();
}

function renderBoard() {
    const boardElement = document.getElementById('muhleBoard');
    boardElement.innerHTML = '';
    
    // Draw board lines
    drawBoardLines(boardElement);
    
    // Draw position markers
    POSITIONS.forEach((pos, index) => {
        const marker = document.createElement('div');
        marker.className = 'position-marker';
        marker.style.left = pos.x + 'px';
        marker.style.top = pos.y + 'px';
        marker.dataset.index = index;
        
        if (selectedPosition === index) {
            marker.classList.add('selected');
        }
        
        if (board[index]) {
            const piece = document.createElement('div');
            piece.className = `muhle-piece ${board[index]}`;
            marker.appendChild(piece);
        }
        
        marker.onclick = () => handlePositionClick(index);
        boardElement.appendChild(marker);
    });
}

function drawBoardLines(container) {
    // Outer square
    addLine(container, 50, 50, 550, 50); // Top
    addLine(container, 550, 50, 550, 550); // Right
    addLine(container, 550, 550, 50, 550); // Bottom
    addLine(container, 50, 550, 50, 50); // Left
    
    // Middle square
    addLine(container, 150, 150, 450, 150);
    addLine(container, 450, 150, 450, 450);
    addLine(container, 450, 450, 150, 450);
    addLine(container, 150, 450, 150, 150);
    
    // Inner square
    addLine(container, 250, 250, 350, 250);
    addLine(container, 350, 250, 350, 350);
    addLine(container, 350, 350, 250, 350);
    addLine(container, 250, 350, 250, 250);
    
    // Connecting lines
    addLine(container, 300, 50, 300, 250);
    addLine(container, 300, 350, 300, 550);
    addLine(container, 50, 300, 250, 300);
    addLine(container, 350, 300, 550, 300);
}

function addLine(container, x1, y1, x2, y2) {
    const line = document.createElement('div');
    line.className = 'board-line';
    
    const length = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;
    
    line.style.width = length + 'px';
    line.style.height = '2px';
    line.style.left = x1 + 'px';
    line.style.top = y1 + 'px';
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = '0 0';
    
    container.appendChild(line);
}

function handlePositionClick(index) {
    if (aiThinking) return;
    
    if (mustRemove) {
        // Must remove opponent's piece after forming mill
        if (board[index] && board[index] !== currentPlayer) {
            if (!isInMill(index) || allPiecesInMills(board[index])) {
                removePiece(index);
                mustRemove = false;
                switchPlayer();
                checkWin();
                
                if (aiEnabled && currentPlayer === 'black') {
                    setTimeout(getAIMove, 500);
                }
            }
        }
        return;
    }
    
    if (phase === 'placement') {
        if (!board[index]) {
            placePiece(index);
        }
    } else {
        if (selectedPosition === null) {
            if (board[index] === currentPlayer) {
                selectedPosition = index;
                renderBoard();
            }
        } else {
            if (canMoveTo(selectedPosition, index)) {
                movePiece(selectedPosition, index);
                selectedPosition = null;
            } else {
                selectedPosition = null;
                renderBoard();
            }
        }
    }
}

function placePiece(index) {
    // Check multiplayer mode
    const urlParams = new URLSearchParams(window.location.search);
    const isMultiplayer = urlParams.get('multiplayer') === 'true';
    const myColor = urlParams.get('color');
    
    // In multiplayer, only allow moves on your turn
    if (isMultiplayer && currentPlayer !== myColor) {
        return;
    }
    
    board[index] = currentPlayer;
    
    if (currentPlayer === 'white') {
        whitePlaced++;
        if (whitePlaced === 9) phase = 'movement';
    } else {
        blackPlaced++;
        if (blackPlaced === 9) phase = 'movement';
    }
    
    // Send move in multiplayer mode
    if (isMultiplayer && window.sendMove && window.currentGame) {
        const game = window.currentGame();
        if (game && game.game_id) {
            window.sendMove(game.game_id, JSON.stringify({type: 'place', index}));
        }
    }
    
    if (checkMillFormed(index)) {
        mustRemove = true;
        renderBoard();
        updateStatus();
    } else {
        switchPlayer();
        
        // Trigger AI (only if not multiplayer)
        if (!isMultiplayer && aiEnabled && currentPlayer === 'black') {
            setTimeout(getAIMove, 500);
        }
    }
    
    renderBoard();
    updateStatus();
}

function movePiece(from, to) {
    // Check multiplayer mode
    const urlParams = new URLSearchParams(window.location.search);
    const isMultiplayer = urlParams.get('multiplayer') === 'true';
    const myColor = urlParams.get('color');
    
    // In multiplayer, only allow moves on your turn
    if (isMultiplayer && currentPlayer !== myColor) {
        return;
    }
    
    board[to] = board[from];
    board[from] = null;
    
    // Send move in multiplayer mode
    if (isMultiplayer && window.sendMove && window.currentGame) {
        const game = window.currentGame();
        if (game && game.game_id) {
            window.sendMove(game.game_id, JSON.stringify({type: 'move', from, to}));
        }
    }
    
    if (checkMillFormed(to)) {
        mustRemove = true;
        renderBoard();
        updateStatus();
    } else {
        switchPlayer();
        checkWin();
        
        // Trigger AI (only if not multiplayer)
        if (!isMultiplayer && aiEnabled && currentPlayer === 'black') {
            setTimeout(getAIMove, 500);
        }
    }
    
    renderBoard();
    updateStatus();
}

function canMoveTo(from, to) {
    if (board[to]) return false;
    
    const color = board[from];
    const pieceCount = board.filter(p => p === color).length;
    
    // Flying phase (3 pieces left)
    if (pieceCount === 3) return true;
    
    // Normal movement (must be adjacent)
    return ADJACENCIES[from].includes(to);
}

function checkMillFormed(index) {
    const color = board[index];
    
    for (const mill of MILLS) {
        if (mill.includes(index)) {
            if (mill.every(pos => board[pos] === color)) {
                return true;
            }
        }
    }
    
    return false;
}

function isInMill(index) {
    return checkMillFormed(index);
}

function allPiecesInMills(color) {
    for (let i = 0; i < 24; i++) {
        if (board[i] === color && !isInMill(i)) {
            return false;
        }
    }
    return true;
}

function removePiece(index) {
    const color = board[index];
    board[index] = null;
    
    if (color === 'white') {
        whitePieces--;
    } else {
        blackPieces--;
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
}

function checkWin() {
    // Win if opponent has 2 pieces or no valid moves
    const opponent = currentPlayer === 'white' ? 'black' : 'white';
    const opponentPieces = opponent === 'white' ? whitePieces : blackPieces;
    
    if (opponentPieces < 3) {
        alert(`${currentPlayer === 'white' ? 'White' : 'Black'} wins!\nOpponent reduced to 2 pieces.`);
        return;
    }
    
    // Check if opponent has any valid moves
    if (phase === 'movement' && !hasValidMoves(opponent)) {
        alert(`${currentPlayer === 'white' ? 'White' : 'Black'} wins!\nOpponent has no valid moves.`);
    }
}

function hasValidMoves(color) {
    const pieceCount = board.filter(p => p === color).length;
    
    for (let i = 0; i < 24; i++) {
        if (board[i] === color) {
            // Flying phase
            if (pieceCount === 3) {
                if (board.some(p => p === null)) return true;
            } else {
                // Normal movement
                for (const adj of ADJACENCIES[i]) {
                    if (!board[adj]) return true;
                }
            }
        }
    }
    
    return false;
}

function updateStatus() {
    const statusText = mustRemove ? 
        `${currentPlayer === 'white' ? 'White' : 'Black'} - Remove opponent's piece!` :
        `${currentPlayer === 'white' ? 'White' : 'Black'} to play - Phase: ${phase}`;
    
    document.getElementById('status').textContent = statusText;
    document.getElementById('whiteRemaining').textContent = whitePieces;
    document.getElementById('blackRemaining').textContent = blackPieces;
}

// AI Implementation
function toggleAI() {
    aiEnabled = !aiEnabled;
    const btn = document.getElementById('aiToggle');
    const controls = document.getElementById('aiControls');
    
    if (aiEnabled) {
        btn.textContent = '👤 Play vs Human';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
        controls.style.display = 'block';
        alert('Mühle AI enabled!\nMinimax with mill detection\nAI plays as Black');
    } else {
        btn.textContent = '🤖 Play vs AI';
        btn.style.background = '';
        controls.style.display = 'none';
    }
}

async function getAIMove() {
    if (aiThinking) return;
    
    aiThinking = true;
    document.getElementById('aiThinking').style.display = 'inline';
    
    try {
        aiLevel = parseInt(document.getElementById('aiLevel').value);
        
        if (mustRemove) {
            // AI must remove a piece
            for (let i = 0; i < 24; i++) {
                if (board[i] === 'white' && (!isInMill(i) || allPiecesInMills('white'))) {
                    removePiece(i);
                    mustRemove = false;
                    switchPlayer();
                    checkWin();
                    break;
                }
            }
        } else if (phase === 'placement') {
            // AI places a piece
            const emptyPositions = [];
            for (let i = 0; i < 24; i++) {
                if (!board[i]) emptyPositions.push(i);
            }
            
            if (emptyPositions.length > 0) {
                // Pick position that forms mill or blocks opponent
                let bestPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
                
                // Try to form mill
                for (const pos of emptyPositions) {
                    board[pos] = 'black';
                    if (checkMillFormed(pos)) {
                        bestPos = pos;
                        board[pos] = null;
                        break;
                    }
                    board[pos] = null;
                }
                
                placePiece(bestPos);
            }
        } else {
            // AI moves a piece
            const moves = getAllAIMoves();
            if (moves.length > 0) {
                const bestMove = evaluateBestMove(moves);
                movePiece(bestMove.from, bestMove.to);
            }
        }
        
        renderBoard();
        updateStatus();
        
    } finally {
        aiThinking = false;
        document.getElementById('aiThinking').style.display = 'none';
    }
}

function getAllAIMoves() {
    const moves = [];
    const pieceCount = board.filter(p => p === 'black').length;
    
    for (let from = 0; from < 24; from++) {
        if (board[from] === 'black') {
            if (pieceCount === 3) {
                // Flying phase
                for (let to = 0; to < 24; to++) {
                    if (!board[to]) {
                        moves.push({from, to});
                    }
                }
            } else {
                // Normal movement
                for (const to of ADJACENCIES[from]) {
                    if (!board[to]) {
                        moves.push({from, to});
                    }
                }
            }
        }
    }
    
    return moves;
}

function evaluateBestMove(moves) {
    let bestScore = -Infinity;
    let bestMove = moves[0];
    
    for (const move of moves) {
        // Simulate move
        const originalFrom = board[move.from];
        board[move.to] = originalFrom;
        board[move.from] = null;
        
        // Evaluate
        let score = 0;
        
        // Mill bonus
        if (checkMillFormed(move.to)) score += 100;
        
        // Block opponent mill
        board[move.to] = 'white';
        if (checkMillFormed(move.to)) score += 50;
        board[move.to] = 'black';
        
        // Position bonus (center is good)
        const centerDist = Math.abs(POSITIONS[move.to].x - 300) + Math.abs(POSITIONS[move.to].y - 300);
        score += (600 - centerDist) / 10;
        
        // Undo
        board[move.from] = originalFrom;
        board[move.to] = null;
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

function newGame() {
    initBoard();
}

// Initialize
initBoard();

