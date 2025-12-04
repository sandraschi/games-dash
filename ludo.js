// Ludo - Working Canvas Version!
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('ludoCanvas');
const ctx = canvas.getContext('2d');

let players = ['red', 'blue', 'green', 'yellow'];
let currentPlayer = 0;
let diceValue = 0;
let gameActive = false;
let aiEnabled = true;

// Pieces: pos = -1 (home), 0-51 (path), 52-56 (home column), 57 (finished)
let pieces = {
    red: [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}],
    blue: [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}],
    green: [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}],
    yellow: [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}]
};

function newGame() {
    gameActive = true;
    currentPlayer = 0;
    diceValue = 0;
    
    Object.keys(pieces).forEach(color => {
        pieces[color] = [{pos: -1}, {pos: -1}, {pos: -1}, {pos: -1}];
    });
    
    draw();
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
        
        updateStatus(`Rolled ${diceValue}! Click a piece to move.`);
        
        if (aiEnabled && currentPlayer > 0) {
            setTimeout(aiMove, 1000);
        }
    }, 500);
}

function aiMove() {
    const color = players[currentPlayer];
    const validPieces = pieces[color].map((p, i) => ({piece: p, index: i}))
        .filter(({piece}) => {
            if (piece.pos === 57) return false;
            if (piece.pos === -1) return diceValue === 6;
            return piece.pos + diceValue <= 57;
        });
    
    if (validPieces.length > 0) {
        const choice = validPieces[Math.floor(Math.random() * validPieces.length)];
        setTimeout(() => movePiece(choice.index), 500);
    } else {
        nextTurn();
    }
}

function movePiece(index) {
    if (!gameActive || diceValue === 0) return;
    
    const color = players[currentPlayer];
    const piece = pieces[color][index];
    
    if (piece.pos === 57) return; // Already finished
    
    if (piece.pos === -1) {
        if (diceValue === 6) {
            piece.pos = getStartPos(color);
        } else {
            return;
        }
    } else {
        piece.pos += diceValue;
        if (piece.pos > 57) piece.pos = 57; // Cap at finish
    }
    
    draw();
    
    if (pieces[color].every(p => p.pos === 57)) {
        gameActive = false;
        updateStatus(`🎉 ${color.toUpperCase()} WINS!`);
        return;
    }
    
    if (diceValue === 6) {
        diceValue = 0;
        updateStatus(`${color.toUpperCase()} rolled 6! Go again!`);
    } else {
        nextTurn();
    }
}

