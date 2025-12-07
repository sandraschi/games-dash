// Minesweeper - Windows Classic
// Killing productivity since 1990!

let board = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let gameWon = false;
let firstClick = true;
let timer = 0;
let timerInterval = null;
let difficulty = 'beginner';
let variation = 'classic'; // 'classic', 'no-flag', 'time-pressure', 'limited-flags', 'first-click-danger'
let customDifficulty = null;
let timeLimit = null;
let timeLimitInterval = null;
let maxFlags = null;
let firstClickSafe = true;
let gameStateHistory = []; // For undo/cheat feature

// AI Solver for Minesweeper
class MinesweeperAI {
    constructor(board, revealed, flagged, config) {
        this.board = board;
        this.revealed = revealed;
        this.flagged = flagged;
        this.config = config;
    }
    
    // Find all safe moves using logical deduction
    findSafeMoves() {
        const safeMoves = [];
        const mineMoves = [];
        
        // Analyze each revealed cell with a number
        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                if (this.revealed[row][col] && this.board[row][col] > 0) {
                    const number = this.board[row][col];
                    const neighbors = this.getNeighbors(row, col);
                    const flaggedCount = neighbors.filter(n => 
                        this.flagged[n.row] && this.flagged[n.row][n.col]
                    ).length;
                    const hiddenCount = neighbors.filter(n => 
                        !this.revealed[n.row][n.col] && !(this.flagged[n.row] && this.flagged[n.row][n.col])
                    ).length;
                    
                    // If all mines are flagged, remaining neighbors are safe
                    if (flaggedCount === number && hiddenCount > 0) {
                        neighbors.forEach(n => {
                            if (!this.revealed[n.row][n.col] && !(this.flagged[n.row] && this.flagged[n.row][n.col])) {
                                if (!safeMoves.find(m => m.row === n.row && m.col === n.col)) {
                                    safeMoves.push({row: n.row, col: n.col, reason: `Safe: All mines around (${row},${col}) are flagged`});
                                }
                            }
                        });
                    }
                    
                    // If all hidden neighbors must be mines
                    if (number - flaggedCount === hiddenCount && hiddenCount > 0) {
                        neighbors.forEach(n => {
                            if (!this.revealed[n.row][n.col] && !(this.flagged[n.row] && this.flagged[n.row][n.col])) {
                                if (!mineMoves.find(m => m.row === n.row && m.col === n.col)) {
                                    mineMoves.push({row: n.row, col: n.col, reason: `Mine: All remaining around (${row},${col}) must be mines`});
                                }
                            }
                        });
                    }
                }
            }
        }
        
        return { safeMoves, mineMoves };
    }
    
    // Get all neighbors of a cell
    getNeighbors(row, col) {
        const neighbors = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < this.config.rows && nc >= 0 && nc < this.config.cols) {
                    neighbors.push({row: nr, col: nc});
                }
            }
        }
        return neighbors;
    }
    
    // Find the best move (safe move if available, otherwise probability-based)
    getBestMove() {
        const { safeMoves, mineMoves } = this.findSafeMoves();
        
        if (safeMoves.length > 0) {
            // Return a random safe move
            return {
                type: 'safe',
                move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
                confidence: 1.0
            };
        }
        
        if (mineMoves.length > 0) {
            // Return a mine to flag
            return {
                type: 'flag',
                move: mineMoves[Math.floor(Math.random() * mineMoves.length)],
                confidence: 1.0
            };
        }
        
        // No logical moves available - try to work around ambiguous situations
        return this.getWorkAroundMove();
    }
    
    // Try to work around ambiguous situations by finding moves that might provide more info
    getWorkAroundMove() {
        // First, identify all ambiguous groups (cells with equal probability)
        const probabilities = this.calculateAllProbabilities();
        
        if (probabilities.length === 0) {
            return null;
        }
        
        // Group cells by probability
        const probabilityGroups = {};
        probabilities.forEach(p => {
            const key = p.probability.toFixed(3);
            if (!probabilityGroups[key]) {
                probabilityGroups[key] = [];
            }
            probabilityGroups[key].push(p);
        });
        
        // Find the lowest probability group
        const sortedGroups = Object.keys(probabilityGroups).sort((a, b) => parseFloat(a) - parseFloat(b));
        const bestGroup = probabilityGroups[sortedGroups[0]];
        
        // If there are multiple cells with the same (lowest) probability, try to find a "work around"
        if (bestGroup.length > 1 && parseFloat(sortedGroups[0]) > 0) {
            // Look for cells that are adjacent to these ambiguous cells
            // Revealing adjacent cells might provide more constraints
            const ambiguousCells = new Set(bestGroup.map(p => `${p.row},${p.col}`));
            const workAroundCandidates = [];
            
            // Find cells adjacent to ambiguous groups that might provide info
            for (let row = 0; row < this.config.rows; row++) {
                for (let col = 0; col < this.config.cols; col++) {
                    if (!this.revealed[row][col] && !(this.flagged[row] && this.flagged[row][col])) {
                        const cellKey = `${row},${col}`;
                        if (ambiguousCells.has(cellKey)) continue; // Skip the ambiguous cells themselves
                        
                        // Check if this cell is adjacent to any ambiguous cell
                        const neighbors = this.getNeighbors(row, col);
                        let adjacentToAmbiguous = false;
                        let infoValue = 0;
                        
                        neighbors.forEach(n => {
                            if (ambiguousCells.has(`${n.row},${n.col}`)) {
                                adjacentToAmbiguous = true;
                            }
                            // Check if revealing this cell would give us info about ambiguous neighbors
                            if (this.revealed[n.row][n.col] && this.board[n.row][n.col] > 0) {
                                const number = this.board[n.row][n.col];
                                const nNeighbors = this.getNeighbors(n.row, n.col);
                                const nFlagged = nNeighbors.filter(nn => 
                                    this.flagged[nn.row] && this.flagged[nn.row][nn.col]
                                ).length;
                                const nHidden = nNeighbors.filter(nn => 
                                    !this.revealed[nn.row][n.col] && !(this.flagged[nn.row] && this.flagged[nn.row][nn.col])
                                ).length;
                                
                                // If this cell is part of a constraint that affects ambiguous cells
                                if (nHidden > 0 && number - nFlagged > 0) {
                                    infoValue += (number - nFlagged) / nHidden;
                                }
                            }
                        });
                        
                        if (adjacentToAmbiguous) {
                            // Calculate this cell's probability
                            const cellProb = probabilities.find(p => p.row === row && p.col === col);
                            const prob = cellProb ? cellProb.probability : 0.5;
                            
                            workAroundCandidates.push({
                                row, col,
                                probability: prob,
                                infoValue: infoValue,
                                reason: `Work around: Adjacent to ambiguous cells, might provide more constraints`
                            });
                        }
                    }
                }
            }
            
            // If we found work-around candidates, prefer them
            if (workAroundCandidates.length > 0) {
                // Sort by: lower probability first, then higher info value
                workAroundCandidates.sort((a, b) => {
                    if (Math.abs(a.probability - b.probability) < 0.01) {
                        return b.infoValue - a.infoValue; // Higher info value if similar probability
                    }
                    return a.probability - b.probability;
                });
                
                const best = workAroundCandidates[0];
                return {
                    type: 'safe',
                    move: {row: best.row, col: best.col, reason: best.reason},
                    confidence: 1 - best.probability
                };
            }
        }
        
        // No work-around found, use standard probability approach
        return this.getProbabilisticMove();
    }
    
    // Calculate probabilities for all hidden cells
    calculateAllProbabilities() {
        const probabilities = [];
        
        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                if (!this.revealed[row][col] && !(this.flagged[row] && this.flagged[row][col])) {
                    let totalConstraints = 0;
                    let mineIndications = 0;
                    
                    const neighbors = this.getNeighbors(row, col);
                    neighbors.forEach(n => {
                        if (this.revealed[n.row][n.col] && this.board[n.row][n.col] > 0) {
                            const number = this.board[n.row][n.col];
                            const nNeighbors = this.getNeighbors(n.row, n.col);
                            const nFlagged = nNeighbors.filter(nn => 
                                this.flagged[nn.row] && this.flagged[nn.row][nn.col]
                            ).length;
                            const nHidden = nNeighbors.filter(nn => 
                                !this.revealed[nn.row][n.col] && !(this.flagged[nn.row] && this.flagged[nn.row][nn.col])
                            ).length;
                            
                            if (nHidden > 0) {
                                totalConstraints++;
                                const remainingMines = number - nFlagged;
                                mineIndications += remainingMines / nHidden;
                            }
                        }
                    });
                    
                    const probability = totalConstraints > 0 ? mineIndications / totalConstraints : 0.5;
                    probabilities.push({
                        row, col,
                        probability,
                        confidence: totalConstraints > 0 ? 0.5 : 0.1
                    });
                }
            }
        }
        
        return probabilities;
    }
    
    // Calculate probabilities for cells when logic can't determine (fallback)
    getProbabilisticMove() {
        const probabilities = this.calculateAllProbabilities();
        
        if (probabilities.length === 0) {
            return null;
        }
        
        // Find cell with lowest mine probability (safest)
        probabilities.sort((a, b) => a.probability - b.probability);
        const best = probabilities[0];
        
        // Check if there are multiple cells with the same probability
        const sameProbCells = probabilities.filter(p => 
            Math.abs(p.probability - best.probability) < 0.001
        );
        
        let reason = `Lowest mine probability: ${(best.probability * 100).toFixed(1)}%`;
        if (sameProbCells.length > 1) {
            reason += ` (${sameProbCells.length} cells with same probability - guessing)`;
        }
        
        return {
            type: 'safe',
            move: {row: best.row, col: best.col, reason: reason},
            confidence: 1 - best.probability
        };
    }
}

