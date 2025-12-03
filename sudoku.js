// Sudoku Game with Generator and Solver
// **Timestamp**: 2025-12-03

let grid = Array(9).fill(null).map(() => Array(9).fill(0));
let solution = Array(9).fill(null).map(() => Array(9).fill(0));
let given = Array(9).fill(null).map(() => Array(9).fill(false));
let selectedCell = null;

function renderGrid() {
    const gridElement = document.getElementById('sudokuGrid');
    gridElement.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            if (given[row][col]) cell.classList.add('given');
            if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
                cell.classList.add('selected');
            }
            
            cell.textContent = grid[row][col] || '';
            cell.onclick = () => selectCell(row, col);
            gridElement.appendChild(cell);
        }
    }
}

function selectCell(row, col) {
    if (given[row][col]) return;
    selectedCell = { row, col };
    renderGrid();
}

function placeNumber(num) {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    if (given[row][col]) return;
    
    grid[row][col] = num;
    renderGrid();
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
        alert('🎉 Congratulations! Puzzle solved correctly!');
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
    document.getElementById('status').textContent = `Playing ${difficulty.toUpperCase()} puzzle`;
    renderGrid();
}

// Initialize
renderGrid();

