// Word Search Game Implementation
// **Timestamp**: 2025-12-04

console.log('Word Search JavaScript loaded successfully!');

let SIZE = 15; // Dynamic based on difficulty
let grid = [];
let words = [];
let foundWords = [];
let currentDifficulty = 'easy';
let currentTheme = 'animals';

// Difficulty settings
const difficulties = {
    easy: {
        size: 10,
        wordCount: 6,
        cellSize: 40,
        directions: [[0, 1], [1, 0]], // Horizontal, Vertical only
        minWordLength: 4,
        maxWordLength: 8,
        description: '10×10 grid, 6 words, horizontal & vertical only'
    },
    medium: {
        size: 15,
        wordCount: 10,
        cellSize: 35,
        directions: [[0, 1], [1, 0], [1, 1], [1, -1]], // + Diagonals
        minWordLength: 5,
        maxWordLength: 12,
        description: '15×15 grid, 10 words, all directions'
    },
    hard: {
        size: 20,
        wordCount: 15,
        cellSize: 30,
        directions: [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]], // All 8 directions
        minWordLength: 6,
        maxWordLength: 15,
        description: '20×20 grid, 15 words, all directions including backwards'
    }
};

const wordLists = {
    animals: ['ELEPHANT', 'GIRAFFE', 'ZEBRA', 'LION', 'TIGER', 'BEAR', 'MONKEY', 'DOLPHIN', 'WHALE', 'SHARK', 
              'PENGUIN', 'KANGAROO', 'LEOPARD', 'CHEETAH', 'RHINOCEROS', 'HIPPOPOTAMUS', 'CROCODILE'],
    countries: ['AUSTRIA', 'GERMANY', 'JAPAN', 'FRANCE', 'ITALY', 'SPAIN', 'CHINA', 'INDIA', 'BRAZIL', 'CANADA',
                'AUSTRALIA', 'SWITZERLAND', 'NETHERLANDS', 'ARGENTINA', 'PORTUGAL', 'SWEDEN'],
    technology: ['COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE', 'PYTHON', 'DATABASE', 'ALGORITHM', 'NETWORK',
                 'JAVASCRIPT', 'PROCESSOR', 'MEMORY', 'STORAGE', 'SECURITY', 'ENCRYPTION'],
    food: ['PIZZA', 'BURGER', 'SUSHI', 'PASTA', 'CHOCOLATE', 'CHEESE', 'BREAD', 'STEAK', 'SALAD', 'APPLE',
           'BANANA', 'STRAWBERRY', 'SANDWICH', 'NOODLES', 'CURRY'],
    sports: ['FOOTBALL', 'BASKETBALL', 'TENNIS', 'BASEBALL', 'HOCKEY', 'GOLF', 'RUGBY', 'CRICKET', 'BOXING',
             'SWIMMING', 'SKIING', 'CYCLING', 'VOLLEYBALL', 'BADMINTON']
};

function generateGrid(wordList) {
    try {
        const difficulty = difficulties[currentDifficulty];
        if (!difficulty) {
            console.error('Invalid difficulty:', currentDifficulty);
            grid = [];
            return false;
        }
        
        SIZE = difficulty.size;
        
        // Filter words by length and limit to wordCount
        // Also ensure words fit in the grid
        const filteredWords = wordList.filter(w => 
            w && 
            w.length >= difficulty.minWordLength && 
            w.length <= difficulty.maxWordLength &&
            w.length <= SIZE // Word must fit in grid
        );
        
        if (filteredWords.length === 0) {
            console.error('No words match difficulty criteria!', {
                difficulty: currentDifficulty,
                size: SIZE,
                minLength: difficulty.minWordLength,
                maxLength: difficulty.maxWordLength
            });
            grid = [];
            return false;
        }
        
        words = filteredWords.slice(0, difficulty.wordCount);
        
        if (words.length === 0) {
            console.error('No words to place!');
            grid = [];
            return false;
        }
        
        // Log for debugging
        console.log(`Generating ${currentDifficulty} grid: ${SIZE}x${SIZE}, ${words.length} words`);
        console.log('Words to place:', words);
        
        grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(''));
        foundWords = [];
        
        // Place words
        words.forEach(word => {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 500;
            
            while (!placed && attempts < maxAttempts) {
                const direction = getRandomDirection();
                if (!direction) {
                    console.error('No direction available!');
                    break;
                }
                
                const pos = getRandomPosition(word.length, direction);
                if (!pos || pos.row === undefined || pos.col === undefined) {
                    attempts++;
                    continue;
                }
                
                if (canPlace(word, pos, direction)) {
                    placeWord(word, pos, direction);
                    placed = true;
                }
                attempts++;
            }
            
            // Log if word couldn't be placed (for debugging)
            if (!placed) {
                console.warn(`Could not place word: ${word} after ${maxAttempts} attempts`);
            }
        });
        
        // Fill empty cells
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (grid[row][col] === '' || !grid[row][col]) {
                    grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }
        
        console.log('Grid generated successfully:', SIZE, 'x', SIZE, 'with', words.length, 'words');
        return true;
    } catch (error) {
        console.error('Error generating grid:', error);
        grid = [];
        return false;
    }
}