const DIFFICULTIES = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 },
    'super-expert': { rows: 30, cols: 24, mines: 200 }
};

function setDifficulty(level) {
    difficulty = level;
    customDifficulty = null; // Clear custom when selecting preset
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnText = btn.textContent;
        if (level === 'beginner' && btnText.includes('Beginner')) {
            btn.classList.add('active');
        } else if (level === 'intermediate' && btnText.includes('Intermediate')) {
            btn.classList.add('active');
        } else if (level === 'expert' && btnText.includes('Expert') && !btnText.includes('Super')) {
            btn.classList.add('active');
        } else if (level === 'super-expert' && btnText.includes('Super Expert')) {
            btn.classList.add('active');
        }
    });
    newGame();
}

function setVariation(variationType) {
    variation = variationType;
    const infoEl = document.getElementById('variation-info');
    if (infoEl) {
        if (variationType === 'no-flag') {
            infoEl.textContent = 'No-Flag Mode: You cannot place flags - use memory and logic!';
            infoEl.style.color = '#FF6B6B';
        } else if (variationType === 'time-pressure') {
            infoEl.textContent = 'Time Pressure: You have 5 minutes to complete the board!';
            infoEl.style.color = '#FFA500';
        } else if (variationType === 'limited-flags') {
            infoEl.textContent = 'Limited Flags: You can only place half the number of mines as flags!';
            infoEl.style.color = '#FFA500';
        } else if (variationType === 'first-click-danger') {
            infoEl.textContent = 'Hardcore Mode: First click CAN be a mine!';
            infoEl.style.color = '#FF0000';
        } else {
            infoEl.textContent = '';
        }
    }
    newGame();
}

