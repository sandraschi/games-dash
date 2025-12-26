// Samurai Sudoku Game with 5 overlapping grids
// **Timestamp**: 2025-12-26

// Grid layout: 21x21 total, 5 overlapping 9x9 grids
const GRID_SIZE = 21;
let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
let solution = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
let given = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
let selectedCell = null;

// Define the 5 grids in samurai layout
const GRIDS = {
    center: { startRow: 6, startCol: 6, size: 9 },
    topLeft: { startRow: 0, startCol: 0, size: 9 },
    topRight: { startRow: 0, startCol: 12, size: 9 },
    bottomLeft: { startRow: 12, startCol: 0, size: 9 },
    bottomRight: { startRow: 12, startCol: 12, size: 9 }
};

// Check if a cell belongs to any grid
function isValidCell(row, col) {
    for (const [name, gridInfo] of Object.entries(GRIDS)) {
        const endRow = gridInfo.startRow + gridInfo.size;
        const endCol = gridInfo.startCol + gridInfo.size;
        if (row >= gridInfo.startRow && row < endRow &&
            col >= gridInfo.startCol && col < endCol) {
            return true;
        }
    }
    return false;
}

// Check if a cell belongs to a specific grid
function belongsToGrid(row, col, gridName) {
    const gridInfo = GRIDS[gridName];
    const endRow = gridInfo.startRow + gridInfo.size;
    const endCol = gridInfo.startCol + gridInfo.size;
    return row >= gridInfo.startRow && row < endRow &&
           col >= gridInfo.startCol && col < endCol;
}

// Get all grids that contain a specific cell
function getGridsForCell(row, col) {
    const grids = [];
    for (const [name, gridInfo] of Object.entries(GRIDS)) {
        if (belongsToGrid(row, col, name)) {
            grids.push(name);
        }
    }
    return grids;
}

function renderGrid() {
    const gridElement = document.getElementById('samuraiGrid');
    gridElement.innerHTML = '';

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'samurai-cell';

            if (!isValidCell(row, col)) {
                cell.classList.add('empty');
                gridElement.appendChild(cell);
                continue;
            }

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
    if (!isValidCell(row, col)) return;
    if (given[row][col]) return;
    selectedCell = { row, col };
    renderGrid();
}

function placeNumber(num) {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (!isValidCell(row, col) || given[row][col]) return;

    // Validate against all grids that contain this cell
    const gridsForCell = getGridsForCell(row, col);
    let isValidPlacement = true;

    for (const gridName of gridsForCell) {
        if (!isValidInGrid(row, col, num, gridName)) {
            isValidPlacement = false;
            break;
        }
    }

    if (isValidPlacement) {
        grid[row][col] = num;
        renderGrid();
    }
}

function isValidInGrid(row, col, num, gridName) {
    const gridInfo = GRIDS[gridName];

    // Convert to local grid coordinates
    const localRow = row - gridInfo.startRow;
    const localCol = col - gridInfo.startCol;

    // Check row within this grid
    for (let c = 0; c < gridInfo.size; c++) {
        const globalCol = gridInfo.startCol + c;
        if (isValidCell(gridInfo.startRow + localRow, globalCol) &&
            grid[gridInfo.startRow + localRow][globalCol] === num) {
            return false;
        }
    }

    // Check column within this grid
    for (let r = 0; r < gridInfo.size; r++) {
        const globalRow = gridInfo.startRow + r;
        if (isValidCell(globalRow, gridInfo.startCol + localCol) &&
            grid[globalRow][gridInfo.startCol + localCol] === num) {
            return false;
        }
    }

    // Check 3x3 box within this grid
    const boxRow = Math.floor(localRow / 3) * 3;
    const boxCol = Math.floor(localCol / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const globalRow = gridInfo.startRow + boxRow + i;
            const globalCol = gridInfo.startCol + boxCol + j;
            if (isValidCell(globalRow, globalCol) &&
                grid[globalRow][globalCol] === num) {
                return false;
            }
        }
    }

    return true;
}

function solveSamuraiSudoku() {
    // Find empty cell
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (isValidCell(row, col) && grid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    // Check if valid in all grids containing this cell
                    const gridsForCell = getGridsForCell(row, col);
                    let isValid = true;

                    for (const gridName of gridsForCell) {
                        if (!isValidInGrid(row, col, num, gridName)) {
                            isValid = false;
                            break;
                        }
                    }

                    if (isValid) {
                        grid[row][col] = num;
                        if (solveSamuraiSudoku()) {
                            return true;
                        }
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function generateSamuraiSudoku(difficulty) {
    // Initialize grids
    grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    solution = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

    // Generate each grid independently first
    for (const [gridName, gridInfo] of Object.entries(GRIDS)) {
        generateSingleGrid(gridName, gridInfo);
    }

    // Copy to solution
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            solution[row][col] = grid[row][col];
        }
    }

    // Remove numbers based on difficulty
    const remove = { easy: 120, medium: 160, hard: 190 }[difficulty];
    let removed = 0;

    // Create list of valid cells
    const validCells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (isValidCell(row, col)) {
                validCells.push({row, col});
            }
        }
    }

    // Shuffle and remove cells
    for (let i = validCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [validCells[i], validCells[j]] = [validCells[j], validCells[i]];
    }

    for (const cell of validCells) {
        if (removed >= remove) break;

        const temp = grid[cell.row][cell.col];
        grid[cell.row][cell.col] = 0;

        // Check if still solvable
        const testGrid = grid.map(row => [...row]);
        if (isSolvable(testGrid)) {
            removed++;
        } else {
            grid[cell.row][cell.col] = temp;
        }
    }

    // Mark given cells
    given = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            given[row][col] = grid[row][col] !== 0;
        }
    }
}

function generateSingleGrid(gridName, gridInfo) {
    // Fill diagonal 3x3 boxes
    for (let i = 0; i < 9; i += 3) {
        fillBox(gridInfo.startRow + i, gridInfo.startCol + i);
    }

    // Solve the rest
    solveSamuraiSudoku();
}

function fillBox(row, col) {
    const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
    let idx = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (isValidCell(row + i, col + j)) {
                grid[row + i][col + j] = nums[idx++];
            }
        }
    }
}

function isSolvable(testGrid) {
    // Simple check - try to solve and see if it works
    const originalGrid = grid.map(row => [...row]);
    grid = testGrid.map(row => [...row]);

    const solvable = solveSamuraiSudoku();

    grid = originalGrid;
    return solvable;
}

function checkSolution() {
    let correct = true;

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (isValidCell(row, col)) {
                if (grid[row][col] === 0) {
                    correct = false;
                } else if (grid[row][col] !== solution[row][col]) {
                    correct = false;
                }
            }
        }
    }

    if (correct) {
        alert('🎉 Congratulations! Samurai Sudoku solved correctly!');
        document.getElementById('status').textContent = 'SOLVED! Start new game.';
    } else {
        alert('❌ Not quite right. Keep trying!');
    }
}

function showHint() {
    // Find empty cells
    const emptyCells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (isValidCell(row, col) && grid[row][col] === 0) {
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
    generateSamuraiSudoku(difficulty);
    selectedCell = null;
    document.getElementById('status').textContent = `Playing ${difficulty.toUpperCase()} samurai puzzle`;
    renderGrid();
}

// Initialize
renderGrid();



