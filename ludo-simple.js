// Ludo - Simple HTML/CSS/JS Version
// **Timestamp**: 2025-12-04

let players = ['yellow', 'green', 'red', 'blue'];
let currentPlayer = 0;
let diceValue = 0;
let gameActive = false;
let aiEnabled = true;

// Pieces: pos = -1 (home), 0-51 (main path), 100 (finished)
let pieces = {
    yellow: [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}],
    green: [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}],
    red: [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}],
    blue: [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}]
};

function initBoard() {
    const board = document.getElementById('ludoBoard');
    board.innerHTML = '';

    // Create 15x15 grid
    const grid = [];
    for (let row = 0; row < 15; row++) {
        grid[row] = [];
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            grid[row][col] = cell;
        }
    }

    // Add home bases
    const yellowHome = createHomeBase('yellow');
    grid[0][0].replaceWith(yellowHome);
    
    const greenHome = createHomeBase('green');
    grid[0][9].replaceWith(greenHome);
    
    const blueHome = createHomeBase('blue');
    grid[9][0].replaceWith(blueHome);
    
    const redHome = createHomeBase('red');
    grid[9][9].replaceWith(redHome);

    // Mark path cells
    const pathPositions = getPathPositions();
    pathPositions.forEach((pos, index) => {
        const [row, col] = pos;
        if (grid[row] && grid[row][col]) {
            grid[row][col].classList.add('path-cell');
            grid[row][col].dataset.pathIndex = index;
            
            // Mark start and safe squares
            if ([0, 13, 26, 39].includes(index)) {
                grid[row][col].classList.add('start');
            }
            if ([8, 21, 34, 47].includes(index)) {
                grid[row][col].classList.add('safe');
            }
        }
    });

    // Add center HOME
    const centerHome = document.createElement('div');
    centerHome.className = 'center-home';
    centerHome.textContent = 'HOME';
    grid[6][6].replaceWith(centerHome);

    // Append all cells to board
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            board.appendChild(grid[row][col]);
        }
    }

    newGame();
}

function createHomeBase(color) {
    const homeBase = document.createElement('div');
    homeBase.className = `home-base ${color}`;
    
    const homeInner = document.createElement('div');
    homeInner.className = 'home-inner';
    
    // Create 4 piece slots (2x2)
    for (let i = 0; i < 4; i++) {
        const slot = document.createElement('div');
        slot.className = 'piece-slot';
        slot.id = `${color}-slot-${i}`;
        homeInner.appendChild(slot);
    }
    
    homeBase.appendChild(homeInner);
    return homeBase;
}

function getPathPositions() {
    // Returns [row, col] for each of 52 path squares
    const path = [];
    
    // Yellow path (starts row 7, goes right)
    for (let col = 6; col < 9; col++) path.push([6, col]);  // 0-2
    for (let col = 9; col < 15; col++) path.push([6, col]); // 3-8
    path.push([7, 14]); // 9
    path.push([8, 14]); // 10
    
    // Turn down to Green
    path.push([9, 14]); // 11
    path.push([9, 13]); // 12
    
    // Green path (starts col 8, goes down)
    path.push([9, 8]); // 13 - GREEN START
    for (let row = 10; row < 15; row++) path.push([row, 8]); // 14-18
    path.push([14, 7]); // 19
    path.push([14, 6]); // 20
    
    // Turn left to Red
    path.push([14, 5]); // 21
    path.push([13, 5]); // 22
    path.push([12, 5]); // 23
    path.push([11, 5]); // 24
    path.push([10, 5]); // 25
    
    // Red path (starts row 8, goes left)
    path.push([8, 9]); // 26 - RED START
    for (let col = 8; col >= 6; col--) path.push([8, col]); // 27-29
    for (let col = 5; col >= 0; col--) path.push([8, col]); // 30-35
    path.push([7, 0]); // 36
    path.push([6, 0]); // 37
    
    // Turn up to Blue
    path.push([5, 0]); // 38
    
    // Blue path (starts col 7, goes up)
    path.push([5, 6]); // 39 - BLUE START
    for (let row = 4; row >= 0; row--) path.push([row, 6]); // 40-44
    path.push([0, 7]); // 45
    path.push([0, 8]); // 46
    
    // Complete loop
    path.push([0, 9]); // 47
    path.push([1, 9]); // 48
    path.push([2, 9]); // 49
    path.push([3, 9]); // 50
    path.push([4, 9]); // 51
    
    return path;
}

function newGame() {
    gameActive = true;
    currentPlayer = 0;
    diceValue = 0;

    // Reset pieces
    Object.keys(pieces).forEach(color => {
        pieces[color] = [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}];
    });

    // Draw pieces in home
    drawAllPieces();
    renderPlayerInfo();
    updateStatus(`${players[currentPlayer].toUpperCase()}'s turn - Roll the dice!`);
}