function showCustomDialog() {
    const dialog = document.getElementById('custom-dialog');
    if (dialog) {
        dialog.style.display = 'block';
        // Pre-fill with current values if custom
        if (customDifficulty) {
            document.getElementById('custom-rows').value = customDifficulty.rows;
            document.getElementById('custom-cols').value = customDifficulty.cols;
            document.getElementById('custom-mines').value = customDifficulty.mines;
        }
    }
}

function hideCustomDialog() {
    const dialog = document.getElementById('custom-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
}

function applyCustomDifficulty() {
    const rows = parseInt(document.getElementById('custom-rows').value);
    const cols = parseInt(document.getElementById('custom-cols').value);
    const mines = parseInt(document.getElementById('custom-mines').value);
    
    // Validation
    if (rows < 5 || rows > 50 || cols < 5 || cols > 50) {
        alert('Rows and columns must be between 5 and 50');
        return;
    }
    
    if (mines < 1 || mines > rows * cols - 9) {
        alert(`Mines must be between 1 and ${rows * cols - 9} (need at least 9 safe squares)`);
        return;
    }
    
    customDifficulty = { rows, cols, mines };
    difficulty = 'custom';
    
    // Update difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    hideCustomDialog();
    newGame();
}

// Track game start time for stats
let gameStartTime = null;

function getCurrentConfig() {
    if (customDifficulty) {
        return customDifficulty;
    }
    return DIFFICULTIES[difficulty] || DIFFICULTIES.beginner;
}

function initGame() {
    const config = getCurrentConfig();
    board = [];
    revealed = [];
    flagged = [];
    gameOver = false;
    gameWon = false;
    firstClick = true;
    timer = 0;
    gameStartTime = null;
    firstClickSafe = (variation !== 'first-click-danger');
    gameStateHistory = []; // Clear undo history
    
    // Set variation-specific rules
    if (variation === 'time-pressure') {
        timeLimit = 300; // 5 minutes in seconds
    } else {
        timeLimit = null;
    }
    
    if (variation === 'limited-flags') {
        maxFlags = Math.floor(config.mines / 2);
    } else {
        maxFlags = null;
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (timeLimitInterval) {
        clearInterval(timeLimitInterval);
        timeLimitInterval = null;
    }
    
    updateUndoButton();
    
    // Initialize board
    for (let row = 0; row < config.rows; row++) {
        board[row] = [];
        revealed[row] = [];
        flagged[row] = [];
        for (let col = 0; col < config.cols; col++) {
            board[row][col] = 0;
            revealed[row][col] = false;
            flagged[row][col] = false;
        }
    }
    
    updateDisplay();
    updateInfo();
}

function placeMines(excludeRow, excludeCol) {
    const config = getCurrentConfig();
    let minesPlaced = 0;
    
    while (minesPlaced < config.mines) {
        const row = Math.floor(Math.random() * config.rows);
        const col = Math.floor(Math.random() * config.cols);
        
        // Don't place mine on first click (unless hardcore mode) or if already a mine
        if (firstClickSafe && (row === excludeRow && col === excludeCol)) {
            continue;
        }
        if (board[row][col] === -1) {
            continue;
        }
        
        board[row][col] = -1; // -1 = mine
        minesPlaced++;
    }
    
    // Calculate numbers
    for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
            if (board[row][col] !== -1) {
                board[row][col] = countAdjacentMines(row, col);
            }
        }
    }
}

