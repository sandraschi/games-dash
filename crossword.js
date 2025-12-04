// Crossword Game Implementation
// **Timestamp**: 2025-12-04

let currentPuzzle = null;
let userAnswers = {};
let selectedCell = null;
let currentDirection = 'across';

// Built-in crossword puzzles
const PUZZLES = [
    {
        // Mini 5x5 puzzle
        name: "Mini Puzzle",
        difficulty: "easy",
        size: 5,
        grid: [
            ['C', 'A', 'T', 'S', '#'],
            ['A', '#', 'A', '#', 'S'],
            ['R', 'U', 'N', 'S', 'H'],
            ['#', 'N', '#', 'U', 'O'],
            ['#', '#', '#', 'N', 'P']
        ],
        across: {
            1: {clue: "Feline pets", answer: "CATS", row: 0, col: 0},
            3: {clue: "Moves quickly on foot", answer: "RUNS", row: 2, col: 0},
            5: {clue: "Store or retail place", answer: "SHOP", row: 2, col: 4}
        },
        down: {
            1: {clue: "Vehicle for transport", answer: "CAR", row: 0, col: 0},
            2: {clue: "Where you go for beach fun", answer: "SUN", row: 0, col: 3},
            4: {clue: "Opposite of 'before'", answer: "TUNS", row: 0, col: 2}
        }
    },
    {
        // Easy 7x7 puzzle
        name: "Easy Crossword",
        difficulty: "easy",
        size: 7,
        grid: [
            ['B', 'O', 'O', 'K', '#', '#', '#'],
            ['#', 'N', '#', '#', 'C', 'A', 'T'],
            ['#', '#', 'P', 'L', 'A', 'Y', '#'],
            ['D', 'O', 'G', '#', 'K', '#', '#'],
            ['#', 'U', '#', 'R', 'E', 'A', 'D'],
            ['#', 'T', '#', '#', '#', 'R', '#'],
            ['#', '#', '#', '#', '#', '#', '#']
        ],
        across: {
            1: {clue: "Something you read", answer: "BOOK", row: 0, col: 0},
            5: {clue: "Feline pet", answer: "CAT", row: 1, col: 4},
            7: {clue: "Children do this for fun", answer: "PLAY", row: 2, col: 2},
            8: {clue: "Canine pet", answer: "DOG", row: 3, col: 0},
            10: {clue: "Look at words in a book", answer: "READ", row: 4, col: 3}
        },
        down: {
            2: {clue: "Preposition (used before 'the')", answer: "ON", row: 0, col: 1},
            3: {clue: "Leave; exit", answer: "OUT", row: 0, col: 1},
            4: {clue: "Dessert course", answer: "CAKE", row: 0, col: 3},
            6: {clue: "Not 'no'", answer: "AYE", row: 1, col: 5},
            9: {clue: "Hearing organ", answer: "EAR", row: 3, col: 5}
        }
    },
    {
        // Medium 10x10 puzzle
        name: "Medium Crossword",
        difficulty: "medium",
        size: 10,
        grid: [
            ['C', 'O', 'M', 'P', 'U', 'T', 'E', 'R', '#', '#'],
            ['#', 'C', '#', '#', '#', '#', 'A', '#', 'M', 'A'],
            ['#', 'E', '#', 'G', 'A', 'M', 'E', 'S', 'O', 'T'],
            ['#', 'A', '#', '#', '#', '#', 'D', '#', 'U', 'H'],
            ['W', 'N', 'O', 'R', 'D', 'S', '#', '#', 'S', '#'],
            ['#', '#', '#', '#', '#', '#', 'P', 'I', 'E', '#'],
            ['#', 'M', 'U', 'S', 'I', 'C', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', 'O', '#', 'A', 'R', 'T'],
            ['#', '#', '#', '#', '#', 'D', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', 'E', '#', '#', '#', '#']
        ],
        across: {
            1: {clue: "Device for typing and browsing", answer: "COMPUTER", row: 0, col: 0},
            8: {clue: "Mathematical subject", answer: "MATH", row: 1, col: 6},
            10: {clue: "Entertainment software", answer: "GAMES", row: 2, col: 3},
            15: {clue: "Letters that make sentences", answer: "WORDS", row: 4, col: 0},
            18: {clue: "Dessert you bake", answer: "PIE", row: 5, col: 5},
            20: {clue: "Sounds and melodies", answer: "MUSIC", row: 6, col: 1},
            25: {clue: "Creative visual work", answer: "ART", row: 7, col: 7}
        },
        down: {
            2: {clue: "Large body of water", answer: "OCEAN", row: 0, col: 1},
            5: {clue: "Consumed food", answer: "ATE", row: 0, col: 6},
            7: {clue: "Rodent; computer device", answer: "MOUSE", row: 1, col: 8},
            12: {clue: "To peruse text", answer: "READ", row: 2, col: 6},
            17: {clue: "Computer encoding", answer: "CODE", row: 4, col: 5}
        }
    },
    {
        // Hard 12x12 puzzle
        name: "Hard Crossword",
        difficulty: "hard",
        size: 12,
        grid: [
            ['P', 'R', 'O', 'G', 'R', 'A', 'M', 'M', 'I', 'N', 'G', '#'],
            ['#', '#', 'B', '#', '#', '#', '#', '#', 'N', '#', '#', 'J'],
            ['#', '#', 'J', '#', 'T', 'E', 'C', 'H', 'N', 'O', 'L', 'O'],
            ['#', '#', 'E', '#', '#', '#', '#', '#', 'O', '#', '#', 'Y'],
            ['A', 'L', 'G', 'O', 'R', 'I', 'T', 'H', 'M', '#', '#', '#'],
            ['#', '#', 'C', '#', '#', '#', '#', '#', 'A', '#', '#', 'D'],
            ['#', '#', 'T', '#', 'D', 'A', 'T', 'A', 'T', 'I', 'O', 'N'],
            ['#', '#', '#', '#', '#', '#', '#', '#', 'I', '#', '#', '#'],
            ['S', 'O', 'F', 'T', 'W', 'A', 'R', 'E', 'O', 'N', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', 'N', '#', 'C', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', 'E', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        across: {
            1: {clue: "Writing code for computers", answer: "PROGRAMMING", row: 0, col: 0},
            10: {clue: "Word for happiness and delight", answer: "JOY", row: 1, col: 9},
            12: {clue: "Modern tools and innovations", answer: "TECHNOLOGY", row: 2, col: 4},
            15: {clue: "Step-by-step procedure", answer: "ALGORITHM", row: 4, col: 0},
            20: {clue: "Information in digital form", answer: "DATATION", row: 6, col: 4},
            25: {clue: "Programs and applications", answer: "SOFTWARE", row: 8, col: 0}
        },
        down: {
            3: {clue: "Thing or item", answer: "OBJECT", row: 0, col: 2},
            7: {clue: "Creating something new", answer: "INNOVATION", row: 0, col: 8},
            18: {clue: "Ocean, short for", answer: "OCE", row: 8, col: 10}
        }
    }
];

function loadPuzzle(index) {
    currentPuzzle = PUZZLES[index];
    userAnswers = {};
    selectedCell = null;
    
    renderGrid();
    renderClues();
    updateStatus(`Puzzle loaded: ${currentPuzzle.name}`);
    updateProgress();
}

function renderGrid() {
    const gridElement = document.getElementById('crosswordGrid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${currentPuzzle.size}, 40px)`;
    gridElement.style.gridTemplateRows = `repeat(${currentPuzzle.size}, 40px)`;
    
    const clueNumbers = getClueNumbers();
    
    for (let row = 0; row < currentPuzzle.size; row++) {
        for (let col = 0; col < currentPuzzle.size; col++) {
            const cell = document.createElement('div');
            cell.className = 'crossword-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (currentPuzzle.grid[row][col] === '#') {
                cell.classList.add('black');
            } else {
                const input = document.createElement('input');
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;
                
                input.addEventListener('input', (e) => handleInput(e, row, col));
                input.addEventListener('focus', () => selectCell(row, col));
                input.addEventListener('keydown', (e) => handleKeyDown(e, row, col));
                
                // Add clue number if this cell starts a word
                const clueNum = clueNumbers[`${row},${col}`];
                if (clueNum) {
                    const numSpan = document.createElement('span');
                    numSpan.className = 'clue-number';
                    numSpan.textContent = clueNum;
                    cell.appendChild(numSpan);
                }
                
                cell.appendChild(input);
            }
            
            gridElement.appendChild(cell);
        }
    }
}

function getClueNumbers() {
    const numbers = {};
    let num = 1;
    
    for (let row = 0; row < currentPuzzle.size; row++) {
        for (let col = 0; col < currentPuzzle.size; col++) {
            if (currentPuzzle.grid[row][col] === '#') continue;
            
            let isStart = false;
            
            // Check if this starts an across word
            if ((col === 0 || currentPuzzle.grid[row][col - 1] === '#') &&
                col + 1 < currentPuzzle.size && currentPuzzle.grid[row][col + 1] !== '#') {
                isStart = true;
            }
            
            // Check if this starts a down word
            if ((row === 0 || currentPuzzle.grid[row - 1][col] === '#') &&
                row + 1 < currentPuzzle.size && currentPuzzle.grid[row + 1][col] !== '#') {
                isStart = true;
            }
            
            if (isStart) {
                numbers[`${row},${col}`] = num++;
            }
        }
    }
    
    return numbers;
}

function renderClues() {
    const acrossElement = document.getElementById('acrossClues');
    const downElement = document.getElementById('downClues');
    
    acrossElement.innerHTML = '';
    downElement.innerHTML = '';
    
    for (const [num, data] of Object.entries(currentPuzzle.across)) {
        const clue = document.createElement('div');
        clue.className = 'clue-item';
        clue.textContent = `${num}. ${data.clue}`;
        clue.onclick = () => highlightWord(data, 'across');
        acrossElement.appendChild(clue);
    }
    
    for (const [num, data] of Object.entries(currentPuzzle.down)) {
        const clue = document.createElement('div');
        clue.className = 'clue-item';
        clue.textContent = `${num}. ${data.clue}`;
        clue.onclick = () => highlightWord(data, 'down');
        downElement.appendChild(clue);
    }
}

function selectCell(row, col) {
    selectedCell = {row, col};
    
    // Remove previous selections
    document.querySelectorAll('.crossword-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // Highlight current cell
    const cells = document.querySelectorAll(`.crossword-cell[data-row="${row}"][data-col="${col}"]`);
    cells.forEach(cell => cell.classList.add('selected'));
}

function highlightWord(wordData, direction) {
    currentDirection = direction;
    const {row, col, answer} = wordData;
    
    // Clear previous highlights
    document.querySelectorAll('.crossword-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // Highlight word cells
    for (let i = 0; i < answer.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;
        const cell = document.querySelector(`.crossword-cell[data-row="${r}"][data-col="${c}"]`);
        if (cell) cell.classList.add('selected');
    }
    
    // Focus first cell
    const firstInput = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"] input`);
    if (firstInput) firstInput.focus();
}

function handleInput(e, row, col) {
    const value = e.target.value.toUpperCase();
    userAnswers[`${row},${col}`] = value;
    
    if (value) {
        // Move to next cell
        if (currentDirection === 'across') {
            moveToCell(row, col + 1);
        } else {
            moveToCell(row + 1, col);
        }
    }
    
    updateProgress();
}

function handleKeyDown(e, row, col) {
    switch(e.key) {
        case 'ArrowRight':
            e.preventDefault();
            moveToCell(row, col + 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            moveToCell(row, col - 1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            moveToCell(row + 1, col);
            break;
        case 'ArrowUp':
            e.preventDefault();
            moveToCell(row - 1, col);
            break;
        case 'Backspace':
            if (!e.target.value) {
                e.preventDefault();
                if (currentDirection === 'across') {
                    moveToCell(row, col - 1);
                } else {
                    moveToCell(row - 1, col);
                }
            }
            break;
    }
}

function moveToCell(row, col) {
    if (row < 0 || row >= currentPuzzle.size || col < 0 || col >= currentPuzzle.size) return;
    if (currentPuzzle.grid[row][col] === '#') return;
    
    const input = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"] input`);
    if (input) {
        input.focus();
        selectCell(row, col);
    }
}

function checkPuzzle() {
    let correct = 0;
    let total = 0;
    
    for (let row = 0; row < currentPuzzle.size; row++) {
        for (let col = 0; col < currentPuzzle.size; col++) {
            if (currentPuzzle.grid[row][col] !== '#') {
                total++;
                const userAnswer = userAnswers[`${row},${col}`] || '';
                const correctAnswer = currentPuzzle.grid[row][col];
                
                const cell = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"]`);
                
                if (userAnswer === correctAnswer) {
                    cell.classList.add('correct');
                    cell.classList.remove('wrong');
                    correct++;
                } else if (userAnswer) {
                    cell.classList.add('wrong');
                    cell.classList.remove('correct');
                }
            }
        }
    }
    
    if (correct === total) {
        updateStatus('🎉 PUZZLE COMPLETE! Perfect score!');
    } else {
        updateStatus(`${correct}/${total} correct (${Math.round(correct/total*100)}%)`);
    }
}

function revealLetter() {
    if (!selectedCell) {
        updateStatus('Select a cell first!');
        return;
    }
    
    const {row, col} = selectedCell;
    const correctAnswer = currentPuzzle.grid[row][col];
    
    const input = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"] input`);
    if (input) {
        input.value = correctAnswer;
        userAnswers[`${row},${col}`] = correctAnswer;
        updateProgress();
    }
}

function revealWord() {
    if (!selectedCell) {
        updateStatus('Select a cell first!');
        return;
    }
    
    // Find which word this cell belongs to
    for (const data of Object.values(currentPuzzle.across)) {
        const {row, col, answer} = data;
        if (selectedCell.row === row && selectedCell.col >= col && selectedCell.col < col + answer.length) {
            // Reveal across word
            for (let i = 0; i < answer.length; i++) {
                const input = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col + i}"] input`);
                if (input) {
                    input.value = answer[i];
                    userAnswers[`${row},${col + i}`] = answer[i];
                }
            }
            updateProgress();
            return;
        }
    }
    
    for (const data of Object.values(currentPuzzle.down)) {
        const {row, col, answer} = data;
        if (selectedCell.col === col && selectedCell.row >= row && selectedCell.row < row + answer.length) {
            // Reveal down word
            for (let i = 0; i < answer.length; i++) {
                const input = document.querySelector(`.crossword-cell[data-row="${row + i}"][data-col="${col}"] input`);
                if (input) {
                    input.value = answer[i];
                    userAnswers[`${row + i},${col}`] = answer[i];
                }
            }
            updateProgress();
            return;
        }
    }
}

function clearGrid() {
    if (!confirm('Clear all answers?')) return;
    
    userAnswers = {};
    document.querySelectorAll('.crossword-cell input').forEach(input => {
        input.value = '';
    });
    document.querySelectorAll('.crossword-cell').forEach(cell => {
        cell.classList.remove('correct', 'wrong');
    });
    updateProgress();
    updateStatus('Grid cleared!');
}

function updateProgress() {
    if (!currentPuzzle) return;
    
    let filled = 0;
    let total = 0;
    
    for (let row = 0; row < currentPuzzle.size; row++) {
        for (let col = 0; col < currentPuzzle.size; col++) {
            if (currentPuzzle.grid[row][col] !== '#') {
                total++;
                if (userAnswers[`${row},${col}`]) filled++;
            }
        }
    }
    
    const progress = total > 0 ? Math.round((filled / total) * 100) : 0;
    document.getElementById('progress').textContent = `${progress}%`;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize with first puzzle
updateStatus('Select a puzzle to begin!');

