// Gomoku (五目並べ) Game with Minimax AI
// **Timestamp**: 2025-12-03

const BOARD_SIZE = 15;

let board = [];
let currentPlayer = 'black';
let moveHistory = [];
let gameRunning = false;
let aiEnabled = false;
let aiLevel = 4;
let aiThinking = false;

// Initialize board
function initBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    currentPlayer = 'black';
    moveHistory = [];
    gameRunning = true;
    renderBoard();
    updateStatus();
}

// Render board
function renderBoard() {
    const boardElement = document.getElementById('gomokuBoard');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'gomoku-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (board[row][col]) {
                const stone = document.createElement('div');
                stone.className = `gomoku-stone ${board[row][col]}`;
                cell.appendChild(stone);
            }
            
            cell.onclick = () => placeStone(row, col);
            boardElement.appendChild(cell);
        }
    }
}

// Place stone
function placeStone(row, col) {
    if (!gameRunning || aiThinking) return;
    if (board[row][col]) return;
    
    board[row][col] = currentPlayer;
    moveHistory.push({row, col, color: currentPlayer});
    
    // Check for win
    if (checkWin(row, col)) {
        gameRunning = false;
        highlightWinningLine(row, col);
        setTimeout(() => {
            alert(`${currentPlayer === 'black' ? 'Black' : 'White'} wins!`);
        }, 100);
        return;
    }
    
    // Check for draw
    if (moveHistory.length === BOARD_SIZE * BOARD_SIZE) {
        gameRunning = false;
        alert('Draw! Board is full.');
        return;
    }
    
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    renderBoard();
    updateStatus();
    
    // Trigger AI
    if (aiEnabled && currentPlayer === 'white') {
        setTimeout(getAIMove, 300);
    }
}

// Check for 5 in a row
function checkWin(row, col) {
    const color = board[row][col];
    const directions = [
        [[0,1], [0,-1]],   // Horizontal
        [[1,0], [-1,0]],   // Vertical
        [[1,1], [-1,-1]],  // Diagonal \
        [[1,-1], [-1,1]]   // Diagonal /
    ];
    
    for (const [dir1, dir2] of directions) {
        let count = 1;
        count += countDirection(row, col, dir1[0], dir1[1], color);
        count += countDirection(row, col, dir2[0], dir2[1], color);
        
        if (count >= 5) return true;
    }
    
    return false;
}

function countDirection(row, col, dr, dc, color) {
    let count = 0;
    let r = row + dr;
    let c = col + dc;
    
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
        count++;
        r += dr;
        c += dc;
    }
    
    return count;
}

function highlightWinningLine(row, col) {
    const color = board[row][col];
    const directions = [
        [[0,1], [0,-1]], [[1,0], [-1,0]], 
        [[1,1], [-1,-1]], [[1,-1], [-1,1]]
    ];
    
    for (const [dir1, dir2] of directions) {
        const line = [[row, col]];
        
        // Collect line in both directions
        for (const [dr, dc] of [dir1, dir2]) {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
                line.push([r, c]);
                r += dr;
                c += dc;
            }
        }
        
        if (line.length >= 5) {
            line.forEach(([r, c]) => {
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) cell.classList.add('winning-line');
            });
            break;
        }
    }
}

// Minimax AI with Alpha-Beta Pruning
async function getAIMove() {
    if (aiThinking || !gameRunning) return;
    
    aiThinking = true;
    document.getElementById('aiThinking').style.display = 'inline';
    
    try {
        // Use minimax to find best move
        const depth = parseInt(document.getElementById('aiLevel').value);
        const bestMove = await minimaxSearch(depth);
        
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col);
        }
    } catch (error) {
        console.error('AI error:', error);
    } finally {
        aiThinking = false;
        document.getElementById('aiThinking').style.display = 'none';
    }
}

