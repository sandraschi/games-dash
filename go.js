// Go (囲碁) Game Implementation with KataGo AI
// **Timestamp**: 2025-12-03

const BOARD_SIZE = 19;
const CELL_SIZE = 30;

let board = [];
let currentPlayer = 'black';
let moveHistory = [];
let capturedBlack = 0;
let capturedWhite = 0;
let passCount = 0;
let gameRunning = false;
let aiEnabled = false;
let katagoConnected = false;
let aiThinking = false;

// Initialize board
function initBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    currentPlayer = 'black';
    moveHistory = [];
    capturedBlack = 0;
    capturedWhite = 0;
    passCount = 0;
    gameRunning = true;
    renderBoard();
    updateStatus();
}

// Render the Go board
function renderBoard() {
    const boardElement = document.getElementById('goBoard');
    boardElement.innerHTML = '';
    
    // Star points (hoshi) on 19x19 board
    const starPoints = [
        [3,3], [3,9], [3,15],
        [9,3], [9,9], [9,15],
        [15,3], [15,9], [15,15]
    ];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const intersection = document.createElement('div');
            intersection.className = 'go-intersection';
            intersection.dataset.row = row;
            intersection.dataset.col = col;
            
            // Draw grid lines
            if (row < BOARD_SIZE - 1) {
                const hLine = document.createElement('div');
                hLine.className = 'go-line horizontal';
                intersection.appendChild(hLine);
            }
            if (col < BOARD_SIZE - 1) {
                const vLine = document.createElement('div');
                vLine.className = 'go-line vertical';
                intersection.appendChild(vLine);
            }
            
            // Add star point
            if (starPoints.some(([r, c]) => r === row && c === col)) {
                intersection.classList.add('star-point');
            }
            
            // Add stone if present
            if (board[row][col]) {
                const stone = document.createElement('div');
                stone.className = `go-stone ${board[row][col]}`;
                intersection.appendChild(stone);
            }
            
            intersection.onclick = () => placeStone(row, col);
            boardElement.appendChild(intersection);
        }
    }
}

// Place stone
function placeStone(row, col) {
    if (!gameRunning || aiThinking) return;
    if (board[row][col]) return; // Already occupied
    
    // Place stone
    board[row][col] = currentPlayer;
    moveHistory.push({row, col, color: currentPlayer});
    passCount = 0;
    
    // Check for captures
    checkCaptures(row, col);
    
    // Switch player
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    renderBoard();
    updateStatus();
    
    // Trigger AI if enabled
    if (aiEnabled && currentPlayer === 'white') {
        setTimeout(getAIMove, 500);
    }
}

// Check and remove captured stones
function checkCaptures(row, col) {
    const opponent = currentPlayer === 'black' ? 'white' : 'black';
    const directions = [[0,1], [1,0], [0,-1], [-1,0]];
    
    // Check all adjacent opponent groups
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
            if (board[newRow][newCol] === opponent) {
                const group = getGroup(newRow, newCol);
                if (getLiberties(group).length === 0) {
                    // Capture the group
                    group.forEach(([r, c]) => {
                        board[r][c] = null;
                        if (currentPlayer === 'black') {
                            capturedBlack++;
                        } else {
                            capturedWhite++;
                        }
                    });
                }
            }
        }
    }
    
    // Check if own stone has liberties (suicide rule)
    const ownGroup = getGroup(row, col);
    if (getLiberties(ownGroup).length === 0) {
        // Illegal move (suicide)
        board[row][col] = null;
        return false;
    }
    
    return true;
}

