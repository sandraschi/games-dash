// Ludo - Konva.js Version (Properly Integrated)
// **Timestamp**: 2025-12-04

// Game state
let stage, layer;
let players = ['yellow', 'green', 'red', 'blue'];
let currentPlayer = 0;
let diceValue = 0;
let gameActive = false;
let aiEnabled = true;

// Pieces: pos = -1 (home), 0-51 (main path), 100 (finished)
let pieces = {
    yellow: [{pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}],
    green: [{pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}],
    red: [{pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}],
    blue: [{pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}]
};

// Board configuration
const BOARD_SIZE = 750;
const CELL_SIZE = 50;
const COLORS = {
    yellow: '#FFEB3B',
    green: '#4CAF50',
    red: '#F44336',
    blue: '#2196F3',
    white: '#FFFFFF',
    beige: '#F5F5DC',
    gold: '#FFD700',
    safe: '#66BB6A'
};

// Path coordinates for 52 squares
let pathCoords = [];

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
    initBoard();
});

function initBoard() {
    // Create Konva stage
    stage = new Konva.Stage({
        container: 'container',
        width: BOARD_SIZE,
        height: BOARD_SIZE
    });

    // Create main layer
    layer = new Konva.Layer();
    stage.add(layer);

    // Generate path coordinates first
    pathCoords = generatePathCoordinates();

    // Draw the board
    drawBackground();
    drawHomeBases();
    drawMainPath();
    drawCenterHome();

    // Draw the layer to make it visible
    layer.draw();

    // Initialize game
    newGame();
}

function drawBackground() {
    const bg = new Konva.Rect({
        x: 0,
        y: 0,
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        fill: COLORS.beige
    });
    layer.add(bg);
}

function drawHomeBases() {
    // Yellow home (top-left: columns 0-5, rows 0-5)
    drawHomeBase(0, 0, 'yellow');
    
    // Green home (top-right: columns 9-14, rows 0-5)
    drawHomeBase(9 * CELL_SIZE, 0, 'green');
    
    // Blue home (bottom-left: columns 0-5, rows 9-14)
    drawHomeBase(0, 9 * CELL_SIZE, 'blue');
    
    // Red home (bottom-right: columns 9-14, rows 9-14)
    drawHomeBase(9 * CELL_SIZE, 9 * CELL_SIZE, 'red');
}

function drawHomeBase(x, y, color) {
    const homeSize = 6 * CELL_SIZE;
    
    // Outer colored square
    const outerSquare = new Konva.Rect({
        x: x,
        y: y,
        width: homeSize,
        height: homeSize,
        fill: COLORS[color],
        stroke: '#000',
        strokeWidth: 3
    });
    layer.add(outerSquare);

    // Inner white square (4x4 cells, centered with 1 cell margin)
    const innerSize = 4 * CELL_SIZE;
    const innerSquare = new Konva.Rect({
        x: x + CELL_SIZE,
        y: y + CELL_SIZE,
        width: innerSize,
        height: innerSize,
        fill: COLORS.white,
        stroke: '#000',
        strokeWidth: 2
    });
    layer.add(innerSquare);

    // Four circular slots (2x2 grid)
    const slotPositions = [
        {x: x + 1.5 * CELL_SIZE, y: y + 1.5 * CELL_SIZE}, // Top-left
        {x: x + 3.5 * CELL_SIZE, y: y + 1.5 * CELL_SIZE}, // Top-right
        {x: x + 1.5 * CELL_SIZE, y: y + 3.5 * CELL_SIZE}, // Bottom-left
        {x: x + 3.5 * CELL_SIZE, y: y + 3.5 * CELL_SIZE}  // Bottom-right
    ];

    slotPositions.forEach((pos, index) => {
        const slot = new Konva.Circle({
            x: pos.x,
            y: pos.y,
            radius: CELL_SIZE * 0.35,
            fill: COLORS[color],
            stroke: '#000',
            strokeWidth: 2
        });
        layer.add(slot);

        // Store home coordinates for piece placement
        pieces[color][index].homeX = pos.x;
        pieces[color][index].homeY = pos.y;
    });
}