function countAdjacentMines(row, col) {
    const config = getCurrentConfig();
    let count = 0;
    
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                if (board[nr][nc] === -1) count++;
            }
        }
    }
    
    return count;
}

function saveGameState() {
    // Deep copy current game state for undo
    const config = getCurrentConfig();
    
    // Ensure arrays are properly initialized before saving
    const revealedCopy = [];
    const flaggedCopy = [];
    
    for (let row = 0; row < config.rows; row++) {
        revealedCopy[row] = [];
        flaggedCopy[row] = [];
        for (let col = 0; col < config.cols; col++) {
            revealedCopy[row][col] = revealed[row] && revealed[row][col] ? revealed[row][col] : false;
            flaggedCopy[row][col] = flagged[row] && flagged[row][col] ? flagged[row][col] : false;
        }
    }
    
    const state = {
        revealed: revealedCopy,
        flagged: flaggedCopy,
        gameOver: gameOver,
        gameWon: gameWon,
        timer: timer,
        firstClick: firstClick
    };
    gameStateHistory.push(state);
    // Limit history to prevent memory issues (keep last 50 moves)
    if (gameStateHistory.length > 50) {
        gameStateHistory.shift();
    }
    updateUndoButton();
}

function undoLastMove() {
    if (gameStateHistory.length === 0) {
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'Nothing to undo!';
        return;
    }
    
    // Allow undo even if game is over (to undo the move that caused game over)
    const previousState = gameStateHistory.pop();
    const config = getCurrentConfig();
    
    // Restore arrays properly
    revealed = [];
    flagged = [];
    
    for (let row = 0; row < config.rows; row++) {
        revealed[row] = [];
        flagged[row] = [];
        for (let col = 0; col < config.cols; col++) {
            revealed[row][col] = previousState.revealed[row] && previousState.revealed[row][col] ? previousState.revealed[row][col] : false;
            flagged[row][col] = previousState.flagged[row] && previousState.flagged[row][col] ? previousState.flagged[row][col] : false;
        }
    }
    
    gameOver = previousState.gameOver;
    gameWon = previousState.gameWon;
    timer = previousState.timer;
    firstClick = previousState.firstClick !== undefined ? previousState.firstClick : firstClick;
    
    // Stop timer if game was over/won and we're undoing
    if (gameOver || gameWon) {
        // If we undo back to before game over, restart timer if it was running
        if (!previousState.gameOver && !previousState.gameWon && !firstClick) {
            // Timer should continue, but we've restored the previous timer value
            // The timer interval should still be running
        }
    }
    
    // Update timer display
    const timerEl = document.getElementById('timer');
    if (timerEl) {
        if (variation === 'time-pressure' && timeLimit) {
            const remaining = Math.max(0, timeLimit - timer);
            timerEl.textContent = remaining;
        } else {
            timerEl.textContent = timer;
        }
    }
    
    // Update status
    const statusEl = document.getElementById('status');
    if (statusEl && !gameOver && !gameWon) {
        statusEl.textContent = 'Move undone! Click a cell to start! Right-click to flag/unflag mines.';
    }
    
    updateDisplay();
    updateInfo();
    updateUndoButton();
}

