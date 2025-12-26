// Letters Sudoku Game with multiple variants
// **Timestamp**: 2025-12-26

let grid = [];
let solution = [];
let given = [];
let selectedCell = null;
let selectedLetter = null;
let currentVariant = 'letters-9';
let currentLetters = [];
let gridSize = 9;
let boxSize = 3;

// Letter sets for different variants
const LETTER_SETS = {
    'aeiou': ['A', 'E', 'I', 'O', 'U'],
    'first13': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substring(0, 13).split(''),
    'full26': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'consonants': 'BCDFGHJKLMNPQRSTVWXYZ'.split(''),
    'vowels': ['A', 'E', 'I', 'O', 'U', 'Y'],
    'word-9': 'ABCDEFGHI'.split(''), // For word puzzles
    'letters-16': 'ABCDEFGHIJKLMNOP'.split('') // A-P for 16x16
};

// Word list for word sudoku
const WORD_LIST = [
    'ELEPHANT', 'BUTTERFLY', 'RAINBOW', 'SUNSHINE', 'OCEAN', 'MOUNTAIN', 'FOREST', 'RIVER', 'DESERT', 'VOLCANO',
    'DIAMOND', 'EMERALD', 'SAPPHIRE', 'RUBY', 'PEARL', 'CORAL', 'JADE', 'AMBER', 'OPAL', 'TOPAZ',
    'ELEPHANT', 'GIRAFFE', 'LION', 'TIGER', 'BEAR', 'WOLF', 'FOX', 'DEER', 'RABBIT', 'SQUIRREL'
];

let currentWord = '';

function initializeGrid(size) {
    gridSize = size;
    boxSize = size === 9 ? 3 : 4; // 3x3 boxes for 9x9, 4x4 boxes for 16x16

    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    solution = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    given = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));

    // Update grid CSS class
    const gridElement = document.getElementById('lettersGrid');
    gridElement.className = `letters-grid grid-${gridSize}x${gridSize}`;
}

function renderGrid() {
    const gridElement = document.getElementById('lettersGrid');
    gridElement.innerHTML = '';

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'letter-cell';
            if (given[row][col]) cell.classList.add('given');
            if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
                cell.classList.add('selected');
            }

            const value = grid[row][col];
            cell.textContent = value ? currentLetters[value - 1] : '';
            cell.onclick = () => selectCell(row, col);
            gridElement.appendChild(cell);
        }
    }

    updateLettersPad();
}

function selectCell(row, col) {
    if (given[row][col]) return;
    selectedCell = { row, col };
    renderGrid();
}

function selectLetter(letterIndex) {
    selectedLetter = letterIndex + 1; // Convert to 1-based index
    updateLettersPad();
}

function updateLettersPad() {
    const padElement = document.getElementById('lettersPad');
    padElement.innerHTML = '';

    // Add letter buttons
    currentLetters.forEach((letter, index) => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter;
        if (selectedLetter === index + 1) {
            btn.classList.add('selected');
        }
        btn.onclick = () => selectLetter(index);
        padElement.appendChild(btn);
    });

    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'letter-btn';
    clearBtn.textContent = '❌';
    clearBtn.onclick = () => placeLetter(0);
    padElement.appendChild(clearBtn);
}

function placeLetter(letterIndex) {
    if (!selectedCell) {
        alert('Please select a cell first!');
        return;
    }

    const { row, col } = selectedCell;
    if (given[row][col]) return;

    if (letterIndex === 0) {
        // Clear cell
        grid[row][col] = 0;
        renderGrid();
        return;
    }

    // Check if placement is valid
    if (isValid(grid, row, col, letterIndex)) {
        grid[row][col] = letterIndex;
        renderGrid();
    } else {
        // Show error briefly
        const cellElement = document.querySelector(`#lettersGrid .letter-cell:nth-child(${row * gridSize + col + 1})`);
        cellElement.classList.add('error');
        setTimeout(() => {
            cellElement.classList.remove('error');
        }, 500);
    }
}

function isValid(grid, row, col, letterIndex) {
    // Check row
    for (let x = 0; x < gridSize; x++) {
        if (grid[row][x] === letterIndex) return false;
    }

    // Check column
    for (let x = 0; x < gridSize; x++) {
        if (grid[x][col] === letterIndex) return false;
    }

    // Check box
    const boxRow = Math.floor(row / boxSize) * boxSize;
    const boxCol = Math.floor(col / boxSize) * boxSize;
    for (let i = 0; i < boxSize; i++) {
        for (let j = 0; j < boxSize; j++) {
            if (grid[boxRow + i][boxCol + j] === letterIndex) return false;
        }
    }

    return true;
}

