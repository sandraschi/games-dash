// Ludo Game Implementation
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

const BOARD_SIZE = 52; // Total spaces around the board
const SAFE_SPACES = [0, 8, 13, 21, 26, 34, 39, 47]; // Safe spaces (star spaces)

function newGame() {
    gameActive = true;
    currentPlayer = 0;
    diceValue = 0;
    
    // Reset pieces
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
        
        // Check if player can move
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
    
    // Check if any piece can move
    for (const piece of playerPieces) {
        if (piece.finished) continue;
        
        if (piece.pos === -1) {
            // Can only come out with a 6
            if (diceValue === 6) return true;
        } else {
            // Can move if not past finish
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
    
    // Coming out of home
    if (piece.pos === -1) {
        if (diceValue === 6) {
            piece.pos = getStartPosition(color);
            updateStatus(`${color.toUpperCase()} piece enters the board!`);
        } else {
            updateStatus('Need a 6 to get out of home!');
            return;
        }
    } else {
        // Normal move
        piece.pos += diceValue;
        
        if (piece.pos >= BOARD_SIZE) {
            piece.finished = true;
            updateStatus(`${color.toUpperCase()} piece finished!`);
        }
        
        // Check for captures (if not on safe space)
        if (!SAFE_SPACES.includes(piece.pos % BOARD_SIZE)) {
            checkCaptures(color, piece.pos);
        }
    }
    
    renderBoard();
    
    // Check win
    if (checkWin(color)) {
        gameActive = false;
        updateStatus(`🎉 ${color.toUpperCase()} WINS!`);
        return;
    }
    
    // Bonus turn for rolling 6
    if (diceValue === 6) {
        diceValue = 0;
        updateStatus(`${color.toUpperCase()} rolled 6! Roll again!`);
    } else {
        nextTurn();
    }
}

function getStartPosition(color) {
    // Each color enters at their designated start position
    const starts = {red: 0, blue: 13, green: 26, yellow: 39};
    return starts[color];
}

function getStartIndex(color) {
    // Helper to mark start positions
    return {red: 0, blue: 13, green: 26, yellow: 39}[color];
}

function checkCaptures(color, position) {
    // Check if another player's piece is on this space
    Object.keys(pieces).forEach(otherColor => {
        if (otherColor === color) return;
        
        pieces[otherColor].forEach(piece => {
            if (piece.pos === position && !piece.finished) {
                piece.pos = -1; // Send home!
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
    
    // Simple AI: prioritize pieces close to finish
    let bestPiece = -1;
    let bestScore = -1000;
    
    playerPieces.forEach((piece, index) => {
        if (piece.finished) return;
        
        let score = 0;
        
        if (piece.pos === -1 && diceValue === 6) {
            score = 50; // Getting piece out is good
        } else if (piece.pos !== -1) {
            score = piece.pos; // Prioritize pieces further along
            
            // Bonus if this move finishes the piece
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
    
    // Draw board spaces (simplified cross pattern)
    const positions = generateBoardPositions();
    
    positions.forEach((pos, index) => {
        const space = document.createElement('div');
        space.className = 'board-space';
        if (SAFE_SPACES.includes(index)) space.classList.add('safe');
        
        // Mark start positions
        if (index === 0 || index === 13 || index === 26 || index === 39) {
            space.classList.add('start');
        }
        
        space.style.left = pos.x + 'px';
        space.style.top = pos.y + 'px';
        space.dataset.position = index;
        board.appendChild(space);
    });
    
    // Draw home bases with slots
    players.forEach(color => {
        const home = document.createElement('div');
        home.className = `home-base ${color}`;
        
        // Add 4 slots for pieces
        for (let i = 0; i < 4; i++) {
            const slot = document.createElement('div');
            slot.className = 'home-slot';
            home.appendChild(slot);
        }
        
        board.appendChild(home);
    });
    
    // Draw pieces
    Object.keys(pieces).forEach(color => {
        pieces[color].forEach((piece, index) => {
            if (piece.finished) return;
            
            const pieceElement = document.createElement('div');
            pieceElement.className = `piece ${color}`;
            pieceElement.onclick = () => movePiece(index);
            
            if (piece.pos === -1) {
                // In home base - place in slot
                const homeBase = board.querySelector(`.home-base.${color}`);
                if (homeBase) {
                    const slots = homeBase.querySelectorAll('.home-slot');
                    const emptySlot = Array.from(slots).find(slot => !slot.hasChildNodes());
                    if (emptySlot) {
                        pieceElement.style.position = 'relative';
                        emptySlot.appendChild(pieceElement);
                    }
                }
            } else {
                // On board
                const pos = positions[piece.pos % BOARD_SIZE];
                pieceElement.style.position = 'absolute';
                pieceElement.style.left = (pos.x + 5) + 'px';
                pieceElement.style.top = (pos.y + 5) + 'px';
                board.appendChild(pieceElement);
            }
        });
    });
}

function generateBoardPositions() {
    // Proper Ludo cross-shaped board with 52 positions
    const positions = [];
    const centerX = 350;
    const centerY = 350;
    const spacing = 42;
    
    // RED path (starts bottom-left, goes up then right)
    // Position 0 - RED START
    for (let i = 0; i < 5; i++) positions.push({x: centerX - spacing * 2, y: centerY + spacing * (2 - i)}); // Up left column
    positions.push({x: centerX - spacing * 2, y: centerY - spacing * 3}); // Corner
    
    // Continue to top
    for (let i = 0; i < 5; i++) positions.push({x: centerX - spacing * (1 - i), y: centerY - spacing * 3}); // Across top
    
    // Turn right, BLUE START (position 13)
    positions.push({x: centerX + spacing * 3, y: centerY - spacing * 3}); // Blue start position
    
    // BLUE path (goes down right column)
    for (let i = 0; i < 5; i++) positions.push({x: centerX + spacing * 3, y: centerY - spacing * (2 - i)}); // Down right column
    positions.push({x: centerX + spacing * 3, y: centerY + spacing * 3}); // Corner
    
    // Continue across bottom
    for (let i = 0; i < 5; i++) positions.push({x: centerX + spacing * (2 - i), y: centerY + spacing * 3}); // Across bottom
    
    // Turn left, GREEN START (position 26)
    positions.push({x: centerX - spacing * 3, y: centerY + spacing * 3}); // Green start position
    
    // GREEN path (goes up left column)
    for (let i = 0; i < 5; i++) positions.push({x: centerX - spacing * 3, y: centerY + spacing * (2 - i)}); // Up left
    positions.push({x: centerX - spacing * 3, y: centerY - spacing * 3}); // Corner
    
    // Continue across top
    for (let i = 0; i < 5; i++) positions.push({x: centerX - spacing * (2 - i), y: centerY - spacing * 3}); // Across top
    
    // Turn down, YELLOW START (position 39)
    positions.push({x: centerX + spacing * 3, y: centerY - spacing * 3}); // Yellow start position
    
    // YELLOW path (goes down then left)
    for (let i = 0; i < 5; i++) positions.push({x: centerX + spacing * 3, y: centerY - spacing * (2 - i)}); // Down
    positions.push({x: centerX + spacing * 3, y: centerY + spacing * 3}); // Corner
    
    // Continue to complete circle
    for (let i = 0; i < 6; i++) positions.push({x: centerX + spacing * (2 - i), y: centerY + spacing * 3}); // Back to red
    
    // Pad to 52 if needed
    while (positions.length < 52) {
        positions.push({x: centerX, y: centerY});
    }
    
    return positions;
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

