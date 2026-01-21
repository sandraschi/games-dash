// Color Sudoku Game - Numbers represented as colors
// **Timestamp**: 2025-12-26

let grid = Array(9).fill(null).map(() => Array(9).fill(0));
let solution = Array(9).fill(null).map(() => Array(9).fill(0));
let given = Array(9).fill(null).map(() => Array(9).fill(false));
let selectedCell = null;
let selectedColor = null;

// Color mapping for numbers 1-9
const COLOR_CLASSES = {
    1: 'color-1', // Red
    2: 'color-2', // Teal
    3: 'color-3', // Blue
    4: 'color-4', // Light Salmon
    5: 'color-5', // Mint
    6: 'color-6', // Yellow
    7: 'color-7', // Purple
    8: 'color-8', // Light Blue
    9: 'color-9'  // Orange
};

function renderGrid() {
    const gridElement = document.getElementById('colorGrid');
    gridElement.innerHTML = '';

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'color-cell';
            if (given[row][col]) cell.classList.add('given');
            if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
                cell.classList.add('selected');
            }

            const value = grid[row][col];
            if (value !== 0) {
                cell.classList.add(COLOR_CLASSES[value]);
            }

            cell.onclick = () => selectCell(row, col);
            gridElement.appendChild(cell);
        }
    }

    // Update color button selection
    updateColorButtons();
}

function selectCell(row, col) {
    if (given[row][col]) return;
    selectedCell = { row, col };
    renderGrid();
}

function selectColor(color) {
    selectedColor = color;
    updateColorButtons();
}

function updateColorButtons() {
    // Remove selected class from all buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Add selected class to current color button
    if (selectedColor) {
        const buttons = document.querySelectorAll('.color-btn');
        if (selectedColor >= 1 && selectedColor <= 9) {
            buttons[selectedColor - 1].classList.add('selected');
        }
    }
}

function placeColor(color) {
    if (!selectedCell) {
        alert('Please select a cell first!');
        return;
    }

    const { row, col } = selectedCell;
    if (given[row][col]) return;

    if (color === 0) {
        // Clear cell
        grid[row][col] = 0;
        renderGrid();
        return;
    }

    // Check if placement is valid
    if (isValid(grid, row, col, color)) {
        grid[row][col] = color;
        renderGrid();
    } else {
        // Show error briefly
        const cellElement = document.querySelector(`#colorGrid .color-cell:nth-child(${row * 9 + col + 1})`);
        cellElement.classList.add('error');
        setTimeout(() => {
            cellElement.classList.remove('error');
        }, 500);
    }
}

function isValid(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[boxRow + i][boxCol + j] === num) return false;
        }
    }

    return true;
}

function solveSudoku(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (solveSudoku(grid)) return true;
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function generateSudoku(difficulty) {
    // Create solution
    grid = Array(9).fill(null).map(() => Array(9).fill(0));

    // Fill diagonal 3x3 boxes (independent)
    for (let i = 0; i < 9; i += 3) {
        fillBox(i, i);
    }

    // Solve rest
    solveSudoku(grid);
    solution = grid.map(row => [...row]);

    // Remove numbers based on difficulty
    const remove = { easy: 30, medium: 45, hard: 55 }[difficulty];
    let removed = 0;

    while (removed < remove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (grid[row][col] !== 0) {
            grid[row][col] = 0;
            removed++;
        }
    }

    // Mark given cells
    given = grid.map(row => row.map(cell => cell !== 0));
}

function fillBox(row, col) {
    const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
    let idx = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            grid[row + i][col + j] = nums[idx++];
        }
    }
}

function checkSolution() {
    let correct = true;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                correct = false;
            } else if (grid[row][col] !== solution[row][col]) {
                correct = false;
            }
        }
    }

    if (correct) {
        alert('🎉 Congratulations! Color Sudoku solved correctly!');
        document.getElementById('status').textContent = 'SOLVED! Start new game.';
    } else {
        alert('❌ Not quite right. Keep trying!');
    }
}

function showHint() {
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                emptyCells.push({row, col});
            }
        }
    }

    if (emptyCells.length > 0) {
        const hint = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[hint.row][hint.col] = solution[hint.row][hint.col];
        renderGrid();
    }
}

function newGame(difficulty) {
    generateSudoku(difficulty);
    selectedCell = null;
    selectedColor = null;
    document.getElementById('status').textContent = `Playing ${difficulty.toUpperCase()} color puzzle`;
    renderGrid();
}

// Initialize
renderGrid();