function solveLettersSudoku(grid) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === 0) {
                const lettersToTry = getShuffledLetters();
                for (const letterIndex of lettersToTry) {
                    if (isValid(grid, row, col, letterIndex)) {
                        grid[row][col] = letterIndex;
                        if (solveLettersSudoku(grid)) return true;
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function getShuffledLetters() {
    const indices = Array.from({length: currentLetters.length}, (_, i) => i + 1);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
}

function generateLettersSudoku(difficulty) {
    initializeGrid(gridSize);

    if (currentVariant === 'word-9') {
        generateWordPuzzle();
        return;
    }

    // Fill diagonal boxes
    for (let i = 0; i < gridSize; i += boxSize) {
        fillBox(i, i);
    }

    // Solve the rest
    solveLettersSudoku(grid);
    solution = grid.map(row => [...row]);

    // Remove letters based on difficulty
    const remove = { easy: Math.floor(gridSize * gridSize * 0.4), medium: Math.floor(gridSize * gridSize * 0.55), hard: Math.floor(gridSize * gridSize * 0.65) }[difficulty];
    let removed = 0;

    // Create list of all cells
    const allCells = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            allCells.push({row, col});
        }
    }

    // Shuffle and remove
    for (let i = allCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
    }

    for (const cell of allCells) {
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
    given = grid.map(row => row.map(cell => cell !== 0));
}

function generateWordPuzzle() {
    // Select a random word
    currentWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    currentLetters = [...new Set(currentWord.split(''))].sort();

    // Create a simple puzzle using the word letters
    const wordLetters = currentWord.split('');
    const uniqueLetters = [...new Set(wordLetters)];
    currentLetters = uniqueLetters;

    // Create a pattern based on the word
    for (let i = 0; i < Math.min(9, wordLetters.length); i++) {
        const letterIndex = uniqueLetters.indexOf(wordLetters[i]) + 1;
        const row = Math.floor(i / 3);
        const col = i % 3;
        if (row < 3 && col < 3) {
            grid[row][col] = letterIndex;
        }
    }

    // Fill in some more letters to make it solvable
    solveLettersSudoku(grid);
    solution = grid.map(row => [...row]);

    // Remove some letters to create the puzzle
    let removed = 0;
    const toRemove = 40; // Remove about 40 cells

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (removed >= toRemove) break;
            if (grid[row][col] !== 0 && Math.random() < 0.5) {
                grid[row][col] = 0;
                removed++;
            }
        }
    }

    given = grid.map(row => row.map(cell => cell !== 0));

    // Display the word
    displayWord();
}

function displayWord() {
    const wordDisplay = document.getElementById('wordDisplay');
    if (currentVariant === 'word-9' && currentWord) {
        wordDisplay.style.display = 'block';
        const wordLetters = currentWord.split('');
        wordDisplay.innerHTML = '<strong>Spell:</strong> ' +
            wordLetters.map(letter => `<span>${letter}</span>`).join('');
    } else {
        wordDisplay.style.display = 'none';
    }
}

function fillBox(row, col) {
    const lettersToUse = getShuffledLetters();
    let idx = 0;
    for (let i = 0; i < boxSize; i++) {
        for (let j = 0; j < boxSize; j++) {
            if (idx < lettersToUse.length) {
                grid[row + i][col + j] = lettersToUse[idx++];
            }
        }
    }
}

function isSolvable(testGrid) {
    const originalGrid = grid.map(row => [...row]);
    grid = testGrid.map(row => [...row]);

    const solvable = solveLettersSudoku(grid);

    grid = originalGrid;
    return solvable;
}

function checkSolution() {
    let correct = true;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === 0) {
                correct = false;
            } else if (grid[row][col] !== solution[row][col]) {
                correct = false;
            }
        }
    }

    if (correct) {
        alert('🎉 Congratulations! Letters Sudoku solved correctly!');
        document.getElementById('status').textContent = 'SOLVED! Start new game.';
    } else {
        alert('❌ Not quite right. Keep trying!');
    }
}

function showHint() {
    const emptyCells = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
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

function switchVariant(variant) {
    currentVariant = variant;

    // Update button states
    document.querySelectorAll('.variant-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchVariant('${variant}')"]`).classList.add('active');

    // Show/hide letter set selector
    const letterSetSelector = document.getElementById('letterSetSelector');
    letterSetSelector.style.display = variant === 'custom' ? 'block' : 'none';

    // Set default letter set based on variant
    switch (variant) {
        case 'letters-9':
            setLetterSet('word-9');
            gridSize = 9;
            break;
        case 'word-9':
            setLetterSet('word-9');
            gridSize = 9;
            break;
        case 'letters-16':
            setLetterSet('letters-16');
            gridSize = 16;
            break;
        case 'custom':
            // Wait for user to select letter set
            break;
    }

    updateLetterSetInfo();
    selectedCell = null;
    selectedLetter = null;
}

function setLetterSet(setName) {
    currentLetters = [...LETTER_SETS[setName]];
    gridSize = setName === 'letters-16' ? 16 : 9;
    updateLetterSetInfo();
    displayWord();
}

function updateLetterSetInfo() {
    const info = document.getElementById('letterSetInfo');
    let text = `Using letters ${currentLetters.join('')} • Each row, column, and box contains each letter exactly once`;

    if (currentVariant === 'word-9') {
        text = `Using 9 letters to spell words • Each row, column, and box contains each letter exactly once`;
    } else if (currentVariant === 'letters-16') {
        text = `Using letters A-P (16×16 Mega Sudoku) • Each row, column, and box contains each letter exactly once`;
    }

    info.textContent = text;
}

function newGame(difficulty) {
    generateLettersSudoku(difficulty);
    selectedCell = null;
    selectedLetter = null;
    document.getElementById('status').textContent = `Playing ${difficulty.toUpperCase()} ${currentVariant.replace('-', ' ')} puzzle`;
    renderGrid();
}

// Initialize
switchVariant('letters-9');
renderGrid();



