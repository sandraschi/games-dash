// Samurai Sudoku - Visual Board Game
// **Timestamp**: 2025-12-27

// Grid configuration
const GRID_SIZE = 21;
const BOX_SIZE = 9;

// Game state
let samuraiGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
let originalGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
let solvedGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
let notesGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => []));
let selectedCell = null;
let gameMode = 'normal'; // 'normal' or 'notes'
let gameDifficulty = 'medium';
let gameStartTime = null;
let gameTimer = null;
let mistakeCount = 0;

// Define the valid areas for each of the 5 sudoku puzzles
const PUZZLE_AREAS = {
    topLeft: { startRow: 0, startCol: 0, endRow: 8, endCol: 8 },
    topRight: { startRow: 0, startCol: 12, endRow: 8, endCol: 20 },
    bottomLeft: { startRow: 12, startCol: 0, endRow: 20, endCol: 8 },
    bottomRight: { startRow: 12, startCol: 12, endRow: 20, endCol: 20 },
    center: { startRow: 6, startCol: 6, endRow: 14, endCol: 14 }
};

function isValidCell(row, col) {
    for (const area of Object.values(PUZZLE_AREAS)) {
        if (row >= area.startRow && row <= area.endRow &&
            col >= area.startCol && col <= area.endCol) {
            return true;
        }
    }
    return false;
}

function getPuzzleArea(row, col) {
    for (const [name, area] of Object.entries(PUZZLE_AREAS)) {
        if (row >= area.startRow && row <= area.endRow &&
            col >= area.startCol && col <= area.endCol) {
            return name;
        }
    }
    return null;
}

function initializeGrid() {
    const grid = document.getElementById('samuraiGrid');
    grid.innerHTML = '';

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'samurai-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (!isValidCell(row, col)) {
                cell.classList.add('invalid');
            }

            cell.addEventListener('click', () => selectCell(row, col));
            grid.appendChild(cell);
        }
    }
}

function initializeNumberPad() {
    const pad = document.getElementById('numberPad');
    pad.innerHTML = '';

    for (let num = 1; num <= 9; num++) {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.textContent = num;
        btn.addEventListener('click', () => enterNumber(num));
        pad.appendChild(btn);
    }

    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'number-btn';
    clearBtn.textContent = '⌫';
    clearBtn.addEventListener('click', () => enterNumber(0));
    pad.appendChild(clearBtn);
}

function selectCell(row, col) {
    if (!isValidCell(row, col)) return;

    // Remove previous selection
    document.querySelectorAll('.samurai-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });

    // Remove highlights
    document.querySelectorAll('.samurai-cell.highlight').forEach(cell => {
        cell.classList.remove('highlight');
    });

    // Select new cell
    selectedCell = { row, col };
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('selected');

    // Highlight related cells (same row, column, box)
    highlightRelatedCells(row, col);
}

function highlightRelatedCells(row, col) {
    // Highlight same row
    for (let c = 0; c < GRID_SIZE; c++) {
        if (c !== col && isValidCell(row, c)) {
            document.querySelector(`[data-row="${row}"][data-col="${c}"]`).classList.add('highlight');
        }
    }

    // Highlight same column
    for (let r = 0; r < GRID_SIZE; r++) {
        if (r !== row && isValidCell(r, col)) {
            document.querySelector(`[data-row="${r}"][data-col="${col}"]`).classList.add('highlight');
        }
    }

    // Highlight same 3x3 box within puzzle area
    const area = getPuzzleArea(row, col);
    if (area) {
        const puzzleArea = PUZZLE_AREAS[area];
        const boxStartRow = puzzleArea.startRow + Math.floor((row - puzzleArea.startRow) / 3) * 3;
        const boxStartCol = puzzleArea.startCol + Math.floor((col - puzzleArea.startCol) / 3) * 3;

        for (let r = boxStartRow; r < boxStartRow + 3; r++) {
            for (let c = boxStartCol; c < boxStartCol + 3; c++) {
                if ((r !== row || c !== col) && isValidCell(r, c)) {
                    document.querySelector(`[data-row="${r}"][data-col="${c}"]`).classList.add('highlight');
                }
            }
        }
    }
}

function enterNumber(num) {
    if (!selectedCell) {
        showStatus('Please select a cell first', 'error');
        return;
    }

    const { row, col } = selectedCell;

    if (gameMode === 'notes') {
        // Toggle note
        if (num === 0) {
            notesGrid[row][col] = [];
        } else {
            if (!notesGrid[row][col].includes(num)) {
                notesGrid[row][col].push(num);
            } else {
                notesGrid[row][col] = notesGrid[row][col].filter(n => n !== num);
            }
        }
    } else {
        // Enter number
        if (originalGrid[row][col] !== 0) {
            showStatus('Cannot modify given numbers', 'error');
            return;
        }

        if (num !== 0 && !isValidMove(row, col, num)) {
            showStatus('Invalid move!', 'error');
            mistakeCount++;
            document.getElementById('mistakes').textContent = `Mistakes: ${mistakeCount}`;
            flashCellError(row, col);
            return;
        }

        samuraiGrid[row][col] = num;
        notesGrid[row][col] = []; // Clear notes when entering number
    }

    updateDisplay();
    checkCompletion();
}

function isValidMove(row, col, num) {
    // Check row
    for (let c = 0; c < GRID_SIZE; c++) {
        if (samuraiGrid[row][c] === num && c !== col) {
            return false;
        }
    }

    // Check column
    for (let r = 0; r < GRID_SIZE; r++) {
        if (samuraiGrid[r][col] === num && r !== row) {
            return false;
        }
    }

    // Check 3x3 box within puzzle area
    const area = getPuzzleArea(row, col);
    if (area) {
        const puzzleArea = PUZZLE_AREAS[area];
        const boxStartRow = puzzleArea.startRow + Math.floor((row - puzzleArea.startRow) / 3) * 3;
        const boxStartCol = puzzleArea.startCol + Math.floor((col - puzzleArea.startCol) / 3) * 3;

        for (let r = boxStartRow; r < boxStartRow + 3; r++) {
            for (let c = boxStartCol; c < boxStartCol + 3; c++) {
                if (samuraiGrid[r][c] === num && (r !== row || c !== col)) {
                    return false;
                }
            }
        }
    }

    return true;
}

function flashCellError(row, col) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('error');
    setTimeout(() => {
        cell.classList.remove('error');
    }, 500);
}

