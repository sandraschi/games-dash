// Snakes and Ladders Game Implementation
// **Timestamp**: 2025-12-04

let playerPos = 0;
let aiPos = 0;
let currentPlayer = 'player';
let aiEnabled = false;
let gameActive = false;

// Snakes (head -> tail)
const SNAKES = {
    98: 28, 95: 24, 92: 51, 83: 19, 73: 1, 69: 33, 64: 36, 59: 17, 54: 31, 52: 29, 48: 9, 46: 5, 44: 22
};

// Ladders (bottom -> top)
const LADDERS = {
    4: 56, 12: 50, 14: 55, 22: 58, 41: 79, 54: 88, 63: 80, 70: 90, 80: 99
};

function newGame() {
    playerPos = 0;
    aiPos = 0;
    currentPlayer = 'player';
    gameActive = true;
    
    renderBoard();
    updateStatus('Your turn! Roll the dice!');
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    const btn = document.getElementById('aiToggle');
    const aiBox = document.getElementById('aiBox');
    
    if (aiEnabled) {
        btn.textContent = '👤 Play Alone';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
        aiBox.style.display = 'block';
    } else {
        btn.textContent = '🤖 Play vs AI';
        btn.style.background = '';
        aiBox.style.display = 'none';
    }
    
    newGame();
}

function rollDice() {
    if (!gameActive) {
        newGame();
        return;
    }
    
    if (currentPlayer !== 'player') return;
    
    const dice = document.getElementById('dice');
    dice.classList.add('rolling');
    
    setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        dice.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][roll - 1];
        dice.classList.remove('rolling');
        
        movePlayer(roll);
    }, 600);
}

function movePlayer(roll) {
    const isPlayer = currentPlayer === 'player';
    const currentPos = isPlayer ? playerPos : aiPos;
    let newPos = currentPos + roll;
    
    // Can't go past 100
    if (newPos > 100) {
        updateStatus(`Rolled ${roll} - too high! Need exact number to reach 100.`);
        nextTurn();
        return;
    }
    
    updateStatus(`${isPlayer ? 'You' : 'AI'} rolled ${roll}!`);
    
    // Animate movement
    animateMovement(currentPos, newPos, isPlayer);
}

function animateMovement(from, to, isPlayer) {
    let current = from;
    
    const moveInterval = setInterval(() => {
        current++;
        
        if (isPlayer) {
            playerPos = current;
        } else {
            aiPos = current;
        }
        
        renderBoard();
        
        if (current === to) {
            clearInterval(moveInterval);
            
            // Check for snake or ladder
            setTimeout(() => {
                checkSnakesAndLadders(isPlayer);
            }, 500);
        }
    }, 200);
}

function checkSnakesAndLadders(isPlayer) {
    const pos = isPlayer ? playerPos : aiPos;
    
    if (SNAKES[pos]) {
        // Hit a snake!
        const newPos = SNAKES[pos];
        updateStatus(`${isPlayer ? 'You' : 'AI'} hit a SNAKE! 🐍 Sliding down to ${newPos}!`);
        
        setTimeout(() => {
            if (isPlayer) {
                playerPos = newPos;
            } else {
                aiPos = newPos;
            }
            renderBoard();
            checkWin(isPlayer);
        }, 1000);
    } else if (LADDERS[pos]) {
        // Hit a ladder!
        const newPos = LADDERS[pos];
        updateStatus(`${isPlayer ? 'You' : 'AI'} found a LADDER! 🪜 Climbing up to ${newPos}!`);
        
        setTimeout(() => {
            if (isPlayer) {
                playerPos = newPos;
            } else {
                aiPos = newPos;
            }
            renderBoard();
            checkWin(isPlayer);
        }, 1000);
    } else {
        checkWin(isPlayer);
    }
}

function checkWin(isPlayer) {
    const pos = isPlayer ? playerPos : aiPos;
    
    if (pos === 100) {
        gameActive = false;
        updateStatus(`🎉 ${isPlayer ? 'YOU WIN' : 'AI WINS'}! Reached square 100!`);
        return;
    }
    
    nextTurn();
}

function nextTurn() {
    if (!aiEnabled) {
        currentPlayer = 'player';
        updateStatus('Your turn! Roll again!');
        return;
    }
    
    currentPlayer = currentPlayer === 'player' ? 'ai' : 'player';
    
    document.getElementById('playerBox').classList.toggle('active', currentPlayer === 'player');
    document.getElementById('aiBox').classList.toggle('active', currentPlayer === 'ai');
    
    if (currentPlayer === 'player') {
        updateStatus('Your turn! Roll the dice!');
    } else {
        updateStatus('AI is rolling...');
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            document.getElementById('dice').textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][roll - 1];
            movePlayer(roll);
        }, 1500);
    }
}

function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    // Create 100 squares in reverse (100 at top-left, 1 at bottom-left)
    for (let row = 9; row >= 0; row--) {
        for (let col = 0; col < 10; col++) {
            // Snake pattern: odd rows go left-to-right, even rows go right-to-left
            const actualCol = row % 2 === 0 ? col : 9 - col;
            const cellNumber = row * 10 + actualCol + 1;
            
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.dataset.number = cellNumber;
            
            // Mark snakes and ladders
            if (SNAKES[cellNumber]) {
                cell.classList.add('snake-head');
                cell.innerHTML = `<div class="cell-number">${cellNumber}</div><div class="snake-emoji">🐍</div><div style="font-size: 10px;">→${SNAKES[cellNumber]}</div>`;
            } else if (LADDERS[cellNumber]) {
                cell.classList.add('ladder-bottom');
                cell.innerHTML = `<div class="cell-number">${cellNumber}</div><div class="ladder-emoji">🪜</div><div style="font-size: 10px;">→${LADDERS[cellNumber]}</div>`;
            } else {
                cell.innerHTML = `<div class="cell-number">${cellNumber}</div>`;
            }
            
            // Add player pieces
            if (playerPos === cellNumber) {
                const piece = document.createElement('div');
                piece.className = 'player-piece player';
                cell.appendChild(piece);
            }
            
            if (aiEnabled && aiPos === cellNumber) {
                const piece = document.createElement('div');
                piece.className = 'player-piece ai';
                cell.appendChild(piece);
            }
            
            board.appendChild(cell);
        }
    }
    
    document.getElementById('playerPos').textContent = playerPos;
    if (aiEnabled) {
        document.getElementById('aiPos').textContent = aiPos;
    }
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize
renderBoard();

