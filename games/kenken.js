// KenKen Game Implementation
// **Timestamp**: 2025-12-04

let size = 3;
let grid = [];
let solution = [];
let cages = [];
let selectedCell = null;

const OPERATIONS = ['+', '-', '×', '÷'];

function setDifficulty(newSize) {
    size = newSize;
    
    // Update button states
    [3, 4, 5, 6].forEach(s => {
        const btn = document.getElementById(`btn-${s}`);
        if (btn) {
            if (s === size) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
    
    // Show/hide number buttons
    [4, 5, 6].forEach(n => {
        const btn = document.getElementById(`btn-num-${n}`);
        if (btn) {
            btn.style.display = n <= size ? 'block' : 'none';
        }
    });
    
    newPuzzle();
}

function newPuzzle() {
    generateSolution();
    generateCages();
    renderGrid();
    updateStatus(`New ${size}×${size} KenKen puzzle generated!`);
}

function generateSolution() {
    // Generate a valid Latin square
    solution = [];
    const numbers = Array.from({length: size}, (_, i) => i + 1);
    
    for (let row = 0; row < size; row++) {
        solution[row] = [];
        for (let col = 0; col < size; col++) {
            // Rotate numbers based on row
            solution[row][col] = numbers[(col + row) % size];
        }
    }
    
    // Shuffle rows and columns to make it more random
    for (let i = 0; i < size * 2; i++) {
        const r1 = Math.floor(Math.random() * size);
        const r2 = Math.floor(Math.random() * size);
        [solution[r1], solution[r2]] = [solution[r2], solution[r1]];
    }
    
    grid = Array(size).fill(null).map(() => Array(size).fill(0));
}

function generateCages() {
    cages = [];
    const used = Array(size).fill(null).map(() => Array(size).fill(false));
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (used[row][col]) continue;
            
            const cage = {
                cells: [{row, col}],
                target: null,
                operation: null
            };
            used[row][col] = true;
            
            // Randomly grow the cage
            const cageSize = Math.floor(Math.random() * 3) + 1; // 1-3 cells
            for (let i = 1; i < cageSize; i++) {
                const lastCell = cage.cells[cage.cells.length - 1];
                const neighbors = [
                    {row: lastCell.row + 1, col: lastCell.col},
                    {row: lastCell.row, col: lastCell.col + 1},
                    {row: lastCell.row - 1, col: lastCell.col},
                    {row: lastCell.row, col: lastCell.col - 1}
                ].filter(c => 
                    c.row >= 0 && c.row < size && 
                    c.col >= 0 && c.col < size && 
                    !used[c.row][c.col]
                );
                
                if (neighbors.length === 0) break;
                
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                cage.cells.push(next);
                used[next.row][next.col] = true;
            }
            
            // Calculate target and operation
            const values = cage.cells.map(c => solution[c.row][c.col]);
            
            if (cage.cells.length === 1) {
                // Single cell - no operation
                cage.target = values[0];
                cage.operation = '';
            } else {
                // Choose random operation
                const op = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
                cage.operation = op;
                
                switch(op) {
                    case '+':
                        cage.target = values.reduce((a, b) => a + b, 0);
                        break;
                    case '×':
                        cage.target = values.reduce((a, b) => a * b, 1);
                        break;
                    case '-':
                        cage.target = Math.abs(values[0] - values[1]);
                        break;
                    case '÷':
                        cage.target = Math.max(...values) / Math.min(...values);
                        break;
                }
            }
            
            cages.push(cage);
        }
    }
}

function renderGrid() {
    const gridElement = document.getElementById('kenkenGrid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${size}, 60px)`;
    gridElement.style.gridTemplateRows = `repeat(${size}, 60px)`;
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement('div');
            cell.className = 'kenken-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add cage borders
            const cage = cages.find(c => c.cells.some(cell => cell.row === row && cell.col === col));
            if (cage) {
                const isTop = !cage.cells.some(c => c.row === row - 1 && c.col === col);
                const isBottom = !cage.cells.some(c => c.row === row + 1 && c.col === col);
                const isLeft = !cage.cells.some(c => c.row === row && c.col === col - 1);
                const isRight = !cage.cells.some(c => c.row === row && c.col === col + 1);
                
                if (isTop) cell.classList.add('cage-top');
                if (isBottom) cell.classList.add('cage-bottom');
                if (isLeft) cell.classList.add('cage-left');
                if (isRight) cell.classList.add('cage-right');
                
                // Add label to first cell of cage
                if (cage.cells[0].row === row && cage.cells[0].col === col) {
                    const label = document.createElement('div');
                    label.className = 'cage-label';
                    label.textContent = `${cage.target}${cage.operation}`;
                    cell.appendChild(label);
                }
            }
            
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.row = row;
            input.dataset.col = col;
            
            input.addEventListener('focus', () => selectCell(row, col));
            input.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= size) {
                    grid[row][col] = val;
                    updateProgress();
                } else if (e.target.value === '') {
                    grid[row][col] = 0;
                    updateProgress();
                } else {
                    e.target.value = '';
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') moveSelection(0, 1);
                if (e.key === 'ArrowLeft') moveSelection(0, -1);
                if (e.key === 'ArrowDown') moveSelection(1, 0);
                if (e.key === 'ArrowUp') moveSelection(-1, 0);
            });
            
            if (grid[row][col] > 0) {
                input.value = grid[row][col];
            }
            
            cell.appendChild(input);
            gridElement.appendChild(cell);
        }
    }
}

function selectCell(row, col) {
    selectedCell = {row, col};
    
    document.querySelectorAll('.kenken-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    const cell = document.querySelector(`.kenken-cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.add('selected');
}

function placeNumber(num) {
    if (!selectedCell) return;
    
    const {row, col} = selectedCell;
    grid[row][col] = num;
    
    const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
    if (input) {
        input.value = num > 0 ? num : '';
    }
    
    updateProgress();
    
    // Move to next cell
    moveSelection(0, 1);
}

function moveSelection(dRow, dCol) {
    if (!selectedCell) return;
    
    let newRow = selectedCell.row + dRow;
    let newCol = selectedCell.col + dCol;
    
    if (newRow < 0) newRow = size - 1;
    if (newRow >= size) newRow = 0;
    if (newCol < 0) newCol = size - 1;
    if (newCol >= size) newCol = 0;
    
    const input = document.querySelector(`input[data-row="${newRow}"][data-col="${newCol}"]`);
    if (input) input.focus();
}

function checkSolution() {
    let correct = 0;
    let total = size * size;
    
    // Check each cell
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.querySelector(`.kenken-cell[data-row="${row}"][data-col="${col}"]`);
            cell.classList.remove('correct', 'wrong');
            
            if (grid[row][col] === solution[row][col]) {
                cell.classList.add('correct');
                correct++;
            } else if (grid[row][col] > 0) {
                cell.classList.add('wrong');
            }
        }
    }
    
    if (correct === total) {
        updateStatus('🎉 PERFECT! You solved the KenKen puzzle!');
    } else {
        updateStatus(`${correct}/${total} correct (${Math.round(correct/total*100)}%)`);
    }
}

function clearGrid() {
    grid = Array(size).fill(null).map(() => Array(size).fill(0));
    renderGrid();
    updateProgress();
}

function updateProgress() {
    let filled = 0;
    let total = size * size;
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (grid[row][col] > 0) filled++;
        }
    }
    
    const progress = total > 0 ? Math.round((filled / total) * 100) : 0;
    document.getElementById('progress').textContent = `${progress}%`;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize
setDifficulty(3);