function drawMainPath() {
    pathCoords.forEach((coord, index) => {
        const isStart = [0, 13, 26, 39].includes(index);
        const isSafe = [8, 21, 34, 47].includes(index);

        let fill = COLORS.white;
        if (isStart) fill = COLORS.gold;
        if (isSafe) fill = COLORS.safe;

        const square = new Konva.Rect({
            x: coord.x - CELL_SIZE / 2,
            y: coord.y - CELL_SIZE / 2,
            width: CELL_SIZE,
            height: CELL_SIZE,
            fill: fill,
            stroke: '#333',
            strokeWidth: 2,
            cornerRadius: 3
        });
        layer.add(square);

        // Add star emoji for safe squares
        if (isSafe) {
            const star = new Konva.Text({
                x: coord.x - 15,
                y: coord.y - 15,
                text: '⭐',
                fontSize: 30
            });
            layer.add(star);
        }

        // Add arrow for start squares
        if (isStart) {
            const arrows = {0: '→', 13: '↓', 26: '←', 39: '↑'};
            const arrow = new Konva.Text({
                x: coord.x - 15,
                y: coord.y - 15,
                text: arrows[index],
                fontSize: 30,
                fill: '#000',
                fontStyle: 'bold'
            });
            layer.add(arrow);
        }
    });
}

function generatePathCoordinates() {
    const coords = [];
    
    // Yellow section (positions 0-12): starts from right of yellow home, goes right then down
    // Row 6 (middle of the 3-row horizontal band)
    for (let col = 6; col < 9; col++) {
        coords.push({x: col * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2});
    }
    for (let col = 9; col < 15; col++) {
        coords.push({x: col * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2});
    }
    // Turn down (column 8)
    for (let row = 7; row < 9; row++) {
        coords.push({x: 8 * CELL_SIZE + CELL_SIZE / 2, y: row * CELL_SIZE + CELL_SIZE / 2});
    }

    // Green section (positions 13-25): starts below green home, goes down then left
    // Column 8 (middle of the 3-column vertical band)
    for (let row = 9; row < 15; row++) {
        coords.push({x: 8 * CELL_SIZE + CELL_SIZE / 2, y: row * CELL_SIZE + CELL_SIZE / 2});
    }
    // Turn left (row 8)
    for (let col = 7; col >= 6; col--) {
        coords.push({x: col * CELL_SIZE + CELL_SIZE / 2, y: 8 * CELL_SIZE + CELL_SIZE / 2});
    }
    for (let col = 5; col >= 0; col--) {
        coords.push({x: col * CELL_SIZE + CELL_SIZE / 2, y: 8 * CELL_SIZE + CELL_SIZE / 2});
    }

    // Red section (positions 26-38): starts left of red home, goes left then up
    // Row 8
    // (Already covered by green's turn, so continue from column 8 going down)
    for (let row = 9; row >= 7; row--) {
        coords.push({x: 6 * CELL_SIZE + CELL_SIZE / 2, y: row * CELL_SIZE + CELL_SIZE / 2});
    }
    
    // Blue section (positions 39-51): starts above blue home, goes up then right
    // Column 6
    for (let row = 6; row >= 0; row--) {
        coords.push({x: 6 * CELL_SIZE + CELL_SIZE / 2, y: row * CELL_SIZE + CELL_SIZE / 2});
    }
    // Turn right (row 6)
    for (let col = 7; col < 15; col++) {
        coords.push({x: col * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2});
    }

    return coords;
}