function getRandomDirection() {
    const dirs = difficulties[currentDifficulty].directions;
    return dirs[Math.floor(Math.random() * dirs.length)];
}

function getRandomPosition(length, direction) {
    const [dRow, dCol] = direction;
    
    // Ensure word fits in grid
    if (length > SIZE) {
        console.error(`Word length ${length} exceeds grid size ${SIZE}`);
        return null;
    }
    
    // Calculate valid row range
    let minRow, maxRow;
    if (dRow > 0) {
        // Moving down: row can be 0 to SIZE - length
        minRow = 0;
        maxRow = Math.max(0, SIZE - length);
    } else if (dRow < 0) {
        // Moving up: row must be at least length - 1
        minRow = Math.min(SIZE - 1, length - 1);
        maxRow = SIZE - 1;
    } else {
        // No vertical movement: row can be anywhere
        minRow = 0;
        maxRow = SIZE - 1;
    }
    
    // Calculate valid col range
    let minCol, maxCol;
    if (dCol > 0) {
        // Moving right: col can be 0 to SIZE - length
        minCol = 0;
        maxCol = Math.max(0, SIZE - length);
    } else if (dCol < 0) {
        // Moving left: col must be at least length - 1
        minCol = Math.min(SIZE - 1, length - 1);
        maxCol = SIZE - 1;
    } else {
        // No horizontal movement: col can be anywhere
        minCol = 0;
        maxCol = SIZE - 1;
    }
    
    // Ensure valid ranges (safety checks)
    minRow = Math.max(0, Math.min(minRow, SIZE - 1));
    maxRow = Math.max(0, Math.min(maxRow, SIZE - 1));
    minCol = Math.max(0, Math.min(minCol, SIZE - 1));
    maxCol = Math.max(0, Math.min(maxCol, SIZE - 1));
    
    // Ensure min <= max
    if (minRow > maxRow) {
        [minRow, maxRow] = [maxRow, minRow];
    }
    if (minCol > maxCol) {
        [minCol, maxCol] = [maxCol, minCol];
    }
    
    // Final safety check - ensure we have a valid range
    if (minRow < 0 || maxRow >= SIZE || minCol < 0 || maxCol >= SIZE || minRow > maxRow || minCol > maxCol) {
        console.error(`Invalid position range: row[${minRow}, ${maxRow}], col[${minCol}, ${maxCol}], SIZE=${SIZE}, length=${length}`);
        return null;
    }
    
    // Ensure we have valid range
    const rowRange = Math.max(1, maxRow - minRow + 1);
    const colRange = Math.max(1, maxCol - minCol + 1);
    
    return {
        row: minRow + Math.floor(Math.random() * rowRange),
        col: minCol + Math.floor(Math.random() * colRange)
    };
}

function canPlace(word, pos, direction) {
    const [dRow, dCol] = direction;
    
    for (let i = 0; i < word.length; i++) {
        const row = pos.row + i * dRow;
        const col = pos.col + i * dCol;
        
        if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return false;
        if (grid[row][col] !== '' && grid[row][col] !== word[i]) return false;
    }
    return true;
}

