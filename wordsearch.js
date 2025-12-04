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
    const difficulty = difficulties[currentDifficulty];
    SIZE = difficulty.size;
    
    // Filter words by length and limit to wordCount
    const filteredWords = wordList.filter(w => 
        w.length >= difficulty.minWordLength && w.length <= difficulty.maxWordLength
    );
    words = filteredWords.slice(0, difficulty.wordCount);
    
    grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(''));
    foundWords = [];
    
    // Place words
    words.forEach(word => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const direction = getRandomDirection();
            const pos = getRandomPosition(word.length, direction);
            
            if (canPlace(word, pos, direction)) {
                placeWord(word, pos, direction);
                placed = true;
            }
            attempts++;
        }
    });
    
    // Fill empty cells
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (grid[row][col] === '') {
                grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }
}

function getRandomDirection() {
    const dirs = difficulties[currentDifficulty].directions;
    return dirs[Math.floor(Math.random() * dirs.length)];
}

function getRandomPosition(length, direction) {
    const [dRow, dCol] = direction;
    const maxRow = dRow >= 0 ? SIZE - length * Math.abs(dRow) : length * Math.abs(dRow);
    const maxCol = dCol >= 0 ? SIZE - length * Math.abs(dCol) : length * Math.abs(dCol);
    
    return {
        row: Math.floor(Math.random() * (maxRow || SIZE)),
        col: Math.floor(Math.random() * (maxCol || SIZE))
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
    const info = difficulties[difficulty].description;
    document.getElementById('difficultyInfo').textContent = info;
    
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
    generateGrid(wordList);
    renderGrid();
    renderWordList();
    
    const diff = difficulties[currentDifficulty];
    document.getElementById('status').textContent = `${currentDifficulty.toUpperCase()}: Find ${words.length} words!`;
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

document.getElementById('wordGrid').addEventListener('mousedown', () => {
    selecting = true;
    selection = [];
});

document.getElementById('wordGrid').addEventListener('mouseup', () => {
    selecting = false;
    checkSelection();
    selection = [];
});

function checkSelection() {
    if (selection.length < 3) return;
    
    const word = selection.map(cell => grid[cell.row][cell.col]).join('');
    
    if (words.includes(word) && !foundWords.includes(word)) {
        foundWords.push(word);
        markFound(selection);
        renderWordList();
    }
}

function markFound(cells) {
    const gridElement = document.getElementById('wordGrid');
    cells.forEach(cell => {
        const index = cell.row * SIZE + cell.col;
        gridElement.children[index].classList.add('found');
    });
}

function renderGrid() {
    const gridElement = document.getElementById('wordGrid');
    gridElement.innerHTML = '';
    
    // Update grid CSS for current size
    const cellSize = difficulties[currentDifficulty].cellSize;
    gridElement.style.gridTemplateColumns = `repeat(${SIZE}, ${cellSize}px)`;
    gridElement.style.gridTemplateRows = `repeat(${SIZE}, ${cellSize}px)`;
    
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${cellSize * 0.5}px`; // Scale font with cell size
            cell.textContent = grid[row][col] || '';
            
            cell.addEventListener('mouseenter', () => {
                if (selecting) {
                    selection.push({row, col});
                    cell.style.background = 'rgba(255, 193, 7, 0.5)';
                }
            });
            
            cell.addEventListener('mouseleave', () => {
                if (!cell.classList.contains('found')) {
                    cell.style.background = '';
                }
            });
            
            gridElement.appendChild(cell);
        }
    }
}

// Initialize with empty grid and set default difficulty
setDifficulty('easy');
renderGrid();