function getStartPos(color) {
    return {red: 0, blue: 13, green: 26, yellow: 39}[color];
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

function draw() {
    ctx.clearRect(0, 0, 700, 700);
    
    // Draw home bases (SMALL, ROUNDED, in corners)
    drawHome(40, 40, 'green', 'GREEN');
    drawHome(540, 40, 'yellow', 'YELLOW');
    drawHome(40, 540, 'red', 'RED');
    drawHome(540, 540, 'blue', 'BLUE');
    
    // Draw cross path
    drawPath();
    
    // Draw center
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(350, 350, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', 350, 350);
    
    // Draw pieces
    drawAllPieces();
}

function drawHome(x, y, color, label) {
    const colors = {
        green: '#95E1D3',
        yellow: '#FFD93D',
        red: '#FF6B6B',
        blue: '#4ECDC4'
    };
    
    ctx.fillStyle = colors[color];
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    roundRect(ctx, x, y, 120, 120, 15);
    ctx.fill();
    ctx.stroke();
    
    // Piece slots (2x2)
    const slotPositions = [
        {x: x + 20, y: y + 20},
        {x: x + 70, y: y + 20},
        {x: x + 20, y: y + 70},
        {x: x + 70, y: y + 70}
    ];
    
    slotPositions.forEach((slot, i) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, 18, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw piece if in home
        const homePieces = pieces[color.toLowerCase()].filter(p => p.pos === -1);
        if (homePieces[i]) {
            drawPiece(slot.x, slot.y, color.toLowerCase());
        }
    });
}

function drawPath() {
    const pathSquares = generatePathSquares();
    
    pathSquares.forEach((square, index) => {
        ctx.fillStyle = index === 0 || index === 13 || index === 26 || index === 39 ? 
            '#FFD700' : 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        roundRect(ctx, square.x - 18, square.y - 18, 36, 36, 5);
        ctx.fill();
        ctx.stroke();
    });
}

function generatePathSquares() {
    // 52 squares in classic Ludo cross pattern
    const squares = [];
    const c = 350; // Center
    const s = 42; // Spacing
    
    // Bottom row (RED path)
    for (let i = 0; i < 6; i++) squares.push({x: c - s * 2 + i * s, y: c + s * 2});
    for (let i = 0; i < 7; i++) squares.push({x: c + s + i * s, y: c + s * 2});
    
    // Right column (BLUE path)
    for (let i = 0; i < 6; i++) squares.push({x: c + s * 3, y: c + s * 2 - (i + 1) * s});
    for (let i = 0; i < 7; i++) squares.push({x: c + s * 3, y: c - s - i * s});
    
    // Top row (GREEN path)
    for (let i = 0; i < 6; i++) squares.push({x: c + s * 3 - (i + 1) * s, y: c - s * 3});
    for (let i = 0; i < 7; i++) squares.push({x: c - s * 2 - i * s, y: c - s * 3});
    
    // Left column (YELLOW path)
    for (let i = 0; i < 6; i++) squares.push({x: c - s * 3, y: c - s * 3 + (i + 1) * s});
    for (let i = 0; i < 6; i++) squares.push({x: c - s * 3, y: c + s + i * s});
    
    return squares.slice(0, 52);
}

function drawAllPieces() {
    const pathSquares = generatePathSquares();
    
    Object.keys(pieces).forEach(color => {
        pieces[color].forEach(piece => {
            if (piece.pos >= 0 && piece.pos < 52) {
                const square = pathSquares[piece.pos];
                drawPiece(square.x, square.y, color);
            } else if (piece.pos === 57) {
                // Finished - show at center
                drawPiece(350, 350, color);
            }
        });
    });
}

function drawPiece(x, y, color) {
    const colors = {
        red: '#FF0000',
        blue: '#0000FF',
        green: '#00FF00',
        yellow: '#FFFF00'
    };
    
    ctx.fillStyle = colors[color];
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function renderPlayerInfo() {
    const infoDiv = document.getElementById('playerInfo');
    infoDiv.innerHTML = '';
    
    players.forEach((color, index) => {
        const box = document.createElement('div');
        box.className = `player-box ${color}`;
        if (index === currentPlayer) box.classList.add('active');
        
        const finished = pieces[color].filter(p => p.pos === 57).length;
        const onBoard = pieces[color].filter(p => p.pos >= 0 && p.pos < 57).length;
        
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

// Canvas click to select pieces
canvas.addEventListener('click', (e) => {
    if (!gameActive || diceValue === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Check home pieces first
    const color = players[currentPlayer];
    const homePos = getHomeBasePos(color);
    const slotPositions = [
        {x: homePos.x + 20, y: homePos.y + 20},
        {x: homePos.x + 70, y: homePos.y + 20},
        {x: homePos.x + 20, y: homePos.y + 70},
        {x: homePos.x + 70, y: homePos.y + 70}
    ];
    
    const homePieces = pieces[color].map((p, i) => ({p, i})).filter(({p}) => p.pos === -1);
    slotPositions.forEach((slot, i) => {
        if (homePieces[i]) {
            const dist = Math.sqrt((clickX - slot.x) ** 2 + (clickY - slot.y) ** 2);
            if (dist < 20) {
                movePiece(homePieces[i].i);
            }
        }
    });
});

function getHomeBasePos(color) {
    return {
        green: {x: 40, y: 40},
        yellow: {x: 540, y: 40},
        red: {x: 40, y: 540},
        blue: {x: 540, y: 540}
    }[color];
}

// Initialize
newGame();