function updateDisplay() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            const value = samuraiGrid[row][col];
            const notes = notesGrid[row][col];

            // Clear cell content
            cell.textContent = '';
            cell.className = 'samurai-cell';

            if (!isValidCell(row, col)) {
                cell.classList.add('invalid');
                continue;
            }

            if (originalGrid[row][col] !== 0) {
                cell.classList.add('given');
            }

            if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
                cell.classList.add('selected');
            }

            if (value !== 0) {
                cell.textContent = value;
            } else if (notes.length > 0) {
                cell.classList.add('notes');
                cell.innerHTML = notes.map(n => `<span>${n}</span>`).join('');
            }
        }
    }

    updateProgress();
}

function updateProgress() {
    let filled = 0;
    let total = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (isValidCell(row, col)) {
                total++;
                if (samuraiGrid[row][col] !== 0) {
                    filled++;
                }
            }
        }
    }

    const progress = Math.round((filled / total) * 100);
    document.getElementById('progress').textContent = `Progress: ${progress}%`;
}

function setMode(mode) {
    gameMode = mode;

    document.getElementById('normalMode').classList.toggle('active', mode === 'normal');
    document.getElementById('notesMode').classList.toggle('active', mode === 'notes');

    showStatus(`Switched to ${mode} mode`, 'info');
}

function newGame() {
    generatePuzzle(gameDifficulty);
    mistakeCount = 0;
    selectedCell = null;
    gameStartTime = Date.now();
    startTimer();

    document.getElementById('mistakes').textContent = 'Mistakes: 0';
    showStatus('New samurai sudoku puzzle generated!', 'success');
}

function resetGame() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            samuraiGrid[row][col] = originalGrid[row][col];
            notesGrid[row][col] = [];
        }
    }

    selectedCell = null;
    mistakeCount = 0;
    updateDisplay();
    document.getElementById('mistakes').textContent = 'Mistakes: 0';
    showStatus('Game reset', 'info');
}

function generatePuzzle(difficulty = 'medium') {
    gameDifficulty = difficulty;

    // Reset grids
    samuraiGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    originalGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    solvedGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    notesGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => []));

    // Generate each of the 5 sudoku puzzles
    const areas = Object.values(PUZZLE_AREAS);

    for (const area of areas) {
        generateSudokuForArea(area);
    }

    // Copy to solved grid
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            solvedGrid[row][col] = samuraiGrid[row][col];
        }
    }

    // Remove numbers based on difficulty
    removeNumbers(difficulty);

    // Copy to original grid
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            originalGrid[row][col] = samuraiGrid[row][col];
        }
    }

    updateDisplay();
}