function drawAllPieces() {
    // Clear all pieces from board
    document.querySelectorAll('.piece').forEach(p => p.remove());
    
    // Draw each piece
    Object.keys(pieces).forEach(color => {
        pieces[color].forEach((piece, index) => {
            drawPiece(color, index);
        });
    });
}

function drawPiece(color, index) {
    const piece = pieces[color][index];
    const pieceElement = document.createElement('div');
    pieceElement.className = `piece ${color}`;
    pieceElement.dataset.color = color;
    pieceElement.dataset.index = index;
    
    pieceElement.onclick = () => {
        if (gameActive && players[currentPlayer] === color && diceValue > 0) {
            movePiece(color, index);
        }
    };
    
    if (piece.pos === -1) {
        // In home
        const slot = document.getElementById(`${color}-slot-${index}`);
        slot.innerHTML = '';
        slot.appendChild(pieceElement);
    } else if (piece.pos >= 0 && piece.pos < 52) {
        // On path
        const pathPositions = getPathPositions();
        const [row, col] = pathPositions[piece.pos];
        const cell = document.querySelector(`.path-cell[data-path-index="${piece.pos}"]`);
        if (cell) {
            cell.appendChild(pieceElement);
        }
    } else if (piece.pos === 100) {
        // Finished - in center
        const center = document.querySelector('.center-home');
        if (center) {
            center.appendChild(pieceElement);
        }
    }
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    document.getElementById('aiToggle').textContent = aiEnabled ? '🤖 2-4 Players (AI)' : '👤 Play vs AI OFF';
}

function rollDice() {
    if (!gameActive || diceValue !== 0) return;

    const dice = document.getElementById('dice');
    dice.classList.add('rolling');

    setTimeout(() => {
        diceValue = Math.floor(Math.random() * 6) + 1;
        dice.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceValue - 1];
        dice.classList.remove('rolling');

        updateStatus(`${players[currentPlayer].toUpperCase()} rolled ${diceValue}! Click a piece to move.`);

        if (aiEnabled && currentPlayer > 0) {
            setTimeout(aiMove, 1000);
        }
    }, 500);
}

function aiMove() {
    const color = players[currentPlayer];
    const validPieces = pieces[color]
        .map((p, i) => ({piece: p, index: i}))
        .filter(({piece}) => {
            if (piece.pos === 100) return false;
            if (piece.pos === -1) return diceValue === 6;
            return piece.pos + diceValue <= 51;
        });

    if (validPieces.length > 0) {
        const choice = validPieces[Math.floor(Math.random() * validPieces.length)];
        setTimeout(() => movePiece(color, choice.index), 500);
    } else {
        nextTurn();
    }
}

function movePiece(color, index) {
    if (!gameActive || diceValue === 0) return;

    const piece = pieces[color][index];

    if (piece.pos === 100) return;

    if (piece.pos === -1) {
        if (diceValue === 6) {
            piece.pos = getStartPos(color);
        } else {
            return;
        }
    } else {
        piece.pos += diceValue;
        if (piece.pos > 51) {
            piece.pos = 100;
        }
    }

    drawAllPieces();

    // Check win
    if (pieces[color].every(p => p.pos === 100)) {
        gameActive = false;
        updateStatus(`🎉 ${color.toUpperCase()} WINS!`);
        return;
    }

    // Handle turn
    if (diceValue === 6) {
        diceValue = 0;
        updateStatus(`${color.toUpperCase()} rolled 6! Go again!`);
    } else {
        nextTurn();
    }
}

function getStartPos(color) {
    return {yellow: 0, green: 13, red: 26, blue: 39}[color];
}

function nextTurn() {
    diceValue = 0;
    currentPlayer = (currentPlayer + 1) % 4;
    renderPlayerInfo();
    updateStatus(`${players[currentPlayer].toUpperCase()}'s turn!`);

    if (aiEnabled && currentPlayer > 0) {
        setTimeout(rollDice, 1000);
    }
}

function renderPlayerInfo() {
    const infoDiv = document.getElementById('playerInfo');
    infoDiv.innerHTML = '';

    players.forEach((color, index) => {
        const box = document.createElement('div');
        box.className = `player-box ${color}`;
        if (index === currentPlayer) box.classList.add('active');

        const finished = pieces[color].filter(p => p.pos === 100).length;
        const onBoard = pieces[color].filter(p => p.pos >= 0 && p.pos < 100).length;

        box.innerHTML = `
            <h3 style="margin: 0;">${color.toUpperCase()} ${index === 0 ? '(You)' : '(AI)'}</h3>
            <p style="margin: 5px 0;">Home: ${4 - onBoard - finished}</p>
            <p style="margin: 5px 0;">On Board: ${onBoard}</p>
            <p style="margin: 5px 0; color: #4CAF50;">Finished: ${finished}/4</p>
        `;

        infoDiv.appendChild(box);
    });
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initBoard);
