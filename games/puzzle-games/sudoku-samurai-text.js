// Samurai Sudoku - Text Only Version
// No visual board, just text representation and command-line interface

// **Timestamp**: 2025-12-27

// Samurai Sudoku grid is 21x21 with 5 interconnected 9x9 puzzles
const GRID_SIZE = 21;
const BOX_SIZE = 9;

// Initialize empty grid
let samuraiGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
let originalGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
let solvedGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));

// Define the valid areas for each of the 5 sudoku puzzles
const PUZZLE_AREAS = {
    // Top-left 9x9
    topLeft: { startRow: 0, startCol: 0, endRow: 8, endCol: 8 },
    // Top-right 9x9
    topRight: { startRow: 0, startCol: 12, endRow: 8, endCol: 20 },
    // Bottom-left 9x9
    bottomLeft: { startRow: 12, startCol: 0, endRow: 20, endCol: 8 },
    // Bottom-right 9x9
    bottomRight: { startRow: 12, startCol: 12, endRow: 20, endCol: 20 },
    // Center 9x9
    center: { startRow: 6, startCol: 6, endRow: 14, endCol: 14 }
};

function isValidCell(row, col) {
    // Check if cell is part of any valid puzzle area
    for (const area of Object.values(PUZZLE_AREAS)) {
        if (row >= area.startRow && row <= area.endRow &&
            col >= area.startCol && col <= area.endCol) {
            return true;
        }
    }
    return false;
}

function getPuzzleArea(row, col) {
    // Return which puzzle area this cell belongs to
    for (const [name, area] of Object.entries(PUZZLE_AREAS)) {
        if (row >= area.startRow && row <= area.endRow &&
            col >= area.startCol && col <= area.endCol) {
            return name;
        }
    }
    return null;
}

function initializeSamuraiGrid() {
    // Create the samurai sudoku layout by marking invalid areas
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (!isValidCell(row, col)) {
                samuraiGrid[row][col] = -1; // Invalid area
            }
        }
    }
}

function generatePuzzle(difficulty = 'medium') {
    // Reset grids
    samuraiGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    originalGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    solvedGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));

    initializeSamuraiGrid();

    // Generate each of the 5 sudoku puzzles
    const areas = Object.values(PUZZLE_AREAS);

    for (const area of areas) {
        generateSudokuForArea(area);
    }

    // Copy to original and solved grids
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            originalGrid[row][col] = samuraiGrid[row][col];
            solvedGrid[row][col] = samuraiGrid[row][col];
        }
    }

    // Remove some numbers based on difficulty
    const cellsToRemove = {
        'easy': 0.3,
        'medium': 0.5,
        'hard': 0.7,
        'expert': 0.8
    };

    const removeRatio = cellsToRemove[difficulty] || 0.5;

    for (const area of areas) {
        for (let row = area.startRow; row <= area.endRow; row++) {
            for (let col = area.startCol; col <= area.endCol; col++) {
                if (Math.random() < removeRatio) {
                    samuraiGrid[row][col] = 0;
                }
            }
        }
    }

    updateDisplay();
}

function generateSudokuForArea(area) {
    // Simple sudoku generation for a 9x9 area
    // Fill with a valid sudoku solution
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (let row = area.startRow; row <= area.endRow; row++) {
        for (let col = area.startCol; col <= area.endCol; col++) {
            const localRow = row - area.startRow;
            const localCol = col - area.startCol;

            // Simple pattern: shift numbers diagonally
            const num = ((localRow * 3 + localCol) % 9) + 1;
            samuraiGrid[row][col] = num;
        }
    }

    // Shuffle to create a more random but valid puzzle
    shuffleArea(area);
}

function shuffleArea(area) {
    // Simple shuffle - swap rows and columns within boxes
    for (let i = 0; i < 3; i++) {
        // Shuffle rows within each horizontal band
        const bandStart = area.startRow + i * 3;
        shuffleRows(bandStart, area.startCol, area.endCol);
    }
}

function shuffleRows(startRow, startCol, endCol) {
    for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
            if (Math.random() < 0.5) {
                // Swap rows i and j
                const row1 = startRow + i;
                const row2 = startRow + j;
                for (let col = startCol; col <= endCol; col++) {
                    const temp = samuraiGrid[row1][col];
                    samuraiGrid[row1][col] = samuraiGrid[row2][col];
                    samuraiGrid[row2][col] = temp;
                }
            }
        }
    }
}

function renderGrid() {
    let output = '';

    // Add column numbers
    output += '   ';
    for (let col = 0; col < GRID_SIZE; col++) {
        if (col % 3 === 0 && col > 0) output += ' ';
        output += (col % 10).toString();
    }
    output += '\n';

    // Add top border
    output += '   ';
    for (let col = 0; col < GRID_SIZE; col++) {
        if (col % 3 === 0 && col > 0) output += ' ';
        output += '─';
    }
    output += '\n';

    for (let row = 0; row < GRID_SIZE; row++) {
        // Row number
        output += (row < 10 ? ' ' : '') + row.toString() + '│';

        for (let col = 0; col < GRID_SIZE; col++) {
            if (col % 3 === 0 && col > 0) output += '│';

            const cell = samuraiGrid[row][col];
            if (cell === -1) {
                output += '█'; // Invalid area
            } else if (cell === 0) {
                output += '·'; // Empty cell
            } else {
                output += cell.toString();
            }
        }

        output += '\n';

        // Horizontal separators between boxes
        if ((row + 1) % 3 === 0 && row < GRID_SIZE - 1) {
            output += '   ';
            for (let col = 0; col < GRID_SIZE; col++) {
                if (col % 3 === 0 && col > 0) output += ' ';
                output += '─';
            }
            output += '\n';
        }
    }

    return output;
}