function generateSudokuForArea(area) {
    // Generate a valid sudoku solution for the area
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 9; i++) {
        const row = area.startRow + Math.floor(i / 3);
        const col = area.startCol + (i % 3);

        // Fill with shuffled numbers in a diagonal pattern
        samuraiGrid[row][col] = shuffled[i];
    }

    // Fill remaining cells using backtracking
    solveArea(area);
}

function solveArea(area) {
    for (let row = area.startRow; row <= area.endRow; row++) {
        for (let col = area.startCol; col <= area.endCol; col++) {
            if (samuraiGrid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValidInArea(row, col, num, area)) {
                        samuraiGrid[row][col] = num;
                        if (solveArea(area)) {
                            return true;
                        }
                        samuraiGrid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValidInArea(row, col, num, area) {
    // Check row within area
    for (let c = area.startCol; c <= area.endCol; c++) {
        if (samuraiGrid[row][c] === num && c !== col) {
            return false;
        }
    }

    // Check column within area
    for (let r = area.startRow; r <= area.endRow; r++) {
        if (samuraiGrid[r][col] === num && r !== row) {
            return false;
        }
    }

    // Check 3x3 box
    const boxStartRow = area.startRow + Math.floor((row - area.startRow) / 3) * 3;
    const boxStartCol = area.startCol + Math.floor((col - area.startCol) / 3) * 3;

    for (let r = boxStartRow; r < boxStartRow + 3; r++) {
        for (let c = boxStartCol; c < boxStartCol + 3; c++) {
            if (samuraiGrid[r][c] === num && (r !== row || c !== col)) {
                return false;
            }
        }
    }

    return true;
}

function removeNumbers(difficulty) {
    const cellsToRemove = {
        'easy': 0.4,
        'medium': 0.5,
        'hard': 0.6,
        'expert': 0.7
    };

    const removeRatio = cellsToRemove[difficulty] || 0.5;

    const areas = Object.values(PUZZLE_AREAS);
    for (const area of areas) {
        for (let row = area.startRow; row <= area.endRow; row++) {
            for (let col = area.startCol; col <= area.endCol; col++) {
                if (Math.random() < removeRatio) {
                    samuraiGrid[row][col] = 0;
                }
            }
        }
    }
}

function getHint() {
    if (!selectedCell) {
        showStatus('Select a cell first', 'error');
        return;
    }

    const { row, col } = selectedCell;

    if (samuraiGrid[row][col] !== 0) {
        showStatus('Cell already filled', 'error');
        return;
    }

    const hint = solvedGrid[row][col];
    if (hint) {
        showStatus(`Hint: ${hint}`, 'info');
    } else {
        showStatus('No hint available', 'error');
    }
}

function checkSolution() {
    let complete = true;
    let valid = true;

    // Check all valid cells are filled
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (isValidCell(row, col)) {
                if (samuraiGrid[row][col] === 0) {
                    complete = false;
                }
            }
        }
    }

    if (!complete) {
        showStatus('Puzzle not complete', 'error');
        return;
    }

    // Check validity
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (isValidCell(row, col)) {
                const num = samuraiGrid[row][col];
                samuraiGrid[row][col] = 0;
                if (!isValidMove(row, col, num)) {
                    valid = false;
                }
                samuraiGrid[row][col] = num;
            }
        }
    }

    if (valid) {
        stopTimer();
        showStatus('🎉 Congratulations! Puzzle solved!', 'success');
    } else {
        showStatus('Solution contains errors', 'error');
    }
}

function solveGame() {
    showStatus('Solving puzzle...', 'info');

    setTimeout(() => {
        // Copy solved grid
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                samuraiGrid[row][col] = solvedGrid[row][col];
            }
        }

        updateDisplay();
        showStatus('Puzzle solved!', 'success');
    }, 500);
}

function checkCompletion() {
    let complete = true;

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (isValidCell(row, col) && samuraiGrid[row][col] === 0) {
                complete = false;
                break;
            }
        }
        if (!complete) break;
    }

    if (complete) {
        checkSolution();
    }
}

function startTimer() {
    stopTimer();
    gameTimer = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function updateTimer() {
    if (!gameStartTime) return;

    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    document.getElementById('time').textContent =
        `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Keyboard input
document.addEventListener('keydown', (event) => {
    if (event.key >= '1' && event.key <= '9') {
        enterNumber(parseInt(event.key));
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
        enterNumber(0);
    } else if (event.key === 'n') {
        setMode('notes');
    } else if (event.key === 'm') {
        setMode('normal');
    }
});

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    initializeNumberPad();
    newGame();
});