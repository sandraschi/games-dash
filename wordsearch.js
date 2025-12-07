// Word Search Game Implementation
// **Timestamp**: 2025-12-04

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
            return;
        }
        
        SIZE = difficulty.size;
        
        // Filter words by length and limit to wordCount
        const filteredWords = wordList.filter(w => 
            w && w.length >= difficulty.minWordLength && w.length <= difficulty.maxWordLength
        );
        
        if (filteredWords.length === 0) {
            console.error('No words match difficulty criteria!');
            return;
        }
        
        words = filteredWords.slice(0, difficulty.wordCount);
        
        if (words.length === 0) {
            console.error('No words to place!');
            return;
        }
        
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
    } catch (error) {
        console.error('Error generating grid:', error);
    }
}

function getRandomDirection() {
    const dirs = difficulties[currentDifficulty].directions;
    return dirs[Math.floor(Math.random() * dirs.length)];
}

function getRandomPosition(length, direction) {
    const [dRow, dCol] = direction;
    
    // Calculate valid row range
    let minRow, maxRow;
    if (dRow > 0) {
        // Moving down: row can be 0 to SIZE - length
        minRow = 0;
        maxRow = SIZE - length;
    } else if (dRow < 0) {
        // Moving up: row must be at least length - 1
        minRow = length - 1;
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
        maxCol = SIZE - length;
    } else if (dCol < 0) {
        // Moving left: col must be at least length - 1
        minCol = length - 1;
        maxCol = SIZE - 1;
    } else {
        // No horizontal movement: col can be anywhere
        minCol = 0;
        maxCol = SIZE - 1;
    }
    
    // Ensure valid ranges
    if (minRow < 0) minRow = 0;
    if (maxRow >= SIZE) maxRow = SIZE - 1;
    if (minCol < 0) minCol = 0;
    if (maxCol >= SIZE) maxCol = SIZE - 1;
    
    // Fix invalid ranges
    if (minRow > maxRow) {
        const temp = minRow;
        minRow = maxRow;
        maxRow = temp;
        if (minRow < 0) minRow = 0;
        if (maxRow >= SIZE) maxRow = SIZE - 1;
    }
    if (minCol > maxCol) {
        const temp = minCol;
        minCol = maxCol;
        maxCol = temp;
        if (minCol < 0) minCol = 0;
        if (maxCol >= SIZE) maxCol = SIZE - 1;
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
    
    generateGrid(wordList);
    
    // Verify grid was generated
    if (!grid || grid.length === 0) {
        console.error('Grid generation failed!');
        return;
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
    const gridElement = document.getElementById('wordGrid');
    if (!gridElement) {
        console.error('wordGrid element not found!');
        return;
    }
    
    gridElement.innerHTML = '';
    
    // Ensure grid is initialized
    if (!grid || grid.length === 0) {
        console.error('Grid not initialized!');
        return;
    }
    
    // Update grid CSS for current size
    const cellSize = difficulties[currentDifficulty].cellSize;
    gridElement.style.gridTemplateColumns = `repeat(${SIZE}, ${cellSize}px)`;
    gridElement.style.gridTemplateRows = `repeat(${SIZE}, ${cellSize}px)`;
    gridElement.style.display = 'grid';
    
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${cellSize * 0.5}px`;
            cell.textContent = (grid[row] && grid[row][col]) ? grid[row][col] : '';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Start selection on mousedown
            cell.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startSelection(row, col);
            });
            
            // Add to selection on mouseenter (while dragging)
            cell.addEventListener('mouseenter', () => {
                if (selecting) {
                    addToSelection(row, col);
                }
            });
            
            // End selection on mouseup anywhere
            cell.addEventListener('mouseup', () => {
                endSelection();
            });
            
            gridElement.appendChild(cell);
        }
    }
    
    // Also end selection when mouse leaves the grid
    gridElement.addEventListener('mouseleave', () => {
        endSelection();
    });
    
    // End selection on mouseup anywhere on document (in case mouse leaves grid)
    document.addEventListener('mouseup', () => {
        endSelection();
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

function initializeGame() {
    setDifficulty('easy');
    newGame('animals'); // Generate initial puzzle
}