// Get connected group of stones
function getGroup(row, col) {
    const color = board[row][col];
    if (!color) return [];
    
    const group = [];
    const visited = new Set();
    const queue = [[row, col]];
    
    while (queue.length > 0) {
        const [r, c] = queue.shift();
        const key = `${r},${c}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;
        if (board[r][c] !== color) continue;
        
        group.push([r, c]);
        
        // Add adjacent positions
        queue.push([r+1, c], [r-1, c], [r, c+1], [r, c-1]);
    }
    
    return group;
}

// Get liberties (empty adjacent points) for a group
function getLiberties(group) {
    const liberties = new Set();
    const directions = [[0,1], [1,0], [0,-1], [-1,0]];
    
    for (const [row, col] of group) {
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                if (!board[newRow][newCol]) {
                    liberties.add(`${newRow},${newCol}`);
                }
            }
        }
    }
    
    return Array.from(liberties);
}

// Pass move
function pass() {
    if (!gameRunning) return;
    
    passCount++;
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    
    if (passCount >= 2) {
        endGame();
    } else {
        updateStatus();
        
        // Trigger AI if enabled
        if (aiEnabled && currentPlayer === 'white') {
            setTimeout(getAIMove, 500);
        }
    }
}

// End game and count territory
function endGame() {
    gameRunning = false;
    
    // Simplified territory counting
    const territory = countTerritory();
    
    const blackScore = territory.black + capturedWhite;
    const whiteScore = territory.white + capturedBlack + 7.5; // Komi
    
    const winner = blackScore > whiteScore ? 'Black' : 'White';
    const diff = Math.abs(blackScore - whiteScore).toFixed(1);
    
    alert(`Game Over!\n\nBlack: ${blackScore.toFixed(1)} points\nWhite: ${whiteScore.toFixed(1)} points\n\n${winner} wins by ${diff} points!`);
}

// Simple territory counting
function countTerritory() {
    const visited = new Set();
    let blackTerritory = 0;
    let whiteTerritory = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const key = `${row},${col}`;
            if (!visited.has(key) && !board[row][col]) {
                const region = getEmptyRegion(row, col, visited);
                const owner = getRegionOwner(region);
                
                if (owner === 'black') blackTerritory += region.length;
                else if (owner === 'white') whiteTerritory += region.length;
            }
        }
    }
    
    return {black: blackTerritory, white: whiteTerritory};
}

function getEmptyRegion(row, col, visited) {
    const region = [];
    const queue = [[row, col]];
    
    while (queue.length > 0) {
        const [r, c] = queue.shift();
        const key = `${r},${c}`;
        
        if (visited.has(key)) continue;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;
        if (board[r][c]) continue;
        
        visited.add(key);
        region.push([r, c]);
        
        queue.push([r+1, c], [r-1, c], [r, c+1], [r, c-1]);
    }
    
    return region;
}

function getRegionOwner(region) {
    const adjacentColors = new Set();
    const directions = [[0,1], [1,0], [0,-1], [-1,0]];
    
    for (const [row, col] of region) {
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                if (board[newRow][newCol]) {
                    adjacentColors.add(board[newRow][newCol]);
                }
            }
        }
    }
    
    if (adjacentColors.size === 1) {
        return Array.from(adjacentColors)[0];
    }
    return null; // Neutral territory
}

// AI Integration
async function toggleAI() {
    aiEnabled = !aiEnabled;
    const btn = document.getElementById('aiToggle');
    const controls = document.getElementById('aiControls');
    
    if (aiEnabled) {
        btn.textContent = '👤 Play vs Human';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
        controls.style.display = 'block';
        
        await connectToKataGo();
    } else {
        btn.textContent = '🤖 Play vs AI';
        btn.style.background = '';
        controls.style.display = 'none';
    }
}

async function connectToKataGo() {
    try {
        console.log('Connecting to KataGo backend...');
        const response = await fetch('http://localhost:9545/api/status');
        const status = await response.json();
        
        if (status.ready) {
            katagoConnected = true;
            alert(`Connected to ${status.engine}\n${status.strength}\n\nAlphaGo-level AI!`);
        }
    } catch (error) {
        console.error('KataGo not available:', error);
        katagoConnected = false;
        alert('⚠️ KataGo backend not running.\n\nStart it with:\npython go-server.py');
    }
}

async function getAIMove() {
    if (aiThinking || !gameRunning) return;
    
    aiThinking = true;
    document.getElementById('aiThinking').style.display = 'inline';
    
    try {
        if (katagoConnected) {
            // Use KataGo
            const moves = moveHistory.map(m => 
                `${m.color[0]} ${String.fromCharCode(65 + m.col)}${BOARD_SIZE - m.row}`
            );
            
            const response = await fetch('http://localhost:9545/api/move', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    board_size: BOARD_SIZE,
                    moves: moves,
                    komi: 7.5
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.move) {
                console.log('KataGo move:', result.move);
                executeGTPMove(result.move);
            }
        } else {
            // Fallback: Random valid move
            const validMoves = [];
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (!board[r][c]) validMoves.push([r, c]);
                }
            }
            if (validMoves.length > 0) {
                const [r, c] = validMoves[Math.floor(Math.random() * validMoves.length)];
                placeStone(r, c);
            }
        }
    } catch (error) {
        console.error('AI error:', error);
    } finally {
        aiThinking = false;
        document.getElementById('aiThinking').style.display = 'none';
    }
}

function executeGTPMove(gtpMove) {
    // Parse GTP move like "C4" or "pass"
    if (gtpMove.toLowerCase() === 'pass') {
        pass();
        return;
    }
    
    // Parse coordinate
    const col = gtpMove.charCodeAt(0) - 65; // A=0, B=1, etc (skip I)
    const row = BOARD_SIZE - parseInt(gtpMove.slice(1));
    
    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        placeStone(row, col);
    }
}

function updateStatus() {
    const status = document.getElementById('status');
    status.textContent = `${currentPlayer === 'black' ? 'Black' : 'White'} to play`;
    
    document.getElementById('blackCaptured').textContent = capturedBlack;
    document.getElementById('whiteCaptured').textContent = capturedWhite;
}

function newGame() {
    initBoard();
}

// Initialize
initBoard();

