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

const BOARD_SIZE = 52; // Total spaces around the board (13 per arm x 4)
const SAFE_SPACES = [0, 8, 13, 21, 26, 34, 39, 47]; // Safe spaces (star spaces)
const HOME_COLUMN_SIZE = 5; // Each player has 5 squares leading to center

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
        
        // Mark start positions with color
        if (pos.isStart) {
            space.classList.add('start');
            space.style.background = `linear-gradient(135deg, ${getColorHex(pos.color)}, ${getColorHex(pos.color)}88)`;
        }
        
        space.style.left = pos.x + 'px';
        space.style.top = pos.y + 'px';
        space.dataset.position = index;
        board.appendChild(space);
    });
    
    // Add home columns (5 squares per color leading to center)
    const sq = 45;
    const homeColumns = {
        red: Array(5).fill(0).map((_, i) => ({x: centerX - sq, y: centerY + sq * (2 - i), color: 'red'})),
        blue: Array(5).fill(0).map((_, i) => ({x: centerX + sq * (2 - i), y: centerY - sq, color: 'blue'})),
        green: Array(5).fill(0).map((_, i) => ({x: centerX + sq, y: centerY - sq * (2 - i), color: 'green'})),
        yellow: Array(5).fill(0).map((_, i) => ({x: centerX - sq * (2 - i), y: centerY + sq, color: 'yellow'}))
    };
    
    Object.keys(homeColumns).forEach(color => {
        homeColumns[color].forEach((pos, i) => {
            const space = document.createElement('div');
            space.className = 'board-space home-stretch';
            space.style.left = pos.x + 'px';
            space.style.top = pos.y + 'px';
            space.style.background = `linear-gradient(135deg, ${getColorHex(color)}, ${getColorHex(color)}AA)`;
            space.dataset.homeColumn = color;
            space.dataset.homeIndex = i;
            board.appendChild(space);
        });
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
    // Proper Ludo board: 52 squares around perimeter + home columns
    const positions = [];
    const centerX = 350;
    const centerY = 350;
    const sq = 45; // Square size/spacing
    
    // Ludo board structure: 4 arms, each 13 squares, arranged as a cross
    // Each arm: 6 squares approach, 1 start square (marked), 6 squares exit
    
    // RED PATH (starts at position 0, bottom-left)
    // Red enters from bottom, goes up left side, across top, down right side
    positions.push({x: centerX - sq * 2, y: centerY + sq * 3, color: 'red', isStart: true}); // 0: RED START
    for (let i = 1; i < 6; i++) positions.push({x: centerX - sq * 2, y: centerY + sq * (3 - i)}); // 1-5: Up left column
    positions.push({x: centerX - sq * 2, y: centerY - sq * 2}); // 6: Left turn point
    for (let i = 1; i <= 5; i++) positions.push({x: centerX - sq * (2 - i), y: centerY - sq * 3}); // 7-11: Across top
    positions.push({x: centerX + sq * 2, y: centerY - sq * 3}); // 12: Top-right corner
    
    // BLUE PATH (position 13, top-right)
    positions.push({x: centerX + sq * 3, y: centerY - sq * 2, color: 'blue', isStart: true}); // 13: BLUE START
    for (let i = 1; i < 6; i++) positions.push({x: centerX + sq * 3, y: centerY - sq * (2 - i)}); // 14-18: Down right column
    positions.push({x: centerX + sq * 3, y: centerY + sq * 2}); // 19: Right turn point
    for (let i = 1; i <= 5; i++) positions.push({x: centerX + sq * (3 - i), y: centerY + sq * 3}); // 20-24: Across bottom
    positions.push({x: centerX - sq * 2, y: centerY + sq * 3}); // 25: Bottom-left corner
    
    // GREEN PATH (position 26, bottom-right)
    positions.push({x: centerX + sq * 2, y: centerY + sq * 3, color: 'green', isStart: true}); // 26: GREEN START
    for (let i = 1; i < 6; i++) positions.push({x: centerX + sq * 2, y: centerY + sq * (3 - i)}); // 27-31: Up right column
    positions.push({x: centerX + sq * 2, y: centerY - sq * 2}); // 32: Top turn point
    for (let i = 1; i <= 5; i++) positions.push({x: centerX + sq * (2 - i), y: centerY - sq * 3}); // 33-37: Across top
    positions.push({x: centerX - sq * 2, y: centerY - sq * 3}); // 38: Top-left corner
    
    // YELLOW PATH (position 39, top-left)
    positions.push({x: centerX - sq * 3, y: centerY - sq * 2, color: 'yellow', isStart: true}); // 39: YELLOW START
    for (let i = 1; i < 6; i++) positions.push({x: centerX - sq * 3, y: centerY - sq * (2 - i)}); // 40-44: Down left column
    positions.push({x: centerX - sq * 3, y: centerY + sq * 2}); // 45: Bottom turn point
    for (let i = 1; i <= 5; i++) positions.push({x: centerX - sq * (3 - i), y: centerY + sq * 3}); // 46-50: Across bottom
    positions.push({x: centerX - sq * 2, y: centerY + sq * 3}); // 51: Completes circuit back to red start
    
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

function getColorHex(color) {
    const colors = {
        red: '#FF0000',
        blue: '#0000FF',
        green: '#00FF00',
        yellow: '#FFFF00'
    };
    return colors[color] || '#FFFFFF';
}

// Initialize
newGame();