function updateUndoButton() {
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        if (gameStateHistory.length === 0) {
            undoBtn.disabled = true;
            undoBtn.style.opacity = '0.5';
            undoBtn.style.cursor = 'not-allowed';
        } else {
            // Allow undo even if game is over (to undo the losing move)
            undoBtn.disabled = false;
            undoBtn.style.opacity = '1';
            undoBtn.style.cursor = 'pointer';
        }
    }
}

function getAIMove() {
    if (gameOver || gameWon || firstClick) {
        return null;
    }
    
    const config = getCurrentConfig();
    const ai = new MinesweeperAI(board, revealed, flagged, config);
    return ai.getBestMove();
}

function applyAIMove() {
    const move = getAIMove();
    if (!move) {
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'AI: No moves available or game not started';
        return;
    }
    
    const statusEl = document.getElementById('status');
    if (statusEl) {
        if (move.confidence >= 0.9) {
            statusEl.textContent = `AI: ${move.move.reason}`;
        } else {
            statusEl.textContent = `AI: Best guess (${(move.confidence * 100).toFixed(0)}% confidence) - ${move.move.reason}`;
        }
    }
    
    if (move.type === 'safe') {
        revealCell(move.move.row, move.move.col);
    } else if (move.type === 'flag') {
        toggleFlag(move.move.row, move.move.col);
    }
    
    // Clear status message after 3 seconds
    setTimeout(() => {
        if (statusEl && !gameOver && !gameWon) {
            statusEl.textContent = 'Click a cell to start! Right-click to flag/unflag mines.';
        }
    }, 3000);
}