function drawCenterHome() {
    const cx = 7.5 * CELL_SIZE; // Center between columns 7 and 8
    const cy = 7.5 * CELL_SIZE; // Center between rows 7 and 8
    const size = 1.5 * CELL_SIZE;

    // Green triangle (top)
    const greenTri = new Konva.Line({
        points: [cx, cy - size, cx - size, cy, cx + size, cy],
        fill: COLORS.green,
        stroke: '#000',
        strokeWidth: 2,
        closed: true
    });
    layer.add(greenTri);

    // Red triangle (right)
    const redTri = new Konva.Line({
        points: [cx + size, cy, cx, cy - size, cx, cy + size],
        fill: COLORS.red,
        stroke: '#000',
        strokeWidth: 2,
        closed: true
    });
    layer.add(redTri);

    // Blue triangle (bottom)
    const blueTri = new Konva.Line({
        points: [cx, cy + size, cx + size, cy, cx - size, cy],
        fill: COLORS.blue,
        stroke: '#000',
        strokeWidth: 2,
        closed: true
    });
    layer.add(blueTri);

    // Yellow triangle (left)
    const yellowTri = new Konva.Line({
        points: [cx - size, cy, cx, cy + size, cx, cy - size],
        fill: COLORS.yellow,
        stroke: '#000',
        strokeWidth: 2,
        closed: true
    });
    layer.add(yellowTri);

    // HOME text
    const homeText = new Konva.Text({
        x: cx - 35,
        y: cy - 12,
        text: 'HOME',
        fontSize: 24,
        fontStyle: 'bold',
        fill: '#FFF',
        stroke: '#000',
        strokeWidth: 1
    });
    layer.add(homeText);
}

function newGame() {
    gameActive = true;
    currentPlayer = 0;
    diceValue = 0;

    // Reset pieces
    Object.keys(pieces).forEach(color => {
        pieces[color].forEach(piece => {
            piece.pos = -1;
            if (piece.circle) {
                piece.circle.destroy();
                piece.circle = null;
            }
        });
    });

    // Draw all pieces in home positions
    Object.keys(pieces).forEach(color => {
        pieces[color].forEach((piece, index) => {
            drawPiece(color, index);
        });
    });

    layer.draw();
    renderPlayerInfo();
    updateStatus(`${players[currentPlayer].toUpperCase()}'s turn - Roll the dice!`);
}

function drawPiece(color, index) {
    const piece = pieces[color][index];
    
    // Remove old circle if exists
    if (piece.circle) {
        piece.circle.destroy();
    }

    let x, y;
    
    if (piece.pos === -1) {
        // In home
        x = piece.homeX;
        y = piece.homeY;
    } else if (piece.pos >= 0 && piece.pos < 52) {
        // On main path
        const coord = pathCoords[piece.pos];
        x = coord.x;
        y = coord.y;
    } else if (piece.pos === 100) {
        // Finished - in center
        x = 7.5 * CELL_SIZE;
        y = 7.5 * CELL_SIZE;
    }

    const circle = new Konva.Circle({
        x: x,
        y: y,
        radius: 18,
        fill: COLORS[color],
        stroke: '#000',
        strokeWidth: 3,
        shadowColor: '#000',
        shadowBlur: 5,
        shadowOpacity: 0.5
    });

    // Add click handler
    circle.on('click', function() {
        if (gameActive && players[currentPlayer] === color && diceValue > 0) {
            movePiece(color, index);
        }
    });

    // Add hover effects
    circle.on('mouseenter', function() {
        if (gameActive && players[currentPlayer] === color && diceValue > 0) {
            circle.scale({x: 1.3, y: 1.3});
            document.body.style.cursor = 'pointer';
            layer.draw();
        }
    });

    circle.on('mouseleave', function() {
        circle.scale({x: 1, y: 1});
        document.body.style.cursor = 'default';
        layer.draw();
    });

    layer.add(circle);
    piece.circle = circle;
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

    // Redraw the piece at new position
    drawPiece(color, index);
    layer.draw();

    // Check win condition
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