function placeWord(word, pos, direction) {
    const [dRow, dCol] = direction;
    
    for (let i = 0; i < word.length; i++) {
        const row = pos.row + i * dRow;
        const col = pos.col + i * dCol;
        grid[row][col] = word[i];
    }
}

function renderWordList() {
    const listElement = document.getElementById('wordList');
    listElement.innerHTML = '';
    
    words.forEach(word => {
        const item = document.createElement('div');
        item.className = 'word-item';
        if (foundWords.includes(word)) item.classList.add('found');
        item.textContent = word;
        listElement.appendChild(item);
    });
    
    if (foundWords.length === words.length) {
        document.getElementById('status').textContent = '🎉 ALL WORDS FOUND!';
    }
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Update button states
    ['easy', 'medium', 'hard'].forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        if (btn) {
            if (d === difficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
    
    // Update info display
    const infoEl = document.getElementById('difficultyInfo');
    if (infoEl) {
        const info = difficulties[difficulty].description;
        infoEl.textContent = info;
    }
    
    // Restart game with new difficulty if already playing
    if (currentTheme) {
        newGame(currentTheme);
    }
}

function newGame(theme) {
    if (theme) {
        currentTheme = theme;
    }
    
    const wordList = wordLists[currentTheme];
    if (!wordList || wordList.length === 0) {
        console.error('No word list found for theme:', currentTheme);
        return;
    }
    
    // Ensure DOM is ready first
    const gridElement = document.getElementById('wordGrid');
    if (!gridElement) {
        console.error('wordGrid element not found, waiting...');
        setTimeout(() => newGame(theme), 100);
        return;
    }
    
    console.log('Calling generateGrid for theme:', theme);
    const success = generateGrid(wordList);
    console.log('generateGrid result:', success, 'grid exists:', !!grid, 'grid length:', grid ? grid.length : 0);

    // Verify grid was generated
    if (!success || !grid || grid.length === 0) {
        console.error('Grid generation failed! Creating fallback grid...');
        // Create a simple fallback grid
        SIZE = 10;
        grid = Array(SIZE).fill(null).map(() =>
            Array(SIZE).fill(null).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
        );
        words = ['TEST', 'WORD', 'GAME'];
        console.log('Created fallback grid');
    }
    
    renderGrid();
    renderWordList();
    
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = `${currentDifficulty.toUpperCase()}: Find ${words.length} words!`;
    }
}

function showHint() {
    const unfound = words.filter(w => !foundWords.includes(w));
    if (unfound.length > 0) {
        alert(`Hint: Look for "${unfound[0]}"`);
    }
}

// Mouse selection for words
let selecting = false;
let selection = [];
let lastSelectedCell = null;

function startSelection(row, col) {
    selecting = true;
    selection = [{row, col}];
    lastSelectedCell = {row, col};
    const gridElement = document.getElementById('wordGrid');
    const index = row * SIZE + col;
    if (gridElement.children[index]) {
        gridElement.children[index].style.background = 'rgba(255, 193, 7, 0.5)';
    }
}

function addToSelection(row, col) {
    if (!selecting) return;
    
    // Check if this cell is adjacent to the last selected cell
    if (lastSelectedCell) {
        const rowDiff = Math.abs(row - lastSelectedCell.row);
        const colDiff = Math.abs(col - lastSelectedCell.col);
        
        // Allow horizontal, vertical, and diagonal (but not jumping)
        if ((rowDiff === 0 && colDiff === 1) || 
            (rowDiff === 1 && colDiff === 0) || 
            (rowDiff === 1 && colDiff === 1)) {
            
            // Check if already in selection (to allow backtracking)
            const exists = selection.some(c => c.row === row && c.col === col);
            if (!exists) {
                selection.push({row, col});
                lastSelectedCell = {row, col};
                const gridElement = document.getElementById('wordGrid');
                const index = row * SIZE + col;
                if (gridElement.children[index]) {
                    gridElement.children[index].style.background = 'rgba(255, 193, 7, 0.5)';
                }
            }
        }
    }
}

function endSelection() {
    if (!selecting) return;
    selecting = false;
    checkSelection();
    clearSelectionHighlight();
    selection = [];
    lastSelectedCell = null;
}

function clearSelectionHighlight() {
    const gridElement = document.getElementById('wordGrid');
    for (let i = 0; i < gridElement.children.length; i++) {
        const cell = gridElement.children[i];
        if (!cell.classList.contains('found')) {
            cell.style.background = '';
        }
    }
}

function checkSelection() {
    if (selection.length < 3) {
        clearSelectionHighlight();
        return;
    }
    
    const word = selection.map(cell => grid[cell.row][cell.col]).join('');
    const reversedWord = word.split('').reverse().join('');
    
    if ((words.includes(word) || words.includes(reversedWord)) && 
        !foundWords.includes(word) && !foundWords.includes(reversedWord)) {
        const foundWord = words.includes(word) ? word : reversedWord;
        foundWords.push(foundWord);
        markFound(selection);
        renderWordList();
        
        // Check if all words found
        if (foundWords.length === words.length) {
            document.getElementById('status').textContent = '🎉 Congratulations! You found all words!';
        } else {
            document.getElementById('status').textContent = `Found: ${foundWords.length}/${words.length} words`;
        }
    } else {
        clearSelectionHighlight();
    }
}

function markFound(cells) {
    const gridElement = document.getElementById('wordGrid');
    cells.forEach(cell => {
        const index = cell.row * SIZE + cell.col;
        if (gridElement.children[index]) {
            gridElement.children[index].classList.add('found');
            gridElement.children[index].style.background = 'rgba(76, 175, 80, 0.5)';
        }
    });
}

function renderGrid() {
    console.log('renderGrid called');
    const gridElement = document.getElementById('wordGrid');
    if (!gridElement) {
        console.error('wordGrid element not found!');
        return;
    }

    console.log('Clearing grid element');
    gridElement.innerHTML = '';

    // If no grid data, create a simple test grid
    if (!grid || grid.length === 0) {
        console.log('No grid data, creating test grid');
        SIZE = 10;
        grid = Array(SIZE).fill(null).map(() =>
            Array(SIZE).fill(null).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
        );
    }

    console.log('Grid data:', grid.length, 'x', grid[0]?.length);

    // Update grid CSS for current size
    const cellSize = difficulties[currentDifficulty] ? difficulties[currentDifficulty].cellSize : 40;
    gridElement.style.gridTemplateColumns = `repeat(${SIZE}, ${cellSize}px)`;
    gridElement.style.gridTemplateRows = `repeat(${SIZE}, ${cellSize}px)`;
    gridElement.style.display = 'grid';
    gridElement.style.gap = '2px';

    console.log(`Setting up grid: ${SIZE}x${SIZE}, cellSize: ${cellSize}px`);

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${Math.max(12, cellSize * 0.4)}px`;
            cell.style.lineHeight = `${cellSize}px`;
            cell.textContent = (grid[row] && grid[row][col]) ? grid[row][col] : 'X';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Simple click handler for testing
            cell.addEventListener('click', () => {
                console.log(`Clicked cell ${row},${col}: ${cell.textContent}`);
                cell.style.background = 'rgba(255, 193, 7, 0.5)';
            });

            gridElement.appendChild(cell);
        }
    }

    console.log(`Rendered ${SIZE}x${SIZE} grid with ${gridElement.children.length} cells`);
    console.log('Grid element:', gridElement);
    console.log('First few cells:', Array.from(gridElement.children).slice(0, 5).map(c => c.textContent));
}

// Initialize when DOM is ready
function initializeWordSearch() {
    console.log('Initializing Word Search...');
    setDifficulty('easy');
    renderGrid(); // Show grid immediately
    renderWordList();
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = 'Click theme buttons to start a new game!';
    }
    console.log('Word Search initialized');
}

// Initialize immediately
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing word search');
    initializeWordSearch();
});

// Fallback initialization
setTimeout(() => {
    const gridElement = document.getElementById('wordGrid');
    if (gridElement && gridElement.children.length === 0) {
        console.log('Fallback initialization triggered');
        initializeWordSearch();
    }
}, 1000);