function getAIHint() {
    const move = getAIMove();
    if (!move) {
        alert('AI: No hints available. Start the game first!');
        return;
    }
    
    const config = getCurrentConfig();
    const cellIndex = move.move.row * config.cols + move.move.col;
    const boardEl = document.getElementById('board');
    if (boardEl) {
        const cells = boardEl.querySelectorAll('.cell');
        if (cells[cellIndex]) {
            // Highlight the suggested cell
            cells[cellIndex].style.boxShadow = '0 0 20px #00FF00, 0 0 30px #00FF00';
            cells[cellIndex].style.border = '3px solid #00FF00';
            
            setTimeout(() => {
                cells[cellIndex].style.boxShadow = '';
                cells[cellIndex].style.border = '';
            }, 2000);
        }
    }
    
    const confidence = move.confidence >= 0.9 ? 'certain' : `${(move.confidence * 100).toFixed(0)}% confident`;
    alert(`AI Hint:\n${move.type === 'safe' ? 'Safe to reveal' : 'Should flag'} cell at row ${move.move.row + 1}, col ${move.move.col + 1}\n\nReason: ${move.move.reason}\nConfidence: ${confidence}`);
}

function revealCell(row, col) {
    const config = getCurrentConfig();
    
    if (gameOver || gameWon) return;
    if (revealed[row][col] || flagged[row][col]) return;
    
    // Save state before revealing (for undo)
    saveGameState();
    
    if (firstClick) {
        placeMines(row, col);
        firstClick = false;
        gameStartTime = Date.now();
        startTimer();
        
        // Start time limit countdown if in time-pressure mode
        if (variation === 'time-pressure' && timeLimit) {
            startTimeLimit();
        }
    }
    
    revealed[row][col] = true;
    
    if (board[row][col] === -1) {
        // Hit a mine! BOOM!
        gameOver = true;
        playExplosionSound();
        showExplosion(row, col);
        setTimeout(() => {
            revealAllMines();
            stopTimer();
            const statusEl = document.getElementById('status');
            if (statusEl) statusEl.textContent = 'BOOM! Game Over! Click New Game to try again.';
            recordGameStats('loss', 0);
            updateUndoButton();
        }, 300);
        return;
    }
    
    // Auto-reveal adjacent cells if this is a zero (flood fill)
    if (board[row][col] === 0) {
        // Use a queue-based flood fill for better performance and visual effect
        const queue = [{row, col}];
        const processed = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.row},${current.col}`;
            
            if (processed.has(key)) continue;
            processed.add(key);
            
            // Reveal all adjacent zero cells
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = current.row + dr;
                    const nc = current.col + dc;
                    
                    if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                        if (!revealed[nr][nc] && !flagged[nr][nc]) {
                            revealed[nr][nc] = true;
                            
                            // If it's also a zero, add to queue to continue flood fill
                            if (board[nr][nc] === 0) {
                                queue.push({row: nr, col: nc});
                            }
                        }
                    }
                }
            }
        }
        
        // Update display after flood fill completes
        updateDisplay();
        checkWin();
        return;
    }
    
    checkWin();
    updateDisplay();
}

function toggleFlag(row, col) {
    if (gameOver || gameWon) return;
    if (revealed[row][col]) return;
    if (variation === 'no-flag') {
        // In no-flag mode, show a message but don't allow flagging
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'No-Flag Mode: Use memory instead of flags!';
        setTimeout(() => {
            if (statusEl && !gameOver && !gameWon) {
                statusEl.textContent = 'Click a cell to start! Right-click to flag/unflag mines.';
            }
        }, 2000);
        return;
    }
    
    // Check limited flags mode
    if (variation === 'limited-flags' && maxFlags !== null) {
        const config = getCurrentConfig();
        let currentFlagCount = 0;
        for (let r = 0; r < config.rows; r++) {
            if (flagged[r]) {
                for (let c = 0; c < config.cols; c++) {
                    if (flagged[r][c]) currentFlagCount++;
                }
            }
        }
        
        // If trying to add a flag and at limit, don't allow
        if (!flagged[row][col] && currentFlagCount >= maxFlags) {
            const statusEl = document.getElementById('status');
            if (statusEl) statusEl.textContent = `Limited Flags: You can only place ${maxFlags} flags!`;
            setTimeout(() => {
                if (statusEl && !gameOver && !gameWon) {
                    statusEl.textContent = 'Click a cell to start! Right-click to flag/unflag mines.';
                }
            }, 2000);
            return;
        }
    }
    
    // Save state before flagging (for undo)
    saveGameState();
    
    flagged[row][col] = !flagged[row][col];
    updateDisplay();
    updateInfo();
}

function playExplosionSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Cute sproing noise: bouncy, playful sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.15);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.25);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.35);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.25);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
        // Silently fail if audio not available
        console.debug('Audio not available:', e);
    }
}

function showExplosion(row, col) {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;
    
    const config = getCurrentConfig();
    const cells = boardEl.querySelectorAll('.cell');
    const cellIndex = row * config.cols + col;
    if (cells[cellIndex]) {
        // Cute bouncy animation instead of explosion
        cells[cellIndex].style.animation = 'sproing 0.4s ease-out';
        setTimeout(() => {
            cells[cellIndex].style.animation = '';
        }, 400);
    }
}

function revealAllMines() {
    const config = getCurrentConfig();
    for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
            if (board[row][col] === -1) {
                revealed[row][col] = true;
                // Remove flag if it was incorrectly placed
                if (flagged[row] && flagged[row][col]) {
                    flagged[row][col] = false;
                }
            }
        }
    }
    updateDisplay();
}

function checkWin() {
    const config = getCurrentConfig();
    let revealedCount = 0;
    
    for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
            if (revealed[row][col] && board[row][col] !== -1) {
                revealedCount++;
            }
        }
    }
    
    const totalCells = config.rows * config.cols;
    const safeCells = totalCells - config.mines;
    
    if (revealedCount === safeCells && !gameOver) {
        gameWon = true;
        stopTimer();
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = `You won! Time: ${timer} seconds`;
        // Score based on difficulty and time (lower time = higher score)
        const baseScore = difficulty === 'beginner' ? 100 : difficulty === 'intermediate' ? 500 : 1000;
        const timeBonus = Math.max(0, 1000 - timer * 10);
        const score = baseScore + timeBonus;
        recordGameStats('win', score);
        updateUndoButton();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            if (variation === 'time-pressure' && timeLimit) {
                const remaining = timeLimit - timer;
                timerEl.textContent = remaining > 0 ? remaining : 0;
                if (remaining <= 0 && !gameOver) {
                    gameOver = true;
                    stopTimer();
                    const statusEl = document.getElementById('status');
                    if (statusEl) statusEl.textContent = 'Time\'s Up! Game Over!';
                    recordGameStats('loss', 0);
                }
            } else {
                timerEl.textContent = timer;
            }
        }
    }, 1000);
}

function startTimeLimit() {
    // Time limit is handled in startTimer, but we can add visual warning
    if (timeLimitInterval) {
        clearInterval(timeLimitInterval);
    }
    timeLimitInterval = setInterval(() => {
        if (variation === 'time-pressure' && timeLimit && timer >= timeLimit - 30) {
            const timerEl = document.getElementById('timer');
            if (timerEl) {
                timerEl.style.color = '#FF0000';
                timerEl.style.animation = 'pulse 1s infinite';
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateInfo() {
    const config = getCurrentConfig();
    let flagCount = 0;
    
    for (let row = 0; row < config.rows; row++) {
        if (flagged[row]) {
            for (let col = 0; col < config.cols; col++) {
                if (flagged[row][col]) flagCount++;
            }
        }
    }
    
    const minesCountEl = document.getElementById('mines-count');
    const flagsCountEl = document.getElementById('flags-count');
    const timerEl = document.getElementById('timer');
    
    if (minesCountEl) {
        if (variation === 'limited-flags' && maxFlags !== null) {
            minesCountEl.textContent = `${config.mines - flagCount} (${maxFlags - flagCount} flags left)`;
        } else {
            minesCountEl.textContent = config.mines - flagCount;
        }
    }
    if (flagsCountEl) {
        if (variation === 'limited-flags' && maxFlags !== null) {
            flagsCountEl.textContent = `${flagCount}/${maxFlags}`;
        } else {
            flagsCountEl.textContent = flagCount;
        }
    }
    if (timerEl) {
        if (variation === 'time-pressure' && timeLimit) {
            const remaining = Math.max(0, timeLimit - timer);
            timerEl.textContent = remaining;
            if (remaining <= 30) {
                timerEl.style.color = '#FF0000';
            } else {
                timerEl.style.color = '#FFD700';
            }
        } else {
            timerEl.textContent = timer;
            timerEl.style.color = '#FFD700';
        }
    }
}

function updateDisplay() {
    const config = getCurrentConfig();
    const boardEl = document.getElementById('board');
    if (!boardEl) {
        console.error('Board element not found');
        return;
    }
    
    // Ensure board arrays are initialized
    if (!board || board.length === 0) {
        console.error('Board not initialized');
        return;
    }
    
    // Set grid properties first
    boardEl.style.display = 'grid';
    boardEl.style.gridTemplateColumns = `repeat(${config.cols}, 32px)`;
    boardEl.style.gridTemplateRows = `repeat(${config.rows}, 32px)`;
    boardEl.style.gridAutoFlow = 'row';
    boardEl.style.width = 'fit-content';
    boardEl.style.height = 'fit-content';
    
    // Then clear and rebuild
    boardEl.innerHTML = '';
    
    for (let row = 0; row < config.rows; row++) {
        if (!board[row] || !revealed[row] || !flagged[row]) {
            console.error(`Row ${row} not initialized`);
            continue;
        }
        
        for (let col = 0; col < config.cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (flagged[row] && flagged[row][col]) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
                cell.style.fontSize = '20px';
                // Use addEventListener for better compatibility
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    toggleFlag(row, col);
                    return false;
                }, false);
                // Still allow left-click to remove flag in classic mode
                if (variation === 'classic') {
                    cell.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFlag(row, col);
                    };
                }
            } else if (revealed[row] && revealed[row][col]) {
                cell.classList.add('revealed');
                if (board[row] && board[row][col] === -1) {
                    cell.classList.add('mine');
                    cell.textContent = '*';
                    cell.style.color = '#FF0000';
                } else if (board[row] && board[row][col] > 0) {
                    cell.classList.add('number-' + board[row][col]);
                    cell.textContent = board[row][col];
                }
            } else {
                cell.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    revealCell(row, col);
                };
                // Use addEventListener for better compatibility
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    toggleFlag(row, col);
                    return false;
                }, false);
            }
            
            boardEl.appendChild(cell);
        }
    }
}

// Unobtrusive stats recording
async function recordGameStats(result, score = 0) {
    if (!window.statsManager) return;
    try {
        if (!window.statsManager.db) {
            await window.statsManager.initialize();
        }
        const duration = gameStartTime ? Date.now() - gameStartTime : 0;
        await window.statsManager.recordGame({
            gameType: 'minesweeper',
            score: score,
            result: result,
            duration: duration,
            details: { difficulty: difficulty, time: timer }
        });
    } catch (e) {
        // Silently fail - stats are optional
        console.debug('Stats recording failed:', e);
    }
}

function newGame() {
    initGame();
}

// Initialize on DOM ready
function initializeGame() {
    // Wait a bit to ensure DOM is fully ready
    setTimeout(() => {
        const boardEl = document.getElementById('board');
        if (!boardEl) {
            console.error('Board element not found, retrying...');
            setTimeout(initializeGame, 100);
            return;
        }
        initGame();
    }, 50);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