async function minimaxSearch(maxDepth) {
    let bestScore = -Infinity;
    let bestMove = null;
    
    // Get candidate moves (within 2 squares of existing stones)
    const candidates = getCandidateMoves();
    
    for (const move of candidates) {
        board[move.row][move.col] = 'white';
        const score = minimax(maxDepth - 1, -Infinity, Infinity, false);
        board[move.row][move.col] = null;
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
        
        // Yield to UI
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return bestMove;
}

function minimax(depth, alpha, beta, isMaximizing) {
    // Check terminal states
    const winner = checkBoardWinner();
    if (winner === 'white') return 10000;
    if (winner === 'black') return -10000;
    if (depth === 0) return evaluateBoard();
    
    const candidates = getCandidateMoves();
    if (candidates.length === 0) return 0;
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of candidates) {
            board[move.row][move.col] = 'white';
            const eval = minimax(depth - 1, alpha, beta, false);
            board[move.row][move.col] = null;
            
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break; // Alpha-beta pruning
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of candidates) {
            board[move.row][move.col] = 'black';
            const eval = minimax(depth - 1, alpha, beta, true);
            board[move.row][move.col] = null;
            
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break; // Alpha-beta pruning
        }
        return minEval;
    }
}

function getCandidateMoves() {
    const candidates = [];
    const range = 2;
    
    if (moveHistory.length === 0) {
        // First move - center
        return [{row: 7, col: 7}];
    }
    
    const checked = new Set();
    
    for (const {row, col} of moveHistory) {
        for (let dr = -range; dr <= range; dr++) {
            for (let dc = -range; dc <= range; dc++) {
                const r = row + dr;
                const c = col + dc;
                const key = `${r},${c}`;
                
                if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
                    !board[r][c] && !checked.has(key)) {
                    candidates.push({row: r, col: c});
                    checked.add(key);
                }
            }
        }
    }
    
    return candidates;
}

function evaluateBoard() {
    let score = 0;
    
    // Evaluate all lines
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col]) {
                score += evaluatePosition(row, col);
            }
        }
    }
    
    return score;
}

function evaluatePosition(row, col) {
    const color = board[row][col];
    const directions = [[0,1], [1,0], [1,1], [1,-1]];
    let score = 0;
    
    for (const [dr, dc] of directions) {
        const count = countLine(row, col, dr, dc, color);
        
        // Score based on length
        if (count === 4) score += (color === 'white' ? 1000 : -1000);
        else if (count === 3) score += (color === 'white' ? 100 : -100);
        else if (count === 2) score += (color === 'white' ? 10 : -10);
    }
    
    return score;
}

function countLine(row, col, dr, dc, color) {
    let count = 1;
    
    // Count in positive direction
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
        count++;
        r += dr;
        c += dc;
    }
    
    // Count in negative direction
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
        count++;
        r -= dr;
        c -= dc;
    }
    
    return count;
}

function checkBoardWinner() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] && checkWinFrom(row, col)) {
                return board[row][col];
            }
        }
    }
    return null;
}

function checkWinFrom(row, col) {
    const color = board[row][col];
    const directions = [[[0,1], [0,-1]], [[1,0], [-1,0]], [[1,1], [-1,-1]], [[1,-1], [-1,1]]];
    
    for (const [dir1, dir2] of directions) {
        let count = 1;
        count += countDirection(row, col, dir1[0], dir1[1], color);
        count += countDirection(row, col, dir2[0], dir2[1], color);
        if (count >= 5) return true;
    }
    return false;
}

// AI toggle
function toggleAI() {
    aiEnabled = !aiEnabled;
    const btn = document.getElementById('aiToggle');
    const controls = document.getElementById('aiControls');
    
    if (aiEnabled) {
        btn.textContent = '👤 Play vs Human';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
        controls.style.display = 'block';
        alert('Gomoku AI enabled!\nMinimax with Alpha-Beta Pruning\nDifficulty: Depth ' + aiLevel);
    } else {
        btn.textContent = '🤖 Play vs AI';
        btn.style.background = '';
        controls.style.display = 'none';
    }
}

function undoMove() {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory.pop();
    board[lastMove.row][lastMove.col] = null;
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    gameRunning = true;
    renderBoard();
    updateStatus();
}

function updateStatus() {
    document.getElementById('status').textContent = 
        `${currentPlayer === 'black' ? 'Black' : 'White'} to play`;
}

function newGame() {
    initBoard();
}

// Initialize
initBoard();