function updateDisplay() {
    const display = document.getElementById('puzzleDisplay');
    display.textContent = renderGrid();
}

function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    statusDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

function handleCommand(command) {
    const cmd = command.trim().toUpperCase();
    const parts = cmd.split(/[ ,]+/);

    try {
        if (cmd === 'HINT') {
            showHint();
        } else if (cmd === 'CHECK') {
            checkSolution();
        } else if (cmd === 'SOLVE') {
            solvePuzzle();
        } else if (parts[0] === 'SET' && parts.length === 4) {
            const row = parseInt(parts[1]);
            const col = parseInt(parts[2]);
            const num = parseInt(parts[3]);

            if (isNaN(row) || isNaN(col) || isNaN(num)) {
                throw new Error('Invalid SET command format. Use: SET row,col,number');
            }

            setCell(row, col, num);
        } else if (parts[0] === 'CLEAR' && parts.length === 3) {
            const row = parseInt(parts[1]);
            const col = parseInt(parts[2]);

            if (isNaN(row) || isNaN(col)) {
                throw new Error('Invalid CLEAR command format. Use: CLEAR row,col');
            }

            setCell(row, col, 0);
        } else {
            throw new Error('Unknown command. Use SET row,col,num, CLEAR row,col, HINT, CHECK, or SOLVE');
        }
    } catch (error) {
        showStatus(error.message, 'error');
    }

    // Clear input
    document.getElementById('commandInput').value = '';
}

function setCell(row, col, num) {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
        throw new Error('Row and column must be between 0 and 20');
    }

    if (!isValidCell(row, col)) {
        throw new Error('This cell is not part of any puzzle area');
    }

    if (originalGrid[row][col] !== 0) {
        throw new Error('Cannot modify given numbers');
    }

    if (num < 0 || num > 9) {
        throw new Error('Number must be between 1 and 9, or 0 to clear');
    }

    // Check if number is valid in this position
    if (num !== 0 && !isValidMove(row, col, num)) {
        throw new Error(`Number ${num} conflicts with existing numbers in row, column, or box`);
    }

    samuraiGrid[row][col] = num;
    updateDisplay();

    if (num !== 0) {
        showStatus(`Set cell (${row},${col}) to ${num}`, 'success');
    } else {
        showStatus(`Cleared cell (${row},${col})`, 'info');
    }
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

    // Check 3x3 box within the puzzle area
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

function showHint() {
    // Find an empty cell and suggest a number
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (samuraiGrid[row][col] === 0 && isValidCell(row, col)) {
                // Try numbers 1-9
                for (let num = 1; num <= 9; num++) {
                    if (isValidMove(row, col, num)) {
                        showStatus(`Hint: Try setting cell (${row},${col}) to ${num}`, 'info');
                        return;
                    }
                }
            }
        }
    }

    showStatus('No hints available - puzzle may be complete or invalid', 'error');
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
        showStatus('Puzzle is not complete - some cells are still empty', 'error');
        return;
    }

    // Check validity
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (isValidCell(row, col)) {
                const num = samuraiGrid[row][col];
                samuraiGrid[row][col] = 0; // Temporarily clear to check
                if (!isValidMove(row, col, num)) {
                    valid = false;
                }
                samuraiGrid[row][col] = num; // Restore
            }
        }
    }

    if (valid) {
        showStatus('🎉 Congratulations! Puzzle is correctly solved!', 'success');
    } else {
        showStatus('❌ Solution contains errors. Check your numbers.', 'error');
    }
}

function solvePuzzle() {
    // Simple backtracking solver for demonstration
    showStatus('🤖 Solving puzzle...', 'info');

    setTimeout(() => {
        if (solveBacktracking()) {
            updateDisplay();
            showStatus('🎉 Puzzle solved automatically!', 'success');
        } else {
            showStatus('❌ Could not solve puzzle - may be invalid', 'error');
        }
    }, 100);
}

function solveBacktracking() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (samuraiGrid[row][col] === 0 && isValidCell(row, col)) {
                for (let num = 1; num <= 9; num++) {
                    if (isValidMove(row, col, num)) {
                        samuraiGrid[row][col] = num;

                        if (solveBacktracking()) {
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

function newPuzzle() {
    generatePuzzle('medium');
    showStatus('🎲 New samurai sudoku puzzle generated!', 'success');
}

function resetPuzzle() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            samuraiGrid[row][col] = originalGrid[row][col];
        }
    }
    updateDisplay();
    showStatus('🔄 Puzzle reset to original state', 'info');
}

function toggleHelp() {
    const instructions = document.querySelector('.instructions');
    instructions.style.display = instructions.style.display === 'none' ? 'block' : 'none';
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        const command = document.getElementById('commandInput').value;
        handleCommand(command);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    generatePuzzle('medium');
    document.getElementById('commandInput').focus();
});

// Export functions for button onclick handlers
window.newPuzzle = newPuzzle;
window.resetPuzzle = resetPuzzle;
window.showHint = showHint;
window.checkSolution = checkSolution;
window.solvePuzzle = solvePuzzle;
window.toggleHelp = toggleHelp;
window.handleKeyPress = handleKeyPress;